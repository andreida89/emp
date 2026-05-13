import browser from 'helpers/browser';

let isMenuOpen = false;
let blockEscTimer = 0;

mp.keys.bind(0x7B, true, () => {
    // F12 pressed
    const player = mp.players.local;
    const adminLvl = player.getVariable('adminLvl') as number || 0;
    if (adminLvl > 0) {
        mp.events.callRemote('server:requestAdminMenu');
    }
});

mp.events.add('client:openAdminMenu', (adminLvl: number, adminDuty: boolean, whitelistStatus: boolean) => {
    browser.browser.execute(`if(window.toggleAdminMenu) window.toggleAdminMenu(${adminLvl}, ${adminDuty}, ${whitelistStatus});`);
});

mp.keys.bind(0x79, true, () => {
    // F10 pressed
    const player = mp.players.local;
    const adminLvl = player.getVariable('adminLvl') as number || 0;
    if (adminLvl > 0) {
        const adminDuty = player.getVariable('admin_duty') || false;
        if (adminDuty) {
            browser.browser.execute(`if(window.toggleAdminTickets) window.toggleAdminTickets();`);
        } else {
            mp.events.call('AnuntNotification2', ['Trebuie sa fii la datorie (Duty ON) pentru a vedea ticketele!', 'rosu']);
        }
    }
});

mp.events.add('client:adminMenuState', (isOpen: boolean) => {
    isMenuOpen = isOpen;
    mp.gui.cursor.show(isOpen, isOpen);
    
    if (!isOpen) {
        blockEscTimer = Date.now() + 200;
    }
});

mp.events.add('render', () => {
    if (isMenuOpen || Date.now() < blockEscTimer) {
        mp.game.controls.disableControlAction(0, 199, true);
        mp.game.controls.disableControlAction(0, 200, true);
        mp.game.controls.disableControlAction(2, 199, true);
        mp.game.controls.disableControlAction(2, 200, true);
    }
});

mp.events.add('client:adminList', (type: string) => {
    mp.events.callRemote('server:adminList', type);
});

mp.events.add('client:adminAction', (action: string, data: string) => {
    mp.events.callRemote('server:adminAction', action, data);
});

mp.events.add('client:adminVeh', (action: string, data: any = 0) => {
    mp.events.callRemote('server:adminVeh', action, typeof data === 'object' ? JSON.stringify(data) : data.toString());
});

mp.events.add('client:adminTeleport', (id: number) => {
    mp.events.callRemote('server:adminTeleport', id);
});

mp.events.add('client:adminOrgMarkers', (action: string, data: string) => {
    mp.events.callRemote('server:adminOrgMarkers', action, data);
});

mp.events.add('client:whitelistAction', (action: string, data: any) => {
    mp.events.callRemote('client:whitelistAction', action, typeof data === 'object' ? JSON.stringify(data) : data);
});

mp.events.add('Admin-GetLastHouseId', () => {
    mp.events.callRemote('Admin-GetLastHouseId');
});

mp.events.add('client:setLastHouseId', (id: number) => {
    browser.browser.execute(`if(window.setLastHouseId) window.setLastHouseId(${id});`);
});

mp.events.add('client:setAdminList', (title: string, data: string) => {
    browser.browser.execute(`if(window.setAdminList) window.setAdminList('${title}', '${data.replace(/'/g, "\\'")}');`);
});

mp.events.add('client:setOrgRanks', (data: string) => {
    browser.browser.execute(`if(window.setOrgRanks) window.setOrgRanks('${data.replace(/'/g, "\\'")}');`);
});

mp.events.add('client:setOrgMembers', (data: string) => {
    browser.browser.execute(`if(window.setOrgMembers) window.setOrgMembers('${data.replace(/'/g, "\\'")}');`);
});
