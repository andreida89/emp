import browser from 'helpers/browser';

mp.events.add('ShowPermis', (data: { nume: string; prenume: string; sex: string; data: string; categories: { a: boolean; b: boolean; c: boolean } }) => {
	const json = JSON.stringify(data);
	mp.browsers.hidePage();
	browser.browser.execute(`window.ShowPermis(${json})`);
});
