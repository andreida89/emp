import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import rpc from 'utils/rpc';

const fields = {
	firstName: 'Nume',
	lastName: 'Prenume',
	gender: 'Sex',
	registerAt: 'Data inregistrarii'
};

type Props = {} & RouteComponentProps<{}, {}, { [name in keyof typeof fields]: string }>;

export default function PlayerPermis({ location }: Props) {
	const player = location.state;

	return (
		<div className="player-permis">
			<div className="player-permis_container">
				<span
					className="faction-docs_close"
					onClick={() => {
						rpc.callClient('client:destroyPermisHeadshot');
						rpc.callClient('Browser-HidePage');
					}}
				>
					<IoClose />
				</span>

				<ul className="player-permis_fields">
					{Object.entries(fields).map(([name, title]) => (
						<li key={name} className="player-permis_field">
							<h4 className="player-permis_field-name">{title}</h4>
							<span className="player-permis_field-value">{(player as any)[name]}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
