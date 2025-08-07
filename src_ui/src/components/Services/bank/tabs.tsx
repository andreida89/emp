import React from 'react';
import images from 'utils/images';

const items: { [name: string]: string } = {
    cash_out: 'Retrage bani',
    replenish: 'Reincarca balanta',
    transfer: 'Transfer bancar',
    house: 'Plateste casa',
    bank: 'Deschide cont',
    business: 'Plateste afacerea'
};


type Props = {
	openTab: (name: string) => void;
};

export default function BankTabs({ openTab }: Props) {
	return (
		<div className="bank_tabs">
			<ul className="bank_tabs-list">
				{Object.entries(items).map(([name, title]) => (
					<li className="bank_tabs-item" key={name} onClick={() => openTab(name)}>
						<div className="container">
							<img src={images.getImage(`${name}.svg`)} alt={title} />

							<h4>{title}</h4>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
