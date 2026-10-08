import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { Send, Bot, User, Trash2 } from 'lucide-react';

function cleanLatex(text) {
    if (!text) return "";
    let str = text;
    // Replace \frac{a}{b} with (a / b)
    str = str.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
    // Strip LaTeX text / formatting wrappers
    str = str.replace(/\\(?:text|mathrm|mathbf|textbf|mathit|textnormal)\{([^}]+)\}/g, '$1');
    // Replace mathematical symbols
    str = str.replace(/\\times/g, '×');
    str = str.replace(/\\cdot/g, '·');
    str = str.replace(/\\approx/g, '≈');
    str = str.replace(/\\le(?:q)?\b/g, '≤');
    str = str.replace(/\\ge(?:q)?\b/g, '≥');
    str = str.replace(/\\neq\b/g, '≠');
    str = str.replace(/\\pm\b/g, '±');
    str = str.replace(/\\div\b/g, '÷');
    str = str.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
    str = str.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
    str = str.replace(/\\quad/g, '  ');
    str = str.replace(/\\[,;\s]/g, ' ');
    // Remove leftover backslashes
    str = str.replace(/\\([a-zA-Z]+)/g, '$1');
    return str;
}

function cleanInlineMath(str) {
    if (!str) return str;
    let s = str;
    // Convert \( ... \)
    s = s.replace(/\\\((.*?)\\\)/g, (m, g1) => cleanLatex(g1));
    // Convert inline $...$
    s = s.replace(/\$([^\$\n]+)\$/g, (m, g1) => cleanLatex(g1));
    return cleanLatex(s);
}

function FormattedText({ text }) {
    if (!text) return null;

    const renderInline = (str) => {
        if (!str) return null;
        const cleanedStr = cleanInlineMath(str);
        const tokens = cleanedStr.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

        return tokens.map((token, idx) => {
            if (token.startsWith('**') && token.endsWith('**')) {
                return <strong key={idx} className="font-bold text-gray-900">{token.slice(2, -2)}</strong>;
            } else if (token.startsWith('*') && token.endsWith('*') && !token.startsWith('**')) {
                return <em key={idx} className="italic text-gray-600">{token.slice(1, -1)}</em>;
            } else if (token.startsWith('`') && token.endsWith('`')) {
                return <code key={idx} className="px-1.5 py-0.5 bg-gray-100 text-primary-700 rounded text-xs font-mono">{token.slice(1, -1)}</code>;
            }
            return token;
        });
    };

    const rawLines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];
    let inMath = false;
    let mathLines = [];

    const flushTable = () => {
        if (tableRows.length > 0) {
            const header = tableRows[0];
            const body = tableRows.slice(1);
            elements.push(
                <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full text-left text-xs border-collapse bg-white">
                        <thead className="bg-primary-50 text-primary-900 border-b border-gray-200">
                            <tr>
                                {header.map((cell, cIdx) => (
                                    <th key={cIdx} className="px-3.5 py-2.5 font-semibold">
                                        {renderInline(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {body.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-3.5 py-2 text-gray-700">
                                            {renderInline(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
        }
    };

    const flushMath = () => {
        if (mathLines.length > 0) {
            const mathContent = mathLines.map(cleanLatex).join('\n').trim();
            if (mathContent) {
                elements.push(
                    <div
                        key={`math-${elements.length}`}
                        className="my-2.5 px-4 py-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl font-mono text-emerald-950 text-xs sm:text-sm overflow-x-auto shadow-sm whitespace-pre-wrap leading-relaxed tracking-wide"
                    >
                        {mathContent}
                    </div>
                );
            }
            mathLines = [];
        }
    };

    for (let i = 0; i < rawLines.length; i++) {
        let line = rawLines[i].trim();

        // Check for math block start/end: \[ ... \] or $$ ... $$
        if (line === '\\[' || line === '$$') {
            if (inTable) { inTable = false; flushTable(); }
            inMath = true;
            mathLines = [];
            continue;
        }
        if (line === '\\]' || (inMath && line === '$$')) {
            inMath = false;
            flushMath();
            continue;
        }
        if (line.startsWith('\\[') && line.endsWith('\\]')) {
            if (inTable) { inTable = false; flushTable(); }
            const inner = line.slice(2, -2).trim();
            elements.push(
                <div
                    key={`math-${elements.length}`}
                    className="my-2.5 px-4 py-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl font-mono text-emerald-950 text-xs sm:text-sm overflow-x-auto shadow-sm whitespace-pre-wrap leading-relaxed tracking-wide"
                >
                    {cleanLatex(inner)}
                </div>
            );
            continue;
        }
        if (inMath) {
            if (line.endsWith('\\]')) {
                mathLines.push(line.slice(0, -2));
                inMath = false;
                flushMath();
            } else {
                mathLines.push(line);
            }
            continue;
        }

        // Detect Markdown Tables
        if (line.startsWith('|') && line.endsWith('|')) {
            inTable = true;
            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            if (!cells.every(c => /^[-:]+$/.test(c))) {
                tableRows.push(cells);
            }
            continue;
        } else if (inTable) {
            inTable = false;
            flushTable();
        }

        if (!line) {
            elements.push(<div key={`sp-${i}`} className="h-2" />);
            continue;
        }

        // Headings
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={`h3-${i}`} className="font-bold text-base text-primary-800 mt-3 mb-1.5 flex items-center gap-1.5">
                    {renderInline(line.slice(4))}
                </h3>
            );
        } else if (line.startsWith('## ')) {
            elements.push(
                <h2 key={`h2-${i}`} className="font-bold text-lg text-gray-900 mt-4 mb-2 pb-1 border-b border-gray-100">
                    {renderInline(line.slice(3))}
                </h2>
            );
        } else if (line.startsWith('# ')) {
            elements.push(
                <h1 key={`h1-${i}`} className="font-extrabold text-xl text-gray-900 mt-4 mb-2">
                    {renderInline(line.slice(2))}
                </h1>
            );
        }
        // Horizontal Rules
        else if (line.startsWith('---') || line.startsWith('***')) {
            elements.push(<hr key={`hr-${i}`} className="my-3 border-gray-200" />);
        }
        // Bullet points
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            elements.push(
                <div key={`li-${i}`} className="flex items-start gap-2 my-1 text-gray-800">
                    <span className="text-primary-500 font-bold mt-0.5">•</span>
                    <span className="flex-1">{renderInline(line.slice(2))}</span>
                </div>
            );
        }
        // Numbered list items (1., 2., etc.)
        else if (/^\d+\.\s/.test(line)) {
            const numMatch = line.match(/^(\d+)\.\s/);
            const num = numMatch ? numMatch[1] : '1';
            const content = line.replace(/^\d+\.\s/, '');
            elements.push(
                <div key={`oli-${i}`} className="flex items-start gap-2 my-1 text-gray-800">
                    <span className="font-bold text-primary-600 min-w-[1.2rem]">{num}.</span>
                    <span className="flex-1">{renderInline(content)}</span>
                </div>
            );
        }
        // Regular paragraphs
        else {
            elements.push(
                <p key={`p-${i}`} className="my-1 text-gray-800 leading-relaxed">
                    {renderInline(line)}
                </p>
            );
        }
    }

    if (inTable) flushTable();
    if (inMath) flushMath();

    return <div className="space-y-0.5 text-sm">{elements}</div>;
}

export default function CoachChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('chat');
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch chat history", err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to clear your chat history? This cannot be undone.")) return;

        setResetting(true);
        try {
            await api.delete('/chat');
            setMessages([]);
        } catch (err) {
            console.error("Failed to reset chat", err);
            alert("Failed to reset chat history. Please try again.");
        }
        setResetting(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', message: userMessage }]);
        setLoading(true);

        try {
            const res = await api.post('chat/message', { message: userMessage });
            setMessages(prev => [...prev, res.data]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', message: "Sorry, I am having trouble connecting right now." }]);
        }
        setLoading(false);
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Health Coach</h1>
                        <p className="mt-1 text-sm text-gray-600">Ask questions about diet, workouts, or general health.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        disabled={resetting || messages.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Clear conversation history"
                    >
                        <Trash2 size={16} />
                        New Conversation
                    </button>
                </div>

                <div className="flex-1 card flex flex-col overflow-hidden bg-white shadow-sm border border-gray-200">
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Bot size={48} className="mb-4 text-primary-300" />
                                <p className="font-medium text-gray-600">Start a conversation with your AI Health Coach</p>
                                <p className="text-xs text-gray-400 mt-1">Ask for diet recommendations, workout routines, or advice.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[88%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-primary-600 shadow-sm'
                                        }`}>
                                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <p className="whitespace-pre-wrap">{msg.message}</p>
                                        ) : (
                                            <FormattedText text={msg.message} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[80%]">
                                    <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-white border border-gray-200 text-primary-600 shadow-sm">
                                        <Bot size={18} />
                                    </div>
                                    <div className="px-5 py-4 rounded-2xl bg-white border border-gray-200 text-gray-500 rounded-tl-none shadow-sm flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your diet, health, or workout..."
                                className="flex-1 input-field bg-gray-50 border-gray-200 text-sm focus:bg-white transition-colors"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="btn-primary flex items-center justify-center w-12 h-12 rounded-xl p-0 transition-transform active:scale-95"
                            >
                                <Send size={18} className="ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
