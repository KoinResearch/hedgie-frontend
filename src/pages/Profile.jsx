import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import './Profile.css';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/api/auth/me');
                setUserData(response.data.user);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Получаем первые буквы имени для аватара
    const getInitials = (name) => {
        return name
            ? name.split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
            : 'U';
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Основная информация */}
                <div className="profile-header">
                    <div className="avatar">
                        {getInitials(userData?.firstName)}
                    </div>
                    <div className="user-info">
                        <h1>{userData?.firstName || 'User'} {userData?.lastName || ''}</h1>
                        <span className="user-email">{userData?.email}</span>
                    </div>
                </div>

                {/* Основные данные */}
                <div className="info-cards">
                    <div className="info-card">
                        <h3>Account Details</h3>
                        <div className="info-item">
                            <span className="label">Email</span>
                            <span className="value">{userData?.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Member Since</span>
                            <span className="value">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>Roles</h3>
                        <div className="roles-container">
                            {userData?.roles?.map((role, index) => (
                                <span key={index} className="role-badge">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Действия */}
                <div className="profile-actions">
                    <button
                        className="edit-button"
                        onClick={() => alert('Edit profile clicked')}
                    >
                        Edit Profile
                    </button>
                    <button
                        className="logout-button"
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;