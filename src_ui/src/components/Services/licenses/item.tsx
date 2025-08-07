import React from 'react';
import classNames from 'classnames';
import images from 'utils/images';
import prettify from 'utils/prettify';
import PrimaryTitle from 'components/Common/primary-title';
import GradientButton from 'components/Common/gradient-button';

const licenses = {
    house: {
        name: 'Casa',
        description: 'Permite detinerea a 2 case'
    },
    business: {
        name: 'Afacere',
        description: 'Permite achizitionarea unei afaceri'
    },
    car: {
        name: 'Autoturisme',
        description: 'Permite conducerea autoturismelor'
    },
    motorcycle: {
        name: 'Motociclete',
        description: 'Permite conducerea motocicletelor'
    },
    boat: {
        name: 'Barci',
        description: 'Permite conducerea vehiculelor de apa'
    },
    air: {
        name: 'Vehicule aeriene',
        description: 'Permite conducerea vehiculelor aeriene'
    },
    truck: {
        name: 'Camioane',
        description: 'Permite conducerea camioanelor'
    },
    weapon: {
        name: 'Arme',
        description: 'Necesara pentru detinerea armelor'
    },
    fishing: {
        name: 'Pescuit',
        description: 'Necesara pentru a prinde o cantitate mai mare de peste'
    }
};


type Props = {
	name: string;
	price: number;
	bought: boolean;
	buy: () => void;
};

export default function LicensesItem({ name, price, bought, buy }: Props) {
	return (
		<div
			className={classNames('licenses_item', {
				disabled: bought
			})}
			style={{
				backgroundImage: `${
					bought ? 'linear-gradient(black, black),' : ''
				} url(${images.getImage(`${name}.jpg`, 'licenses')})`
			}}
		>
			<PrimaryTitle className="licenses_item-title">Licenta</PrimaryTitle>
			<h3 className="licenses_item-subtitle">de {(licenses as any)[name].name}</h3>

			{!bought ? (
				<>
					<p className="licenses_item-info">{(licenses as any)[name].description}</p>

					<div className="licenses_item-price">
						<h4>Pret</h4>

						<span>{prettify.price(price)}</span>
					</div>

					<GradientButton className="licenses_item-buy" onClick={buy}>
						Plateste
					</GradientButton>
				</>
			) : (
				<>
					<span className="licenses_item-checkmark" />
				</>
			)}
		</div>
	);
}
