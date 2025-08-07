import browser from 'helpers/browser';

mp.events.add('AnuntNotification', (text: string, type: string) => {
	//mp.gui.chat.push(`Sending notification: ${text} [${type}]`);
	browser.browser.execute(`window.NotifyAnnouncement(${JSON.stringify(text)}, ${JSON.stringify(type)})`);
});
