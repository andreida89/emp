import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface PlayerData {
	firstName: string;
	lastName: string;
	registerAt: string;
	rank: string;
}

const PlayerSmurd: React.FC = () => {
	const [player, setPlayer] = useState<PlayerData | null>(null);

useEffect(() => {
	(window as any).ShowSmurd = (data: PlayerData) => {
		setPlayer(data);

		// Auto-hide după 5 secunde (5000ms)
		setTimeout(() => {
			setPlayer(null);
		}, 5000);
	};
}, []);


	if (!player) return null;

	return (
		<div className="player-smurd">
			<div className="player-smurd_container">
				<span
					className="faction-docs_close"
					onClick={() => {
						setPlayer(null);
					}}
				>
					<IoClose />
				</span>

				<ul className="player-smurd_fields">
					<li className="player-smurd_field">
						<h4 className="player-smurd_field-name">Nume:</h4>
						<span className="player-smurd_field-value">{player.firstName}</span>
					</li>
					<li className="player-smurd_field">
						<h4 className="player-smurd_field-name">Prenume:</h4>
						<span className="player-smurd_field-value">{player.lastName}</span>
					</li>
					<li className="player-smurd_field">
						<h4 className="player-smurd_field-name">Rang:</h4>
						<span className="player-smurd_field-value">{player.rank}</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default PlayerSmurd;
