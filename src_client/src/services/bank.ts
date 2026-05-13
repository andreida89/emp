import playerCtrl from 'player';

mp.events.subscribe({
	'Bank-ShowMenu': (account: string, prices: any, comission: number, hasPin: boolean, history: any[]) => {
		mp.browsers.showPage(
			'bank',
			{
				name: playerCtrl.getName(mp.players.local, true),
				account,
				prices,
				comission,
				hasPin,
				history
			},
			true,
			true
		);
	}
});
