import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface PlayerData {
	firstName: string;
	lastName: string;
	registerAt: string;
}

const PlayerPrimarie: React.FC = () => {
	const [player, setPlayer] = useState<PlayerData | null>(null);

useEffect(() => {
	(window as any).ShowPrimarie = (data: PlayerData) => {
		setPlayer(data);

		// Auto-hide după 5 secunde (5000ms)
		setTimeout(() => {
			setPlayer(null);
		}, 5000);
	};
}, []);


	if (!player) return null;

	return (
		<div className="player-primarie">
			<div className="player-primarie_container">
				<span
					className="faction-docs_close"
					onClick={() => {
						setPlayer(null);
					}}
				>
					<IoClose />
				</span>

				<ul className="player-primarie_fields">
					<li className="player-primarie_field">
						<h4 className="player-primarie_field-name">Nume</h4>
						<span className="player-primarie_field-value">{player.firstName}</span>
					</li>
					<li className="player-primarie_field">
						<h4 className="player-primarie_field-name">Prenume</h4>
						<span className="player-primarie_field-value">{player.lastName}</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default PlayerPrimarie;
