import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface PlayerData {
	firstName: string;
	lastName: string;
	gender: string;
	registerAt: string;
}

const PlayerBuletin: React.FC = () => {
	const [player, setPlayer] = useState<PlayerData | null>(null);

useEffect(() => {
	(window as any).ShowBuletin = (data: PlayerData) => {
		setPlayer(data);

		// Auto-hide după 5 secunde (5000ms)
		setTimeout(() => {
			setPlayer(null);
		}, 5000);
	};
}, []);


	if (!player) return null;

	return (
		<div className="player-buletin">
			<div className="player-buletin_container">
				<span
					className="faction-docs_close"
					onClick={() => {
						setPlayer(null);
					}}
				>
					<IoClose />
				</span>

				<ul className="player-buletin_fields">
					<li className="player-buletin_field">
						<h4 className="player-buletin_field-name">Nume</h4>
						<span className="player-buletin_field-value">{player.firstName}</span>
					</li>
					<li className="player-buletin_field">
						<h4 className="player-buletin_field-name">Prenume</h4>
						<span className="player-buletin_field-value">{player.lastName}</span>
					</li>
					<li className="player-buletin_field">
						<h4 className="player-buletin_field-name">Sex</h4>
						<span className="player-buletin_field-value">{player.gender}</span>
					</li>
					<li className="player-buletin_field">
						<h4 className="player-buletin_field-name">Data inregistrarii: </h4>
						<span className="player-buletin_field-value">{player.registerAt}</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default PlayerBuletin;
