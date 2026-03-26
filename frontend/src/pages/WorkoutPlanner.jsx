import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { Dumbbell, Loader2, PlayCircle, Clock } from 'lucide-react';

export default function WorkoutPlanner() {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLatestWorkout = async () => {
            console.log("Checking for latest workout plan...");
            try {
                const res = await api.get('plans/workout/latest');
                if (res.data && res.data.plan_json) {
                    console.log("Found existing workout plan.");
                    setPlan(res.data.plan_json);
                }
            } catch (err) {
                // 404 is expected if they haven't generated a plan yet
                console.log("No existing workout plan found.");
            }
        };
        fetchLatestWorkout();
    }, []);

    const generatePlan = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('plans/workout', {});
            setPlan(res.data.plan_json);
        } catch (err) {
            setError(err.response?.data?.detail || 'Please complete your profile first.');
        }
        setLoading(false);
    };

    return (
        <Layout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Workout Planner</h1>
                    <p className="mt-2 text-gray-600">Adaptive routines tailored for your fitness level and goals.</p>
                </div>
                <button
                    onClick={generatePlan}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Dumbbell size={20} />}
                    Generate New Routine
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {!plan && !loading && !error && (
                <div className="card flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-primary-200 bg-primary-50">
                    <Dumbbell size={48} className="text-primary-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No active workout plan</h3>
                    <p className="text-gray-500 max-w-sm mb-6">Ready to sweat? Let our AI trainer build a completely custom workout routine for you based on your body profile.</p>
                    <button onClick={generatePlan} className="btn-primary text-lg px-8">Build My Workout</button>
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="card animate-pulse h-64 bg-gray-50"></div>
                    ))}
                </div>
            )}

            {plan && plan.workouts && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plan.workouts.map((day, idx) => (
                        <div key={idx} className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50 border-t-4 border-t-primary-600">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{day.day}</h3>
                                    <p className="text-sm font-semibold text-primary-600 tracking-wide uppercase mt-1">{day.focus}</p>
                                </div>
                                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                                    <PlayCircle size={20} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {day.exercises?.map((ex, eIdx) => (
                                    <div key={eIdx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                                        <h4 className="font-bold text-gray-800 text-base mb-2">{ex.name}</h4>

                                        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                                            <div className="bg-gray-50 py-1.5 rounded-lg border border-gray-100">
                                                <span className="block text-xs text-gray-500 mb-0.5">Sets</span>
                                                <span className="font-bold text-gray-800">{ex.sets}</span>
                                            </div>
                                            <div className="bg-gray-50 py-1.5 rounded-lg border border-gray-100">
                                                <span className="block text-xs text-gray-500 mb-0.5">Reps</span>
                                                <span className="font-bold text-gray-800">{ex.reps}</span>
                                            </div>
                                            <div className="bg-primary-50 py-1.5 rounded-lg border border-primary-100">
                                                <span className="block text-xs text-primary-600 mb-0.5">Rest</span>
                                                <span className="font-bold text-primary-700">{ex.rest_seconds}s</span>
                                            </div>
                                        </div>

                                        {ex.tips && (
                                            <p className="text-xs text-gray-500 flex items-start gap-1.5 bg-gray-50 p-2 rounded-lg">
                                                <span className="text-primary-500 font-bold">Tip:</span>
                                                {ex.tips}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
