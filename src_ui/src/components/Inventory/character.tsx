import React from 'react';
import images from 'utils/images';
import PrimaryTitle from 'components/Common/primary-title';
import { InventoryItem } from './index';
import Item from './item';
import Cell from './cell';

const clothes = {
	hats: 'Palarie',
	tops: 'Geaca/Tricou',
	pants: 'Pantaloni',
	shoes: 'Incaltaminte',
	glasses: 'Ochelari',
	masks: 'Masca',
	accessories: 'Accesorii',
	watches: 'Ceas',
	bracelets: 'Bratara',
	ears: 'Urechi',
	tasks: 'Vesta',
	torso: 'Torso',
	undershirts: 'Sub tricou'
};

const equipment = {
	ammo: 'Munitie',
	hands: 'Maini',
	backpack: 'Ghiozdan'
};

const itemPositions: { [key: string]: React.CSSProperties } = {
	hats: { top: '-3%', left: '45%' },
	glasses: { top: '10%', left: '20%' },
	ears: { top: '10%', left: '70%' },
	masks: { top: '8%', left: '45%' },
	accessories: { top: '21%', left: '45%' },
	tops: { top: '32%', left: '45%' },
	torso: { top: '23%', left: '70%' },
	undershirts: { top: '23%', left: '20%' },
	bracelets: { top: '43%', left: '12%' },
	watches: { top: '43%', left: '79%' },
	pants: { top: '46%', left: '45%' },
	tasks: { top: '62%', left: '45%' },
	backpack: { top: '77%', left: '45%' },
	ammo: { top: '88%', left: '20%' },
	hands: { top: '88%', left: '70%' },
	shoes: { top: '90%', left: '45%' }
};

type Props = {
	use: (id: number) => void;
	drop: (id: number) => void;
	items: { [name: string]: InventoryItem };
};

export default function Character({ items, use, drop }: Props) {
	function getWearingItem(name: string) {
		const item = items[name];
		return item && <Item id={name} name={item.name} amount={1} hideAmount />;
	}

	return (
		<div className="inventory_character">
			<div className="inventory_character-container">
				<PrimaryTitle className="inventory_title">Haine</PrimaryTitle>

				<div className="inventory_character-clothes">
					{Object.entries({ ...clothes, ...equipment }).map(([key, title]) => (
						<div
							className="inventory_character-item"
							key={key}
							style={itemPositions[key]}
						>
							<Cell id={key} onDrop={use}>
								{getWearingItem(key) || (
									<img src={images.getImage(`${key}.svg`)} alt={title} />
								)}
							</Cell>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
