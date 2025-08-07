import React from 'react';
import images from 'utils/images';

export default function BankLogo() {
	return (
		<div className="bank_logo">
			<img src={images.getImage('redbank.svg')} alt="EmpireBank" />

			<h1>Bank</h1>
		</div>
	);
}
