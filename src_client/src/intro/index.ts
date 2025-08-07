import browser from 'helpers/browser';

mp.events.add('PlayGlobalVideo', () => {
    browser.browser.execute(`window.PlayGlobalVideo()`);
});

