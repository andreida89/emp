import React from 'react';
import images from 'utils/images';

export default function InventoryHints() {
	return (
		<div className="inventory_hints">
			<div className="inventory_hints-item">
				<img src={images.getImage('esc-key.svg')} alt="mouse left" />

				<p className="inventory_hints-text">
				Apasa <br />
				Pentru a inchide inventarul
				</p>
			</div>

			<div className="inventory_hints-item">
				<img src={images.getImage('mouse-left.svg')} alt="mouse left" />

				<p className="inventory_hints-text">
				Apasa pe obiect <br />
				Afiseaza informatii despre obiect
				</p>
			</div>

			<div className="inventory_hints-item">
				<img src={images.getImage('zero-key.svg')} alt="mouse left" />

				<p className="inventory_hints-text">
				Apasa <br />
				Pentru a scoate obiectul din mana
				</p>
			</div>
		</div>
	);
}
