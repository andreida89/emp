import React from 'react';
import Point from 'components/Common/point';

type Props = {
	random: number;
	custom: number;
};

export default function SimPrices({ random, custom }: Props) {
	return (
		<div className="sim_prices">
			<h3 className="sim_prices-title">Costul serviciilor</h3>

			<ul className="sim_prices-list">
				<li className="sim_prices-item">
				Numar aleatoriu <span>{random} RON</span>
				</li>

				<li className="sim_prices-item">
				Numar custom <Point amount={custom} />
				</li>
			</ul>
		</div>
	);
}
