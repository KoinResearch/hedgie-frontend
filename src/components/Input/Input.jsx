import React, { useState } from 'react';
import './Input.css';
import Error from '../../assets/Error.jsx';
import Eye from '../../assets/Eye.jsx';

const Input = ({
	type = 'text',
	label,
	placeholder,
	value,
	onChange,
	error,
	required = false,
	className = '',
	...props
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const [isValid, setIsValid] = useState(true);

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleChange = (e) => {
		const newValue = e.target.value;

		if (type === 'email') {
			if (newValue) {
				const valid = validateEmail(newValue);
				setIsValid(valid);
			} else {
				setIsValid(true);
			}
		}

		onChange(e);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const inputType = type === 'password' && showPassword ? 'text' : type;
	const inputId = `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

	const hasValidationError = type === 'email' && !isValid && value;
	const hasUserError = error;

	return (
		<div className={`input-field ${className}`}>
			{label && (
				<label
					htmlFor={inputId}
					className="input__label"
				>
					{label}
				</label>
			)}

			<div className="input__container">
				<input
					id={inputId}
					type={inputType}
					placeholder={placeholder}
					value={value}
					onChange={handleChange}
					className={`input__field ${hasValidationError || hasUserError ? 'input__field--error' : ''}`}
					required={required}
					{...props}
				/>

				{type === 'password' && (
					<button
						type="button"
						className="input__toggle-password"
						onClick={togglePasswordVisibility}
					>
						{showPassword ? <Eye /> : <Eye />}
					</button>
				)}
			</div>

			{hasValidationError && (
				<div className="input__error">
					<Error />
					<span>Invalid Email</span>
				</div>
			)}

			{hasUserError && (
				<div className="input__error">
					<Error />
					<span>{error}</span>
				</div>
			)}
		</div>
	);
};

export default Input;
