import React, { useState, useMemo, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import withPayment, { WrappedProps } from 'components/Common/with-payment';
import images from 'utils/images';
import FuelCard from './FuelCard';
import FuelBar from './FuelBar';
import PriceBlock from './PriceBlock';
import ActionButtons from './ActionButtons';
import rpc from 'utils/rpc';

type Props = WrappedProps & RouteComponentProps;

const FUEL_TYPES = [
	{ key: 'diesel', label: 'DIESEL', price: 15, className: 'gas-fuel-diesel', unit: 'L' },
	{ key: 'benzina', label: 'BENZINA', price: 18, className: 'gas-fuel-economic', unit: 'L' },
	{ key: 'kerosen', label: 'KEROSEN', price: 23, className: 'gas-fuel-super', unit: 'L' },
	{ key: 'electricitate', label: 'ELECTRICITATE', price: 28, className: 'gas-fuel-premium', unit: 'KW' }
];
const getJerrycanPrice = (type: string) => {
	switch (type) {
		case 'diesel':
			return 200;
		case 'benzina':
			return 250;
		case 'kerosen':
			return 300;
		default:
			return 0; // electricitate sau necunoscut
	}
};

const MAX_LITRES = 50;

function GasStation(props: Props) {
	const { showPayment, location } = props;
	const state = location.state as any || {};

	const {
		fuelLevel = 50,
		vehicleModel = 'Necunoscut',
		vehicleClass = 'Necunoscut',
		fuelType = 'Necunoscut',
		prices = {}
	} = state;

	useEffect(() => {
		console.log('[UI][GasStation] location.state:', state);
	}, []);

	const [selected, setSelected] = useState(fuelType);
	const [fuelPercent, setFuelPercent] = useState(fuelLevel); // direct în %

	const litresToBuy = useMemo(() => {
		const percentToAdd = Math.max(0, fuelPercent - fuelLevel);
		return Math.round((percentToAdd / 100) * MAX_LITRES);
	}, [fuelLevel, fuelPercent]);

	const currentType = FUEL_TYPES.find((f) => f.key === selected);
	const totalPrice = useMemo(() => litresToBuy * (currentType?.price ?? 0), [litresToBuy, currentType]);
	const jerrycanPrice = getJerrycanPrice(selected);


	const handlePay = () => {
		showPayment(async (paymentMethod: string) => {
			const basket = {
				diesel: 0,
				benzina: 0,
				electricitate: 0,
				kerosen: 0,
				jerrycan: 0
			};

			if (selected && basket[selected as keyof typeof basket] !== undefined) {
				basket[selected as keyof typeof basket] = litresToBuy;
			}

			await rpc.callServer('Gas-Buy', [basket, paymentMethod]);
		});
	};

const handleFillJerrycan = () => {
	showPayment(async (paymentMethod: string) => {
		await rpc.callServer('Gas-FillJerrycan', [selected, paymentMethod]);
	});
};



	const handleClose = () => {
		rpc.callClient('Gas-CloseMenu');
	};

	return (
		<div className="gas-station-bg">
			<div className="gas-station-ui">
				<div className="gas-station-left">
					<div className="gas-title">BENZINARIE</div>
					<div className="gas-model-info">
						<span>Nume Masina:</span> <b>{vehicleModel}</b><br />
						<span>Clasa Masina:</span> <b>{vehicleClass}</b><br />
						<span>Tip Combustibil:</span> <b>{fuelType}</b>
					</div>
					<div className="gas-car">
						<img src={images.getImage('gas4.gif')} alt="Gas Station Pump" draggable={false} />
					</div>
					<FuelBar level={fuelLevel} />
				</div>

				<div className="gas-station-right">
					<div className="gas-title gas-title--right">SELECT FUEL TYPE</div>
					<div className="gas-fuel-grid">
						{FUEL_TYPES.map((ft) => (
							<FuelCard
								key={ft.key}
								label={ft.label}
								price={ft.price}
								unit={ft.unit}
								active={selected === ft.key}
								className={ft.className}
								onClick={() => setSelected(ft.key)}
							/>
						))}
					</div>

					<div className="gas-litres-label">COMPLETARE</div>
					<div className="gas-litres-slider">
						<input
							type="range"
							min={fuelLevel}
							max={100}
							value={fuelPercent}
							onChange={(e) => setFuelPercent(Number(e.target.value))}
							className="slider"
						/>
						<span className="gas-litres-value">{fuelPercent}%</span>
					</div>

					<PriceBlock value={totalPrice} />
<ActionButtons
  onPay={handlePay}
  onJerrycan={handleFillJerrycan}
  onClose={handleClose}
  jerrycanPrice={jerrycanPrice}
/>

				</div>
			</div>
		</div>
	);
}

export default withPayment(withRouter(GasStation));
