import browser from 'helpers/browser';

mp.events.add('AnuntGlobal', (text: string) => {
    // Calculează durata exact ca în UI (mesaj.length / 5, minim 18s)
    const durationSec = Math.max(18, text.length / 5);

    // Trimite mesaj + durata în UI
    browser.browser.execute(`window.AnuntGlobal(${JSON.stringify(text)}, ${durationSec})`);

    // 🔹 Pornește efectul camera shake
    try {
        mp.game.cam.shakeGameplayCam("SKY_DIVING_SHAKE", 1.0);
    } catch (e) {
        mp.gui.chat.push("!{#ff0000}[DEBUG] Eroare la shakeGameplayCam");
    }

    // 🔹 Oprește shake-ul exact la finalul anunțului
    setTimeout(() => {
        mp.game.cam.stopGameplayCamShaking(true);
    }, durationSec * 1000);
});

