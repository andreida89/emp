import React, { useEffect, useState } from 'react';
import { IoIosPerson } from 'react-icons/io';
// @ts-ignore
import AnimatedNumber from 'animated-number-react';
import AdminTicketCount from './ticketeactive';

type Props = {
	playerId: number;
	count: number;
};

export default function Online({ playerId, count }: Props) {
	const [animate, setAnimate] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setAnimate(true);
			setTimeout(() => setAnimate(false), 1000);
		}, 30000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="hud_online">
			<div className={`hud_online-logo ${animate ? 'animate__animated animate__flipInY' : ''}`}>
				<span className="hud_online-logo--empire">EMPIRE</span>{' '}
				<span className="hud_online-logo--roleplay">ROLEPLAY</span>
			</div>

			<div className="hud_online-container">
				<p className="player-id">
					<i className="fa-solid fa-hashtag fa-xs" style={{ color: '#ffffffff' }}></i>&nbsp;&nbsp;{playerId}
				</p>

				<div className="hud_online-count">
					<i className="fa-solid fa-users fa-xs" style={{ color: '#ffffffff' }}></i>&nbsp;&nbsp;
					<AnimatedNumber value={count} duration={300} formatValue={parseInt} />
				</div>
			</div>
		<div className="hud_onlinetickets">
			{/* Mutăm ticketele după containerul cu ID și online */}
			<AdminTicketCount />
		</div>
		</div>
	);
}
