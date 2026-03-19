import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Utensils, Dumbbell, MessageSquare, User, LogOut } from 'lucide-react';

export default function Layout({ children }) {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Diet Plan', href: '/diet', icon: Utensils },
        { name: 'Workout Plan', href: '/workout', icon: Dumbbell },
        { name: 'AI Coach', href: '/coach', icon: MessageSquare },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-10">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex flex-col px-4 mb-8">
                        <span className="text-2xl font-bold text-primary-600">StayFit</span>
                        <span className="text-xs text-gray-500 font-medium">by Bhuvan Dixit</span>
                    </div>
                    <nav className="mt-5 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors`}
                                >
                                    <item.icon
                                        className={`${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                                            } mr-3 flex-shrink-0 h-6 w-6`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <button
                        onClick={logout}
                        className="flex-shrink-0 w-full group block text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        <LogOut className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="pl-64 flex flex-col flex-1 w-full relative">
                <main className="flex-1 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
