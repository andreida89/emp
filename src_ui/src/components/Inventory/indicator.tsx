import React from 'react';
import { Circle } from 'rc-progress';
import { FaWeightHanging, FaHamburger, FaWineBottle } from 'react-icons/fa';

type Props = {
	type: 'weight' | 'satiety' | 'thirst';
	title: string;
	current: number;
	max: number;
};

export default function InventoryIndicator({ type, title, current, max }: Props) {
	return (
		<div className="inventory_indicator">
			<div className="inventory_indicator-container">
{type === 'weight' ? (
    <>
        <Circle
            className="inventory_indicator-circle"
            strokeWidth={8}
            trailWidth={8}
            trailColor="rgb(186, 186, 186)"
            strokeColor="#ff0000"
            strokeLinecap="square"
            percent={(current * 100) / max}
        />
        <FaWeightHanging className="inventory_indicator-icon" />
    </>
) : type === 'satiety' ? (
    <>
        <Circle
            className="inventory_indicator-circle"
            strokeWidth={8}
            trailWidth={8}
            trailColor="rgb(186, 186, 186)"
            strokeColor="#e4ff00"
            strokeLinecap="square"
            percent={(current * 100) / max}
        />
        <FaHamburger className="inventory_indicator-icon" />
    </>
) : (
    <>
        <Circle
            className="inventory_indicator-circle"
            strokeWidth={8}
            trailWidth={8}
            trailColor="rgb(186, 186, 186)"
            strokeColor="#005cff"
            strokeLinecap="square"
            percent={(current * 100) / max}
        />
        <FaWineBottle className="inventory_indicator-icon" />
    </>
)}

			</div>

			<div className="inventory_indicator-info">
				<h4 className="inventory_indicator-title">{title}</h4>

				<span>
					<b className="inventory_indicator-current">{current.toFixed(1)}</b> /{' '}
					<b className="inventory_indicator-max">
						{max} {`${type === 'weight' ? 'kg' : '%'}`}
					</b>
				</span>
			</div>
		</div>
	);
}
