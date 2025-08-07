import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface PlayerData {
	firstName: string;
	lastName: string;
	registerAt: string;
	rank: string;
}

const PlayerPolitie: React.FC = () => {
	const [player, setPlayer] = useState<PlayerData | null>(null);

useEffect(() => {
	(window as any).ShowPolitie = (data: PlayerData) => {
		setPlayer(data);

		// Auto-hide după 5 secunde (5000ms)
		setTimeout(() => {
			setPlayer(null);
		}, 5000);
	};
}, []);


	if (!player) return null;

	return (
		<div className="player-politie">
			<div className="player-politie_container">
				<span
					className="faction-docs_close"
					onClick={() => {
						setPlayer(null);
					}}
				>
					<IoClose />
				</span>

				<ul className="player-politie_fields">
					<li className="player-politie_field">
						<h4 className="player-politie_field-name">Nume:</h4>
						<span className="player-politie_field-value">{player.firstName}</span>
					</li>
					<li className="player-politie_field">
						<h4 className="player-politie_field-name">Prenume:</h4>
						<span className="player-politie_field-value">{player.lastName}</span>
					</li>
					<li className="player-politie_field">
						<h4 className="player-politie_field-name">Rang:</h4>
						<span className="player-politie_field-value">{player.rank}</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default PlayerPolitie;
