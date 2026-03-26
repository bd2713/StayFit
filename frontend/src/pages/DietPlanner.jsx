import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { ChefHat, Loader2, Calendar } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';

export default function DietPlanner() {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [targetCalories, setTargetCalories] = useState(2000);

    useEffect(() => {
        const fetchLatestPlan = async () => {
            console.log("Checking for latest diet plan...");
            try {
                const res = await api.get('plans/diet/latest');
                if (res.data && res.data.plan_json) {
                    console.log("Found existing diet plan.");
                    setPlan(res.data.plan_json);
                    if (res.data.daily_calories_target) {
                        setTargetCalories(res.data.daily_calories_target);
                    }
                }
            } catch (err) {
                // 404 is expected if they haven't generated a plan yet
                console.log("No existing diet plan found.");
            }
        };
        fetchLatestPlan();
    }, []);

    const generatePlan = async () => {
        setLoading(true);
        setError('');
        try {
            const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const res = await api.post('plans/diet', {
                week_start_date: weekStart,
                daily_calories_target: targetCalories
            });
            setPlan(res.data.plan_json);
        } catch (err) {
            setError(err.response?.data?.detail || 'Wait, do you have your profile filled out? Please complete your profile first.');
        }
        setLoading(false);
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Diet Planner</h1>
                    <p className="mt-2 text-gray-600">Personalized hyper-local meals based on your metabolism & goals.</p>
                </div>
                <div className="flex gap-3 items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <label className="text-sm text-gray-600 font-medium pl-2">Daily Kcal:</label>
                    <input
                        type="number"
                        value={targetCalories}
                        onChange={e => setTargetCalories(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={generatePlan}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 py-1.5 px-4 rounded-lg ml-1"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <ChefHat size={16} />}
                        Generate
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100">
                    <div className="font-medium">{error}</div>
                </div>
            )}

            {!plan && !loading && !error && (
                <div className="card flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-primary-200 bg-primary-50">
                    <ChefHat size={48} className="text-primary-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No active meal plan</h3>
                    <p className="text-gray-500 max-w-sm mb-6">Let our AI nutritionist design a perfect 7-day meal plan tailored to your profile and preferred calories.</p>
                    <button onClick={generatePlan} className="btn-primary text-lg px-8">Generate Weekly Plan</button>
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-20 bg-gray-100 rounded"></div>
                                <div className="h-20 bg-gray-100 rounded"></div>
                                <div className="h-20 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {plan && plan.days && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {plan.days.map((day, idx) => (
                        <div key={idx} className="card border-t-4 border-t-primary-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                <Calendar className="text-primary-500" size={18} />
                                <h3 className="font-bold text-lg text-gray-900">{day.day}</h3>
                            </div>

                            <div className="space-y-4">
                                {day.meals?.map((meal, mIdx) => (
                                    <div key={mIdx} className="bg-gray-50 rounded-lg p-3 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-400"></div>
                                        <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">{meal.type}</h4>
                                        <p className="text-sm font-medium text-gray-800 leading-tight mb-2">{meal.name}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs font-bold text-gray-900">{meal.calories} kcal</span>
                                            <div className="flex gap-2 text-[10px] text-gray-500 font-medium">
                                                <span className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">P:{meal.macros?.p}g</span>
                                                <span className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">C:{meal.macros?.c}g</span>
                                                <span className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">F:{meal.macros?.f}g</span>
                                            </div>
                                        </div>
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
