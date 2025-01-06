import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import Flow from './pages/Flow';
import Metrics from './pages/Metrics';
import Home from './pages/Home';
import './App.css';
import DataLab from "./pages/DataLab.jsx";
import BlockFlow from "./pages/BlockFlow.jsx";
import { AuthProvider } from './components/AuthContext.jsx';
import Profile from "./pages/Profile.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    useEffect(() => {
        const setScale = () => {
            document.body.style.zoom = "100%";
        };

        window.onload = setScale;

        return () => {
            window.onload = null;
        };
    }, []);

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                             cookiePolicy={'single_host_origin'}
        >
            <AuthProvider>
        <Router>
            <div className="App">
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Metrics />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/flow" element={<Flow />} />
                        <Route path="/metrics/*" element={<Metrics />} />
                        <Route path="/home" element={<Home />} />
                        <Route
                            path="/datalab"
                            element={
                                <ProtectedRoute>
                                    <DataLab />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/blockflow" element={<BlockFlow />} />
                    </Routes>
                </main>
            </div>
            <Footer />
        </Router>
        </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
