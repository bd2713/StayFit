import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages (to be implemented)
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DietPlanner from './pages/DietPlanner'
import WorkoutPlanner from './pages/WorkoutPlanner'
import CoachChat from './pages/CoachChat'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return children;
}

function App() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 w-full">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/diet" element={<ProtectedRoute><DietPlanner /></ProtectedRoute>} />
                    <Route path="/workout" element={<ProtectedRoute><WorkoutPlanner /></ProtectedRoute>} />
                    <Route path="/coach" element={<ProtectedRoute><CoachChat /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    )
}

export default App
