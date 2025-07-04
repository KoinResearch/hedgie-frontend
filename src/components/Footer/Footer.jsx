import React from 'react';
import { useLocation } from 'react-router-dom';
import { isAuthPage } from '../../utils/authUtils';
import './Footer.css';

const Footer = () => {
	const location = useLocation();
	const isAuth = isAuthPage(location.pathname);

	return (
		<footer className={`footer ${isAuth ? 'footer--auth' : ''}`}>
			<div className="footer__container">
				<div className="footer__text">
					© <span className="footer__year">2025</span> Hedgie.org. Not financial advice.
				</div>
			</div>
		</footer>
	);
};

export default Footer;
