import browser from 'helpers/browser';

mp.events.add('AnuntNotification2', (message: string, type: string) => {
  mp.gui.chat.push(`[DEBUG] Notificare primita client: ${message} (tip: ${type})`);
  browser.browser.execute(`window.NotifyAnnouncement2(${JSON.stringify(message)}, ${JSON.stringify(type)})`);
});

