import React, { useEffect, useState, useRef } from 'react';

const VIDEO_URL = "https://empirerp.ro/resurse/video-intro.mp4"; // Sau package://cef/video-cef.mp4 dacă vrei local!

const FullscreenVideo: React.FC = () => {
	const [visible, setVisible] = useState(false);
	const [videoSrc, setVideoSrc] = useState('');
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		(window as any).PlayGlobalVideo = (src?: string) => {
			setVideoSrc(src || VIDEO_URL);
			setVisible(true);
		};
	}, []);

	return (
		<>
			{visible && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'black',
						zIndex: 9999999,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<video
						ref={videoRef}
						src={videoSrc}
						autoPlay
						playsInline
						muted={false}
						controls={false}
						style={{
							width: '100vw',
							height: '100vh',
							objectFit: 'cover',
							background: 'black',
						}}
						onEnded={() => {
							setVisible(false);
							if ((window as any).mp) {
								(window as any).mp.trigger('Intro-VideoEnded');
							}
						}}
						onError={() => {
							alert('EROARE VIDEO: ' + videoSrc);
							setVisible(false);
							if ((window as any).mp) {
								(window as any).mp.trigger('Intro-VideoEnded');
							}
						}}
					/>
				</div>
			)}
		</>
	);
};

export default FullscreenVideo;
