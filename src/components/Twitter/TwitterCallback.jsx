import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TwitterCallback = () => {
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (code) {
            window.opener?.postMessage({
                type: 'TWITTER_AUTH_SUCCESS',
                code: code
            }, window.location.origin);
        } else if (error) {
            window.opener?.postMessage({
                type: 'TWITTER_AUTH_ERROR',
                error: error
            }, window.location.origin);
        }

        window.close();
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
