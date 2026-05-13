import React, { useEffect, useState } from 'react';

const Scare: React.FC = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		(window as any).JumpScare = () => {
			setVisible(true);

			setTimeout(() => {
				setVisible(false);
			}, 5000);
		};
	}, []);

	if (!visible) return null;

	return (
		<div
			className="jumpscare-screen"
		></div>
	);
};

export default Scare;
