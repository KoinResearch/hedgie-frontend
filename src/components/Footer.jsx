import React, { useState, useEffect, useRef } from 'react';
import './Footer.css';

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);
    const footerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsVisible(entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.1,
            }
        );

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current);
            }
        };
    }, []);

    return (
        <footer ref={footerRef} className={`footer ${isVisible ? 'visible' : 'hidden'}`}>
            <div className="footer-text">
                © 2024 Hedgie.org. Not financial advice.
            </div>
            {/*<div className="footer-links">*/}
            {/*    <a href="/terms">Terms</a>*/}
            {/*    <a href="/blog">Blog</a>*/}
            {/*    <a href="/twitter">Twitter</a>*/}
            {/*</div>*/}
        </footer>
    );
};

export default Footer;
