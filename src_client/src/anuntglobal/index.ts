import browser from 'helpers/browser';

mp.events.add('AnuntGlobal', (text: string) => {
	browser.browser.execute(`window.AnuntGlobal(${JSON.stringify(text)})`);
});

