import browser from 'helpers/browser';

mp.events.add('ShowJumpScare', () => {
	browser.browser.execute(`window.JumpScare()`);
});