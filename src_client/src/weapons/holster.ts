const player = mp.players.local;
let weaponToRestore = 0;
let unarmedTime = 0;
const UNARMED_HASH = 2725352035; // weapon_unarmed unsigned

// Monitorizăm constant arma pe care o are în mână
mp.events.add('render', () => {
    if (player.handle === 0) return;

    const current = player.weapon;
    const vehicle = player.vehicle;
    
    // Dacă are o armă validă în mână (excludem weapon_unarmed și varianta sa signed)
    if (current !== 0 && current !== UNARMED_HASH && current !== -1569615917 && current !== 2725352035) {
        weaponToRestore = current;
        unarmedTime = 0;
    } else {
        // Dacă este dezarmat
        if (vehicle) {
            // Dacă suntem în vehicul, nu considerăm că "am pus arma în holster voluntar"
            // Resetăm timpul de dezarmare pentru a nu expira cât stăm în mașină
            unarmedTime = 0; 
        } else {
            if (unarmedTime === 0) unarmedTime = Date.now();
            
            // Dacă suntem dezarmați pe picioare de mai mult de 2 secunde, "uităm" arma
            if (unarmedTime !== 0 && Date.now() - unarmedTime > 2000) {
                weaponToRestore = 0;
            }
        }
    }
});

mp.events.add('playerLeaveVehicle', () => {
    // Împiedicăm resetarea weaponToRestore în următoarele secunde prin decalarea unarmedTime în viitor
    unarmedTime = Date.now() + 5000; 

    if (weaponToRestore !== 0) {
        const weaponHash = weaponToRestore;
        let attempts = 0;
        
        const interval = setInterval(() => {
            attempts++;
            
            // Așteptăm să fim pe picioare (fără vehicul)
            if (player.handle !== 0 && !player.vehicle) {
                // Încercăm să punem arma în mână
                mp.game.invoke('0xADF692B254977C0C', player.handle, weaponHash, true);
                
                // Dacă s-a echipat sau am încercat destul (cca 5 secunde)
                if (player.weapon === weaponHash || attempts > 25) {
                    clearInterval(interval);
                    unarmedTime = 0; // Revenim la monitorizarea normală
                }
            } else if (attempts > 40) {
                clearInterval(interval);
            }
        }, 200);
    }
});
