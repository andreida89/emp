import browser from 'helpers/browser';

mp.events.add('ShowJumpScare', (text: string, type: string) => {
	//mp.gui.chat.push(`Sending notification: ${text} [${type}]`);
	browser.browser.execute(`window.JumpScare(${JSON.stringify(text)}, ${JSON.stringify(type)})`);
});