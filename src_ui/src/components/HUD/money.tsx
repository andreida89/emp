import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import prettify from 'utils/prettify';
import images from 'utils/images';

type Props = {
	cash: number;
	bank: number;
};

type Change = {
	type: 'bank' | 'cash';
	amount: number;
	status: boolean;
};

function usePrevious(value: Props) {
	const ref = useRef<Props>();

	useEffect(() => {
		ref.current = value;
	});

	return ref.current;
}

function MoneyChange({ status, amount }: { status: boolean; amount: number }) {
	return (
		<span className={classNames('hud_money-change', status ? 'positive' : 'negative')}>
			{`${status ? '+' : ''}${prettify.price(amount).replace('$', '')}`}
		</span>
	);
}

export default function Money({ cash, bank }: Props) {
	const prevMoney = usePrevious({ cash, bank });
	const [changes, setChanges] = useState<Change>();

	useEffect(() => {
		if (!prevMoney) return;

		if (prevMoney && prevMoney.cash !== cash)
			setChanges({
				type: 'cash',
				amount: cash - prevMoney.cash,
				status: cash > prevMoney.cash
			});

		setTimeout(() => setChanges(undefined), 2000);
	}, [cash, prevMoney]);

	return (
<div className="hud_money">
	<div className="hud_money-cash" style={{ position: 'relative', display: 'inline-block', width: '18vh' }}>
		<img src={images.getImage('moneyhud.svg')} alt="money bg" style={{ display: 'block', width: '100%', height: 'auto' }} />
		
		<div className="hud_money-cash-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '15%' }}>
			<span className="hud_money-cash-amount" style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.6vh' }}>
				{cash.toString().replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, `$1 `)}
			</span>
		</div>

		{changes?.type === 'cash' && (
			<div style={{ position: 'absolute', bottom: '-2vh', right: 0 }}>
				<MoneyChange status={changes.status} amount={changes.amount} />
			</div>
		)}

	</div>
</div>
	);
}
