import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import rpc from 'utils/rpc';

const fields = {
	firstName: 'Nume',
	lastName: 'Prenume',
	registerAt: 'Data inregistrarii'
};

type PlayerData = {
	firstName: string;
	lastName: string;
	registerAt: string;
	gender?: string;
};

export default function PlayerSindicat() {
	const [player, setPlayer] = useState<PlayerData | null>(null);
	const [headshot, setHeadshot] = useState<string | null>(null);

	useEffect(() => {
		const raw = localStorage.getItem('sindicatData');
		if (!raw) return;

		try {
			const parsed = JSON.parse(raw);
			setPlayer(parsed);
		} catch (err) {
			console.error('Eroare la parsarea datelor sindicat:', err);
		}

		rpc.callClient('client:requestSindicatPhoto');

		const handleHeadshot = (txd: string) => {
			mp.gui.chat.push(`[REACT] TXD primit: ${txd}`);
			setHeadshot(txd);
		};

		mp.events.add('browser:sindicatPhotoReady', handleHeadshot);

		return () => {
			mp.events.remove('browser:sindicatPhotoReady', handleHeadshot);
			rpc.callClient('client:destroySindicatHeadshot');
		};
	}, []);

	if (!player) return <div className="player-sindicat">Se încarcă...</div>;

	return (
		<div className="player-sindicat">
			<div className="player-sindicat_container">
				<span
					className="faction-docs_close"
					onClick={() => {
						rpc.callClient('client:destroySindicatHeadshot');
						rpc.callClient('Browser-HidePage');
					}}
				>
					<IoClose />
				</span>

				<ul className="player-sindicat_fields">
					{Object.entries(fields).map(([name, title]) => (
						<li key={name} className="player-sindicat_field">
							<h4 className="player-sindicat_field-name">{title}</h4>
							<span className="player-sindicat_field-value">{(player as any)[name]}</span>
						</li>
					))}
				</ul>

				{headshot && (
					<div className="player-sindicat_photo">
						<img
							src={`https://nui-img/${headshot}/${headshot}`}
							alt="Fotografie legitimatie"
							draggable={false}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
