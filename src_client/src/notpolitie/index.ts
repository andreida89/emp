import browser from 'helpers/browser';

mp.events.add('AlertaPolitie', (message: string) => {
  browser.browser.execute(`window.AlertaPolitie(${JSON.stringify(message)})`);
});

