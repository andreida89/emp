import browser from 'helpers/browser';

mp.events.add('ShowSindicat', (data: { nume: string; prenume: string; sex: string; data: string }) => {
	const json = JSON.stringify(data);
	mp.browsers.hidePage();
	browser.browser.execute(`window.ShowSindicat(${json})`);
});
