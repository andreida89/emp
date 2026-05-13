import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import rpc from 'utils/rpc';
import images from 'utils/images';

const fields = {
	firstName: 'Nume',
	lastName: 'Prenume',
	gender: 'Sex',
	registerAt: 'Data inregistrarii'
	// partner: 'Stare civila'
};
//<img className="passport-photo" src={images.getImage(`user.png`, 'altele')} alt="user" draggable="false" />

/**
<img
	className="passport-photo"
	src="assets/images/poza.png"
	alt="Poza Buletin"
	draggable="false"
/>
**/
type Props = {} & RouteComponentProps<{}, {}, { [name in keyof typeof fields]: string }>;

export default function PlayerPassport({ location }: Props) {
	const player = location.state;

	return (
		<div className="player-passport">
			<div className="player-passport_container">
				<span
					className="faction-docs_close"
					onClick={() => {
						rpc.callClient('Browser-HidePage');
					}}
				>
					<IoClose />
				</span>


				<ul className="player-passport_fields">
					{Object.entries(fields).map(([name, title]) => (
						<li key={name} className="player-passport_field">
							<h4 className="player-passport_field-name">{title}</h4>
							<span className="player-passport_field-value">{(player as any)[name]}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
