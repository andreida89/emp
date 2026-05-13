import React from 'react';
import PrimaryTitle from 'components/Common/primary-title';
import { InventoryItem } from './index';
import Grid from './gridpockets';

type Props = {
	items: InventoryItem[];
};

export default function InventoryPockets({ items }: Props) {
	return (
		<div className="inventory_pockets">
			<PrimaryTitle className="inventory_title">Buzunare</PrimaryTitle>

			<Grid cells={8} startIndex={0} items={items} />
		</div>
	);
}
