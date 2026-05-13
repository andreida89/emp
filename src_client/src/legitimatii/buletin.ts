import browser from 'helpers/browser';

mp.events.add('ShowBuletin', (data: { firstName: string; lastName: string; gender: string; registerAt: string; headshot?: string }) => {
	const json = JSON.stringify(data);
	browser.browser.execute(`if (window.ShowBuletin) { window.ShowBuletin(${json}); }`);
});

mp.events.add('client:destroyBuletinHeadshot', () => {
    // Logic for cleanup
});
