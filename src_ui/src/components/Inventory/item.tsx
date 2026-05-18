import React, { useContext } from 'react';
import { useDrag } from 'react-dnd';
import images from 'utils/images';
import InventoryContext from './context';

type Props = {
	id: number | string;
	name: string;
	amount: number;
	storage?: string;
	hideAmount?: boolean;
};

// Helper to format the amount nicely
function formatAmount(amount: number): string {
	if (amount < 1000) return amount.toString();
	if (amount < 1_000_000) return `${Math.floor(amount / 1000)}k`;
	if (amount < 1_000_000_000) return `${Math.floor(amount / 1_000_000)}m`;
	if (amount < 1_000_000_000_000) return `${Math.floor(amount / 1_000_000_000)}M`;
	return `${Math.floor(amount / 1_000_000_000_000)}B`;
}

export default function InventoryItem({
	id,
	name,
	amount,
	storage = 'self',
	hideAmount
}: Props) {
	const { selectItem, useItem } = useContext(InventoryContext)!;

	const [, drag] = useDrag({
		item: {
			id,
			name,
			storage,
			type: 'item'
		}
	});

	return (
		<div
			ref={drag}
			className="inventory_item"
			id={`item-${id}`}
			onClick={() => selectItem({ cell: id, name, amount, storage })}
			onDoubleClick={() => useItem(id as number)}
		>
			<img src={images.getImage(`${name}.png`, 'inventory')} alt={name} />

			{!hideAmount && (
				<span className="inventory_item-amount">{formatAmount(amount)}</span>
			)}
		</div>
	);
}
