import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await api.get('profile');
                setUser(res.data);
            } catch (err) {
                // If profile fetch fails, they might not have a profile yet, or token is invalid
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else if (err.response?.status === 404) {
                    // Token is valid but no profile exists
                    setUser({ email: "user@example.com", needsProfile: true }); // Placeholder
                }
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await api.post('auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        localStorage.setItem('token', res.data.access_token);
        await checkUser();
        navigate('/dashboard');
    };

    const register = async (email, password) => {
        await api.post('auth/register', { email, password });
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
