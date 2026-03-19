import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Profile() {
    const { user, checkUser } = useAuth();
    const [formData, setFormData] = useState({
        age: '', gender: 'Male', height: '', weight: '', body_fat: '',
        dietary_preference: 'Omnivore', allergies: '', medical_conditions: '',
        fitness_goal: 'Fat Loss', activity_level: 'Moderate', sleep_hours: '', stress_level: 'Medium'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user && !user.needsProfile) {
            setFormData({
                age: user.age || '',
                gender: user.gender || 'Male',
                height: user.height || '',
                weight: user.weight || '',
                body_fat: user.body_fat || '',
                dietary_preference: user.dietary_preference || 'Omnivore',
                allergies: user.allergies || '',
                medical_conditions: user.medical_conditions || '',
                fitness_goal: user.fitness_goal || 'Fat Loss',
                activity_level: user.activity_level || 'Moderate',
                sleep_hours: user.sleep_hours || '',
                stress_level: user.stress_level || 'Medium',
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Prepare data: convert empty strings to null for numeric/optional fields
        const payload = {
            ...formData,
            age: parseInt(formData.age),
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            body_fat: formData.body_fat ? parseFloat(formData.body_fat) : null,
            sleep_hours: parseFloat(formData.sleep_hours),
            allergies: formData.allergies || null,
            medical_conditions: formData.medical_conditions || null
        };

        try {
            if (user?.needsProfile) {
                await api.post('profile', payload);
            } else {
                await api.put('profile', payload);
            }
            setMessage('Profile saved successfully!');
            await checkUser();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.detail || 'Failed to save profile. Please check the inputs.');
        }
        setLoading(false);
    };

    return (
        <Layout>
            <div className="mb-8 p-4">
                <h1 className="text-3xl font-bold text-gray-900">Health Profile</h1>
                <p className="mt-2 text-sm text-gray-600">Provide details for accurate AI recommendations.</p>
            </div>

            <div className="card max-w-4xl mx-auto">
                {message && (
                    <div className={`p-4 mb-6 rounded-md ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} required className="mt-1 input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 input-field">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} required className="mt-1 input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} required className="mt-1 input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Body Fat % (Optional)</label>
                        <input type="number" step="0.1" name="body_fat" value={formData.body_fat} onChange={handleChange} className="mt-1 input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dietary Preference</label>
                        <select name="dietary_preference" value={formData.dietary_preference} onChange={handleChange} className="mt-1 input-field">
                            <option value="Omnivore">Omnivore</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Pescatarian">Pescatarian</option>
                            <option value="Keto">Keto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Allergies</label>
                        <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Dairy" className="mt-1 input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                        <input type="text" name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} placeholder="e.g. Hypertension, Diabetes" className="mt-1 input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fitness Goal</label>
                        <select name="fitness_goal" value={formData.fitness_goal} onChange={handleChange} className="mt-1 input-field">
                            <option value="Fat Loss">Fat Loss</option>
                            <option value="Muscle Gain">Muscle Gain</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Endurance">Endurance</option>
                            <option value="General Health">General Health</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                        <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="mt-1 input-field">
                            <option value="Sedentary">Sedentary</option>
                            <option value="Light">Light</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Active">Active</option>
                            <option value="Very Active">Very Active</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Average Sleep (Hours)</label>
                        <input type="number" step="0.5" name="sleep_hours" value={formData.sleep_hours} onChange={handleChange} required className="mt-1 input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stress Level</label>
                        <select name="stress_level" value={formData.stress_level} onChange={handleChange} className="mt-1 input-field">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="col-span-1 md:col-span-2 mt-4">
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
                            {loading ? 'Saving...' : 'Save Profile Dashboard'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
