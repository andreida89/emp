mp.events.subscribe({
	'ElectronicsShop-ShowMenu': (prices: { [name: string]: number }) => {
		mp.browsers.showPage('electronics_shop', { prices }, true, true);
	}
});

export {};
