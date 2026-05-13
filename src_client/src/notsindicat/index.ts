import browser from 'helpers/browser';

mp.events.add('AlertaSindicat', (x: number, y: number, z: number) => {
  (global as any).isAlertaSindicatActive = true;
  browser.browser.execute(`window.AlertaSindicat(${x}, ${y}, ${z})`);
});

mp.events.add('client:alertaSindicatClosed', () => {
  (global as any).isAlertaSindicatActive = false;
});
