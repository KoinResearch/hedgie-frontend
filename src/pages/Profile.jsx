// pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/axios';

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
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <h1>Welcome, {userData?.firstName || 'User'}!</h1>
            <div className="profile-info">
                <div>
                    <strong>Email:</strong> {userData?.email}
                </div>
                {userData?.roles && (
                    <div>
                        <strong>Role:</strong> {userData.roles.join(', ')}
                    </div>
                )}
            </div>
            <button onClick={() => {
                localStorage.clear();
                window.location.href = '/signin';
            }}>
                Logout
            </button>
        </div>
    );
};

export default Profile;