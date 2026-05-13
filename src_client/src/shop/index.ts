import browser from 'helpers/browser';

mp.events.add('OpenShopUI', () => {
  mp.gui.cursor.show(true, true);
  mp.gui.chat.show(false);
  mp.game.ui.displayRadar(false);
  
  browser.browser.execute(`window.showInterface('shop')`);
});
