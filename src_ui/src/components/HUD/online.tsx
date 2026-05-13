import React, { useEffect, useState } from 'react';
// @ts-ignore
import AnimatedNumber from 'animated-number-react';
import AdminTicketCount from './ticketeactive';
import images from 'utils/images';

type Props = {
	playerId: number;
	count: number;
	showLogo?: boolean;
	showIdUsers?: boolean;
};

export default function Online({ playerId, count, showLogo = true, showIdUsers = true }: Props) {
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
			<div className="hud_online-row">

				{/* TEXT (stânga) */}
				{showIdUsers && (
				<div className="hud_online-info">
					
					<div className="hud_online-tickets">
						<AdminTicketCount />
					</div>

					<div className="player-id">
						<i className="fa-solid fa-hashtag fa-xs"></i>
						<span>{playerId}</span>
					</div>

					<div className="hud_online-count">
						<i className="fa-solid fa-users fa-xs"></i>
						<span>
							<AnimatedNumber
								value={count}
								duration={300}
								formatValue={(v: any) => parseInt(v).toString()}
							/>
						</span>
					</div>

				</div>
				)}

				{/* LOGO (dreapta) */}
				{showLogo && (
				<div className={`hud_online-logo ${animate ? 'animate__animated animate__flipInY' : ''}`}>
					<img src={images.getImage('emplogo.svg')} alt="logo" />
				</div>
				)}

			</div>
		</div>
	);
}