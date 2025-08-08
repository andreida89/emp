let normalStreamDistance = 500;   // default
let chaseStreamDistance = 1500;   // urmărire
let isInChaseMode = false;

// 📌 Ascultă comanda de schimbare trimisă de server
mp.events.add('client:setStreamDistance', (distance: number) => {
    //mp.gui.chat.push(`!{#00ff00}[DEBUG Client] Setăm streamRange la ${distance}`);
    mp.players.local.streamRange = distance;
});

// 📌 Monitorizează viteza și trimite update către server
mp.events.add('render', () => {
    const player = mp.players.local;

    if (!player.vehicle) {
        if (isInChaseMode) {
            //mp.gui.chat.push(`!{#ffaa00}[DEBUG Client] Ieșit din vehicul - revenim la ${normalStreamDistance}`);
            mp.events.callRemote('server:streamDistance:set', normalStreamDistance);
            isInChaseMode = false;
        }
        return;
    }

    const velocity = player.vehicle.getSpeed() * 3.6; // m/s → km/h

    if (velocity > 100 && !isInChaseMode) {
        //mp.gui.chat.push(`!{#00ffff}[DEBUG Client] Viteza ${velocity.toFixed(1)} km/h - intrăm în chase mode (${chaseStreamDistance})`);
        mp.events.callRemote('server:streamDistance:set', chaseStreamDistance);
        isInChaseMode = true;
    } 
    else if (velocity < 80 && isInChaseMode) {
        //mp.gui.chat.push(`!{#ffaa00}[DEBUG Client] Viteza ${velocity.toFixed(1)} km/h - revenim la normal (${normalStreamDistance})`);
        mp.events.callRemote('server:streamDistance:set', normalStreamDistance);
        isInChaseMode = false;
    }
});

