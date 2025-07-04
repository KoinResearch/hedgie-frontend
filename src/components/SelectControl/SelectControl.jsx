import React from 'react';
import './SelectControl.css';
import Arrow from '../../assets/Arrow';

const SelectControl = ({ value, onChange, options, placeholder }) => {
	return (
		<div className="select-control">
			<select
				value={value}
				onChange={onChange}
				className={`select-control__select`}
			>
				{options.map((option) => (
					<option
						key={option.value}
						value={option.value}
					>
						{option.label || option.value}
					</option>
				))}
			</select>
			<Arrow direction="bottom" />
		</div>
	);
};

export default SelectControl;
