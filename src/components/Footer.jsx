import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-text">
                © 2024 Hedgie.org. All rights reserved.
            </div>
            <div className="footer-links">
                <a href="/terms">Terms</a>
                <a href="/blog">Blog</a>
                <a href="/twitter">Twitter</a>
            </div>
        </footer>
    );
};

export default Footer;
