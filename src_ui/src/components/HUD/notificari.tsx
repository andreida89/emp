import React, { useEffect, useState } from 'react';
import notificationSound from 'assets/audio/notificare.mp3';

type NotificationType = 'info' | 'danger' | 'success';

type Notification = {
	id: number;
	text: string;
	type: NotificationType;
};

let counter = 0;

const Notifications: React.FC = () => {
	const [messages, setMessages] = useState<Notification[]>([]);

	useEffect(() => {
		(window as any).NotifyAnnouncement = (text: string, type: NotificationType) => {
			const id = counter++;
	
			const audio = new Audio(notificationSound);
			audio.volume = 0.1;
			audio.play().catch(() => {});
	
			setMessages((prev) => [...prev, { id, text, type }]);
	
			setTimeout(() => {
				setMessages((prev) => prev.filter((msg) => msg.id !== id));
			}, 5000);
		};
	}, []);

	return (
		<div id="notificari">
			{messages.map((msg) => (
				<div key={msg.id} className={`container ${msg.type}`}>
					<div className="msg">
						<p>{msg.text}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default Notifications;

