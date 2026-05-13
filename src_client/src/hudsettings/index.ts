import browser from 'helpers/browser';

let currentHudVisibility = { showChat: true, showMinimap: true };
(global as any).currentHudVisibility = currentHudVisibility;

mp.events.add('OpenHudSettingsUI', (settingsAsJson?: string) => {
  if (settingsAsJson) {
      try {
          const parsed = JSON.parse(settingsAsJson);
          if (parsed.visibility) currentHudVisibility = { ...currentHudVisibility, ...parsed.visibility };
      } catch(e) {}
  }
  
  mp.gui.cursor.show(true, true);
  mp.gui.chat.show(false);
  mp.game.ui.displayRadar(false);
  
  browser.browser.execute(`window.showInterface('hudsettings')`);
  if (settingsAsJson) {
      setTimeout(() => {
        browser.browser.execute(`if(window.loadHudSettings) window.loadHudSettings('${settingsAsJson}')`);
      }, 200);
  }
});

mp.events.add('client:updateHudVisibility', (json: string) => {
    const data = JSON.parse(json);
    currentHudVisibility = { ...currentHudVisibility, ...data };
    (global as any).currentHudVisibility = currentHudVisibility;
    
    // Toggle radar
    if (typeof data.showMinimap !== 'undefined') {
        mp.game.ui.displayRadar(data.showMinimap);
    }
    
    // Toggle chat
    if (typeof data.showChat !== 'undefined') {
        mp.gui.chat.show(data.showChat);
    }

	// Update UI to hide components
	browser.browser.execute(`
		window.lastHudSettingsVisibility = '${json}';
		if(window.updateHudUiSettings) window.updateHudUiSettings('{"visibility": ${json}}');
		window.dispatchEvent(new CustomEvent('hudSettingsChanged'));
	`);
});

mp.events.add('client:updateHudStyle', (json: string) => {
    // Logica momentana ptr stil
	browser.browser.execute(`if(window.updateHudUiSettings) window.updateHudUiSettings('{"styles": ${json}}')`);
});

mp.events.add('client:saveHudSettings', (json: string) => {
    mp.events.callRemote('server:saveHudSettings', json);
});

// Un simplu hack pentru a inchide HUD-ul din escape sau alt buton as in '/shop'
// Daca e nevoie, aici putem asculta ceva de la React. In mod normal din React avem un onClose.
mp.events.add('client:closeHudSettings', () => {
    mp.gui.cursor.show(false, false);
    mp.gui.chat.show(currentHudVisibility.showChat);
    mp.game.ui.displayRadar(currentHudVisibility.showMinimap);
});
