import React from 'react';
import { isEqual } from 'lodash';
import classNames from 'classnames';

const colors = [
	[25, 67, 214],
	[109, 207, 246],
	[255, 255, 255],
	[0, 0, 0],
	[60, 184, 120],
	[237, 28, 36],
	[0, 33, 87],
	[135, 129, 189],
	[252, 230, 56],
	[255, 0, 130],
	[210, 87, 214],
	[149, 149, 149]
];

type Props = {
	current: number[];
	select: (color: number[]) => void;
};

export default function VehicleShopColor({ current, select }: Props) {
	return (
		<div className="vshop-color-picker">
			<span className="vshop-color-title">Vopsitorie</span>
			{colors.map((item, index) => (
				<div
					key={index}
					className={classNames('vshop-color-node', {
						active: isEqual(item, current)
					})}
					style={{ background: `rgb(${item})` }}
					onClick={() => select(item)}
				/>
			))}
		</div>
	);
}
