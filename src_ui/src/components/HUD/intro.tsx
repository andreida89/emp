import React, { useEffect, useState, useRef } from 'react';

const VIDEO_URL = "https://empirerp.eu/video-cef.mp4"; // Sau package://cef/video-cef.mp4 dacă vrei local!

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
						onEnded={() => setVisible(false)}
						onError={() => {
							alert('EROARE VIDEO: ' + videoSrc);
							setVisible(false);
						}}
					/>
					<button
						onClick={() => setVisible(false)}
						style={{
							position: 'absolute',
							top: 20,
							right: 30,
							zIndex: 2,
							fontSize: 30,
							color: 'white',
							background: 'rgba(0,0,0,0.4)',
							border: 'none',
							cursor: 'pointer'
						}}
					>
						✕
					</button>
				</div>
			)}
		</>
	);
};

export default FullscreenVideo;
