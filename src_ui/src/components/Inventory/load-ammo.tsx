import React, { useState } from 'react';
import Slider from 'rc-slider';
import PrimaryTitle from 'components/Common/primary-title';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';

type Props = {
	amount: number;
	confirm: (value: number) => void;
	cancel: () => void;
};

export default function InventoryLoadAmmo({ amount, confirm, cancel }: Props) {
	const [value, setValue] = useState<number>(amount);

	return (
		<div className="inventory_separate">
			<PrimaryTitle className="inventory_separate-title">
				Incarca pe Arma
			</PrimaryTitle>

			<div className="inventory_separate-slider">
				<Slider
					value={value}
					min={1}
					max={amount}
					onChange={setValue as any}
				/>

				<span className="inventory_separate-current">{value}</span>
				<span className="inventory_separate-max">{amount}</span>
			</div>

			<div className="inventory_separate-buttons">
				<OutlineButton onClick={cancel}>Inchide</OutlineButton>
				<GradientButton onClick={() => confirm(value)}>Incarca</GradientButton>
			</div>
		</div>
	);
}
