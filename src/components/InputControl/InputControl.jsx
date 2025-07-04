import React from 'react';
import './InputControl.css';
import Arrow from '../../assets/Arrow';

const InputControl = ({
	type = 'text',
	value,
	onChange,
	placeholder,
	disabled = false,
	min,
	max,
	step,
	id,
	name,
	required = false,
	onFocus,
	onBlur,
	...rest
}) => {
	return (
		<div className="input-control">
			<input
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className={`input-control__input`}
				disabled={disabled}
				min={min}
				max={max}
				step={step}
				id={id}
				name={name}
				required={required}
				onFocus={onFocus}
				onBlur={onBlur}
				{...rest}
			></input>
		</div>
	);
};

export default InputControl;
