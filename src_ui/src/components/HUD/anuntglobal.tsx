import React, { useEffect, useState } from 'react';
// import sound from 'assets/audio/anuntgloballast.mp3';

const TickerNotification: React.FC = () => {
	const [text, setText] = useState('');
	const [visible, setVisible] = useState(false);
	const [animationDuration, setAnimationDuration] = useState('20s');

useEffect(() => {
    (window as any).AnuntGlobal = (message: string, duration: number) => {
        // const audio = new Audio(sound);
        // audio.volume = 0.5;
        // audio.play().catch(() => {});

        setText(message);
        setAnimationDuration(`${duration}s`);
        setVisible(true);

        setTimeout(() => {
            setVisible(false);
        }, duration * 1000); // exact cât durează mesajul
    };
}, []);


	return (
		<>
			<div
				className="ticker-container"
				style={{
					width: visible ? '100%' : '0px',
					transition: 'width 1s ease',
					overflow: 'hidden',
					position: 'relative',
				}}
			>
				<div
					className="ticker-text"
					style={{
						opacity: visible ? 1 : 0,
						animation: visible ? `scrollText ${animationDuration} linear forwards` : 'none',
					}}
				>
					<b>{text}</b>
				</div>
			</div>
		</>
	);
};

export default TickerNotification;
