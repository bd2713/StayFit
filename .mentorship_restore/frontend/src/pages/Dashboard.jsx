import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Activity, Flame, Trophy, TrendingDown } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const { user } = useAuth();

    // Mock data for charts considering we don't have historical data seeded
    const weightData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Current'],
        datasets: [
            {
                fill: true,
                label: 'Weight (kg)',
                data: [82, 81.5, 80.8, 80.2, 79.5, user?.weight || 79],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { min: 75, max: 85 }
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h1>
                    <p className="mt-2 text-gray-600">Here's your health overview for today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Current Weight</p>
                            <h3 className="text-2xl font-bold text-gray-900">{user?.weight || '--'} kg</h3>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-full text-primary-600">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Calories</p>
                            <h3 className="text-2xl font-bold text-gray-900">320 kcal</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                            <Flame size={24} />
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Workout Streak</p>
                            <h3 className="text-2xl font-bold text-gray-900">4 Days</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Health Score</p>
                            <h3 className="text-2xl font-bold text-gray-900">8.5/10</h3>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                            <Trophy size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Weight Trend</h3>
                    <div className="h-72 w-full">
                        <Line options={chartOptions} data={weightData} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card bg-primary-600 text-white">
                        <h3 className="font-semibold text-lg mb-2">Weekly Goal</h3>
                        <p className="text-primary-100 mb-4">You are on track to lose 0.5kg this week based on your activity and diet.</p>
                        <div className="w-full bg-primary-800 rounded-full h-2.5">
                            <div className="bg-white h-2.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs text-primary-100 mt-2 text-right">70% Completed</p>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4">AI Recommendations</h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-gray-600">
                                <span className="text-primary-500">●</span>
                                Drink 500ml more water today to meet your hydration goal.
                            </li>
                            <li className="flex gap-3 text-sm text-gray-600">
                                <span className="text-primary-500">●</span>
                                Your estimated metabolic rate is slightly higher today; add a 150 kcal healthy snack.
                            </li>
                            <li className="flex gap-3 text-sm text-gray-600">
                                <span className="text-primary-500">●</span>
                                Try to sleep 30 mins earlier tonight for better recovery.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
