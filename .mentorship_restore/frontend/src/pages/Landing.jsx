import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Brain, LineChart, MessageSquare } from 'lucide-react';

export default function Landing() {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (user) return <Navigate to="/dashboard" />;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-primary-100">
            <div className="max-w-4xl text-center px-4 space-y-8">
                <div className="mb-4">
                    <span className="text-primary-600 font-bold text-2xl">StayFit</span>
                    <span className="text-gray-400 text-sm ml-2">by Bhuvan Dixit</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-dark-900 tracking-tight">
                    Your Personal <span className="text-primary-600">AI Health Coach</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Personalized diet plans, adaptive workout routines, and intelligent habit tracking all in one perfectly designed platform.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 pb-12">
                    {[{ icon: Brain, title: 'AI Diet Planner' }, { icon: Activity, title: 'Smart Workouts' }, { icon: LineChart, title: 'Progress Tracking' }, { icon: MessageSquare, title: 'AI Chat Coach' }].map((item, i) => (
                        <div key={i} className="glass-card flex flex-col items-center gap-3">
                            <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                                <item.icon size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Link to="/register" className="btn-primary text-lg px-8 py-3">Get Started</Link>
                    <Link to="/login" className="btn-secondary text-lg px-8 py-3">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
