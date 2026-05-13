import browser from 'helpers/browser';

mp.events.add('ShowUMU', (data: { firstName: string; lastName: string; gender: string; registerAt: string, rank: string }) => {
	const json = JSON.stringify(data);
	mp.browsers.hidePage();
	browser.browser.execute(`window.ShowUMU(${json})`);
});
