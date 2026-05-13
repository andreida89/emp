mp.events.subscribe({
	'FastFood-ShowMenu': (prices: { [name: string]: number }) => {
		mp.browsers.showPage('fastfood', { prices }, true, true);
	}
});

export {};
