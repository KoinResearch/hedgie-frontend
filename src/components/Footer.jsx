import React, { useState, useEffect } from 'react';
import './Footer.css';

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;
            setIsVisible(scrolledToBottom);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <footer className={`footer ${isVisible ? 'visible' : ''}`}>
            <div className="footer-container">
                <div className="footer-text">
                    © 2024 Hedgie.org. Not financial advice.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
