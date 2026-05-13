import React from 'react';
import Key from './key';

type Props = {
	items: {
		[name: string]: string;
	};
};

export default function Binds({ items }: Props) {
	return (
		<div className="hud_binds">

			<div className="hud_binds-item">
				<Key>{items.inventory ?? 'I'}</Key>
				<span className="hud_binds-label">INVENTAR</span>
			</div>

			<div className="hud_binds-item">
				<Key>{items.battlepass ?? 'N'}</Key>
				<span className="hud_binds-label">VORBESTE</span>
			</div>

			<div className="hud_binds-item">
				<Key>{items.players ?? 'Z'}</Key>
				<span className="hud_binds-label">VOLUM CHAT VOCAL</span>
			</div>

			<div className="hud_binds-item">
				<Key>{items.mapzoom ?? 'M'}</Key>
				<span className="hud_binds-label">TELEFON</span>
			</div>

			<div className="hud_binds-item">
				<Key>{items.menu ?? 'F3'}</Key>
				<span className="hud_binds-label">TABLETA</span>
			</div>

			<div className="hud_binds-item">
				<Key>{items.interaction ?? 'K'}</Key>
				<span className="hud_binds-label">MENIU JUCATOR</span>
			</div>

			<div className="hud_binds-item">
				<Key>{items.chat ?? 'L'}</Key>
				<span className="hud_binds-label">INCUIE/DESCUIE MASINA</span>
			</div>

			<div className="hud_binds-item">
				<Key>{items.chat ?? 'ALT'}</Key>
				<span className="hud_binds-label">PORNESTE/OPRESTE MOTORUL</span>
			</div>

		</div>
	);
}