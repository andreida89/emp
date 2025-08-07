import React from 'react';
import classNames from 'classnames';
import images from 'utils/images';

const items = {
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



type Props = {
	current: string;
	setCategory: (name: string) => void;
};

export default function ClothingShopCategories({ current, setCategory }: Props) {
	return (
		<div className="clothing-shop_categories">
			{Object.entries(items).map(([name, title]) => (
				<div
					className={classNames('clothing-shop_categories-item', {
						active: current === name
					})}
					key={name}
					onClick={() => setCategory(name)}
				>
					<img src={images.getImage(`${name}.svg`)} alt={title} />
				</div>
			))}
		</div>
	);
}
