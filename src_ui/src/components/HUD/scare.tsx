import React, { useEffect, useState } from 'react';
import scareSound from 'assets/audio/scare.mp3';
import scareGif from 'assets/images/scare.gif';

const Scare: React.FC = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		(window as any).JumpScare = () => {
			setVisible(true);

			// Play sound
			const audio = new Audio(scareSound);
			audio.volume = 1;
			audio.play().catch(() => {}); // Prevent any uncaught promise errors

			// Hide after 5 seconds
			setTimeout(() => {
				setVisible(false);
			}, 5000);
		};
	}, []);

	if (!visible) return null;

	return (
		<div
			className="jumpscare-screen"
			style={{ backgroundImage: `url(${scareGif})` }}
		></div>
	);
};

export default Scare;
