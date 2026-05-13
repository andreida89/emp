import rpc from 'rage-rpc';
import browser from '../helpers/browser';

let lastEscPress = 0;

mp.events.add('render', () => {
    // Disable default pause menu (map, settings, etc.)
    mp.game.controls.disableControlAction(0, 199, true); // P
    mp.game.controls.disableControlAction(0, 200, true); // ESC
    mp.game.controls.disableControlAction(2, 199, true);
    mp.game.controls.disableControlAction(2, 200, true);

    // Daca jucatorul a apasat ESC
    if (mp.game.controls.isDisabledControlJustPressed(0, 200) || mp.game.controls.isDisabledControlJustPressed(0, 199)) {
        if (Date.now() - lastEscPress < 500) return;
        lastEscPress = Date.now();

        // Verificam daca niciun UI nu este activ (cursorul nu e vizibil)
        if (!mp.gui.cursor.visible) {
            mp.gui.cursor.show(true, true);
            browser.showPage('escmenu');
        }
    }
});

rpc.register('EscMenu-OpenMap', () => {
    mp.game.ui.activateFrontendMenu(mp.game.joaat('FE_MENU_VERSION_MP_PAUSE'), false, -1);
});

rpc.register('EscMenu-OpenSettings', () => {
    mp.game.ui.activateFrontendMenu(mp.game.joaat('FE_MENU_VERSION_LANDING_MENU'), false, -1);
});

rpc.register('EscMenu-OpenTickets', () => {
    browser.showPage('player/tickets');
});

rpc.register('EscMenu-JobGPS', (jobName: string) => {
    // Aici adăugăm un dicționar cu locațiile job-urilor
    // (Așa cum a pus user-ul waypoint-ul)
    const jobLocations: { [key: string]: { x: number, y: number, z: number } } = {
        'Curier': { x: -413.4357, y: -2797.7719, z: 6.000 },
        'Miner': { x: -595.34, y: 2091.24, z: 131.41 },
        'Pescar': { x: -1593.71, y: 5202.90, z: 4.31 },
        'Taietor Lemne': { x: -552.88, y: 5373.1, z: 70.21 }, // Update if needed
        'Fermier': { x: 2362.4, y: 4747.7, z: 35.2 }, // Culegator portocale/salata/etc
        'Rame': { x: -1607.72, y: 5262.13, z: 2.08 }
    };

    let loc = jobLocations[jobName];
    if (!loc) {
        // În caz că nu e din lista asta
        if (jobName.toLowerCase().includes('curier')) {
            loc = jobLocations['Curier'];
        } else if (jobName.toLowerCase().includes('miner')) {
            loc = jobLocations['Miner'];
        } else if (jobName.toLowerCase().includes('pescar')) {
            loc = jobLocations['Pescar'];
        } else if (jobName.toLowerCase().includes('lemne')) {
            loc = jobLocations['Taietor Lemne'];
        }
    }

    if (loc) {
        mp.game.ui.setNewWaypoint(loc.x, loc.y);
        mp.events.call('alert', 'success', `Ai plasat waypoint către locația job-ului: ${jobName}`);
    } else {
        mp.events.call('alert', 'error', `Nu s-a putut găsi o locație pe hartă pentru job-ul tău.`);
    }
});

mp.events.add('client:EscMenuCursor', (state: boolean) => {
    mp.gui.cursor.show(state, state);
});
