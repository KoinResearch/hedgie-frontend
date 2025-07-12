import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TwitterCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('Twitter callback received:', { code: !!code, state, error });

        if (error) {
            console.error('Twitter auth error:', error);
            window.opener?.postMessage({
                type: 'TWITTER_AUTH_ERROR',
                error: error
            }, window.location.origin);
            window.close();
            return;
        }

        if (code && state) {
            console.log('Sending success message to parent');
            window.opener?.postMessage({
                type: 'TWITTER_AUTH_SUCCESS',
                code: code,
                state: state
            }, window.location.origin);
            window.close();
        } else {
            console.error('Missing code or state');
            window.opener?.postMessage({
                type: 'TWITTER_AUTH_ERROR',
                error: 'Missing authorization code or state'
            }, window.location.origin);
            window.close();
        }
    }, [location]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Paloseco, sans-serif',
            backgroundColor: 'black',
            color: 'white'
        }}>
            <div>Processing Twitter authentication...</div>
        </div>
    );
};

export default TwitterCallback;
