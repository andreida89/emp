mp.events.subscribe({
	'ToolShop-ShowMenu': (prices: { [name: string]: number }) => {
		mp.browsers.showPage('tool_shop', { prices }, true, true);
	}
});

export {};
