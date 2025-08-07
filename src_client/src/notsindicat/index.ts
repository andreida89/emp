import browser from 'helpers/browser';

mp.events.add('AlertaSindicat', (x: number, y: number, z: number) => {
  browser.browser.execute(`window.AlertaSindicat(${x}, ${y}, ${z})`);
});
