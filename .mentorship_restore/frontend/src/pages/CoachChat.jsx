import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { Send, Bot, User, Trash2 } from 'lucide-react';

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
                                <p>Start a conversation with your AI Health Coach</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-primary-600 shadow-sm'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.message.split('\n').map((line, i) => (
                                            <span key={i} className="block min-h-[1rem]">{line}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[80%]">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-primary-600 shadow-sm">
                                        <Bot size={16} />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 rounded-tl-none shadow-sm flex items-center gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
                                className="flex-1 input-field bg-gray-50 border-gray-200"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="btn-primary flex items-center justify-center w-12 h-12 rounded-xl p-0"
                            >
                                <Send size={20} className="ml-1" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
