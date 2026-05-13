import browser from 'helpers/browser';

mp.events.add('AnuntNotification', (text: string, type: string) => {
	//mp.gui.chat.push(`Sending notification: ${text} [${type}]`);
	browser.browser.execute(`window.NotifyAnnouncement(${JSON.stringify(text)}, ${JSON.stringify(type)})`);
});

mp.events.add('AnuntNotification2', (text: string, type: string, title?: string) => {
	//mp.gui.chat.push(`Sending notification2: ${text} [${type}] [${title}]`);
	browser.browser.execute(`window.NotifyAnnouncement2(${JSON.stringify(text)}, ${JSON.stringify(type)}, ${JSON.stringify(title || null)})`);
});
