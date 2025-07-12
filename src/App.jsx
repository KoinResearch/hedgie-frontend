import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import MobileNavigation from './components/MobileNavigation/MobileNavigation';
import Register from './pages/auth/Register.jsx';
import Login from './pages/auth/Login.jsx';
import Flow from './pages/Flow';
import Metrics from './pages/Metrics';
import './App.css';
import DataLab from './pages/DataLab.jsx';
import BlockFlow from './pages/BlockFlow.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { TradeProvider } from './contexts/TradeContext';
import { FilterProvider } from './contexts/FilterContext';
import Profile from './pages/Profile.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import { isAuthPage } from './utils/authUtils';

const ProtectedRoute = ({ children }) => {
	const token = localStorage.getItem('accessToken');
	if (!token) {
		return <Navigate to="/login" />;
	}
	return children;
};

const AppContent = () => {
	const location = useLocation();
	const isAuth = isAuthPage(location.pathname);

	return (
		<>
			<Header />
			<div className={`content ${isAuth ? 'content-auth' : ''}`}>
				<Routes>
					<Route
						path="/"
						element={<Navigate to="/metrics" />}
					/>
					<Route
						path="/login"
						element={<Login />}
					/>
					<Route
						path="/register"
						element={<Register />}
					/>
					<Route
						path="/forgot-password"
						element={<ForgotPassword />}
					/>
					<Route
						path="/reset-password/:token"
						element={<ResetPassword />}
					/>
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/flow"
						element={<Flow />}
					/>
					<Route
						path="/metrics/*"
						element={<Metrics />}
					/>
					<Route
						path="/datalab"
						element={
							<ProtectedRoute>
								<DataLab />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/blockflow"
						element={<BlockFlow />}
					/>
					<Route
						path="/auth/twitter/callback"
						element={<TwitterCallback />}
					/>
				</Routes>
				<MobileNavigation />
			</div>
		</>
	);
};

function App() {
	return (
		<GoogleOAuthProvider
			clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
			cookiePolicy={'single_host_origin'}
		>
			<AuthProvider>
				<TradeProvider>
					<FilterProvider>
						<Router>
							<AppContent />
						</Router>
					</FilterProvider>
				</TradeProvider>
			</AuthProvider>
		</GoogleOAuthProvider>
	);
}

export default App;
