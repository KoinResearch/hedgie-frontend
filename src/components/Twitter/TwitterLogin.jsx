import React, { useState } from 'react';
import axios from 'axios';
import './TwitterLogin.css';

const TwitterLogin = ({ onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);

    const handleTwitterLogin = async () => {
        try {
            setLoading(true);

            const initResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/twitter/init`);
            const { authUrl, state } = initResponse.data;

            const popup = window.open(
                authUrl,
                'twitter-login',
                'width=600,height=600,scrollbars=yes,resizable=yes'
            );

            const handleMessage = async (event) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
                    popup.close();

                    try {
                        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/twitter/callback`, {
                            code: event.data.code,
                            state: state
                        });

                        onSuccess(response.data);
                    } catch (error) {
                        onError(error.response?.data?.message || 'Twitter authentication failed');
                    }
                } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
                    popup.close();
                    onError('Twitter authentication was cancelled or failed');
                }

                window.removeEventListener('message', handleMessage);
            };

            window.addEventListener('message', handleMessage);

            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', handleMessage);
                    setLoading(false);
                    onError('Twitter authentication was cancelled');
                }
            }, 1000);

        } catch (error) {
            console.error('Twitter login error:', error);
            onError(error.response?.data?.message || 'Failed to initiate Twitter login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleTwitterLogin}
            disabled={loading}
            className="twitter-login-button"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with X'}
        </button>
    );
};

export default TwitterLogin;
