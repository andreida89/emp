import React from 'react';
import Cell from './cell';

type Props = {
	onDrop: (id: number) => void;
};

export default function InventoryDropZone({ onDrop }: Props) {
	return (
		<div className="inventory_drop inventory_drop--inline">

			<Cell className="inventory_drop-cell" id={228} onDrop={onDrop} />
		</div>
	);
}
