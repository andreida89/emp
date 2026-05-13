import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import images from '../../utils/images';

interface PlayerData {
	firstName: string;
	lastName: string;
	gender: string;
	registerAt: string;
	headshot?: string;
}

const PlayerBuletin: React.FC = () => {
	const [player, setPlayer] = useState<PlayerData | null>(null);

	useEffect(() => {
		(window as any).ShowBuletin = (data: PlayerData) => {
			setPlayer(data);

			// Auto-hide după 10 secunde pentru a permite vizualizarea
			setTimeout(() => {
				setPlayer(null);
			}, 10000);
		};

		return () => {
			(window as any).ShowBuletin = null;
		};
	}, []);


	if (!player) return null;

	const closeBuletin = () => {
		setPlayer(null);
		if ((window as any).mp) {
			(window as any).mp.trigger('client:destroyBuletinHeadshot');
		}
	};

	return (
		<div className="custom-player-buletin">
			<div className="custom-player-buletin_container">
				<span
					className="custom-buletin_close"
					onClick={closeBuletin}
				>
					<IoClose />
				</span>

				<div className="custom-buletin-photo">
					{player.headshot ? (
						<div 
							className="custom-buletin-photo_img"
							style={{ 
								backgroundImage: `url('${player.headshot}')`,
								width: '100%',
								height: '100%',
								backgroundSize: 'cover',
								backgroundPosition: 'top center',
								backgroundRepeat: 'no-repeat'
							}}
						/>
					) : (
						<img 
							src={images.getImage('user.png')} 
							alt="Avatar Default" 
							draggable="false"
						/>
					)}
				</div>

				<ul className="custom-player-buletin_fields">
					<li className="custom-player-buletin_field">
						<h4 className="custom-player-buletin_field-name">Nume</h4>
						<span className="custom-player-buletin_field-value">{player.firstName}</span>
					</li>
					<li className="custom-player-buletin_field">
						<h4 className="custom-player-buletin_field-name">Prenume</h4>
						<span className="custom-player-buletin_field-value">{player.lastName}</span>
					</li>
					<li className="custom-player-buletin_field">
						<h4 className="custom-player-buletin_field-name">Sex</h4>
						<span className="custom-player-buletin_field-value">{player.gender}</span>
					</li>
					<li className="custom-player-buletin_field">
						<h4 className="custom-player-buletin_field-name">Data inregistrarii: </h4>
						<span className="custom-player-buletin_field-value">{player.registerAt}</span>
					</li>
				</ul>

				<style>{`
					.custom-player-buletin {
						position: fixed;
						top: 0;
						left: 0;
						width: 100vw;
						height: 100vh;
						display: flex;
						align-items: center;
						justify-content: center;
						z-index: 9999;
						pointer-events: none;
					}

					.custom-player-buletin_container {
						position: relative;
						width: 40vw;
						height: 30vw;
						background: url('${ images.getImage('buletin.png') }') center no-repeat;
						background-size: contain;
						overflow: hidden;
						pointer-events: all;
					}

					.custom-buletin_close {
						position: absolute;
						top: 5%;
						right: 1.5vw;
						font-size: 2vw;
						color: #000000;
						cursor: pointer;
						z-index: 10;
					}

					.custom-buletin-photo {
						position: absolute;
						top: 19%;
						left: 6.5%;
						width: 17.5%;
						height: 38%;
						border-radius: 12px;
						overflow: hidden;
						background: rgba(0, 0, 0, 0.1);
						display: flex;
						align-items: center;
						justify-content: center;
					}
					
					.custom-buletin-photo img {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}
					
					.custom-buletin-photo-placeholder {
						font-size: 3vw;
						color: rgba(0, 0, 0, 0.3);
						font-weight: bold;
					}

					.custom-player-buletin_fields {
						position: absolute;
						top: 40%;
						left: 42%;
						width: 50%;
						list-style: none;
						margin: 0;
						padding: 0;
					}

					.custom-player-buletin_field {
						margin-bottom: 2%;
						display: flex;
						align-items: center;
					}

					.custom-player-buletin_field-name {
						margin: 0;
						color: #000000;
						font-weight: bold;
						font-size: 0.9vw;
						width: 35%;
					}

					.custom-player-buletin_field-value {
						color: #000000;
						font-size: 0.9vw;
						font-weight: bold;
					}
				`}</style>
			</div>
		</div>
	);
};

export default PlayerBuletin;
