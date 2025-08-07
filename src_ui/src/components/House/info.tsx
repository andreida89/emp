import React from 'react';
import prettify from 'utils/prettify';
import PrimaryTitle from 'components/Common/primary-title';

type Props = {
	isOwner: boolean;
	owner: string;
	tax: number;
	price: number;
	paid: number;
};

export default function HouseInfo({ isOwner, owner, tax, price, paid }: Props) {
	return (
		<div className="house_info">
			<PrimaryTitle>Informatii</PrimaryTitle>

			<div className="house_info-container">
				<div className="house_info-item">
					<h4 className="house_info-name">Proprietar</h4>

					<span className="house_info-value">{owner || 'Nu exista'}</span>
				</div>

				<div className="house_info-item">
					<h4 className="house_info-name">Cost pe zi</h4>

					<span className="house_info-value">{prettify.price(tax)}</span>
				</div>

				<div className="house_info-item">
					<h4 className="house_info-name">{isOwner ? 'Vanzare la Agentie' : 'Pret'}</h4>

					<span className="house_info-value">{prettify.price(price)}</span>
				</div>
			</div>

			{isOwner && (
				<div className="house_info-item house_info-item--main">
					<h4 className="house_info-name">Zile platite</h4>

					<span className="house_info-value">{paid}</span>

					<p className="house_info-remark">Serviciile pot fi platite la banca</p>
				</div>
			)}
		</div>
	);
}
