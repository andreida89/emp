const Natives = {
    GIVE_WEAPON_COMPONENT_TO_PED: "0xD966D51AA5B28BB9",
    REMOVE_WEAPON_COMPONENT_FROM_PED: "0x1E8BE90C74FB4C09",
    SET_CURRENT_PED_WEAPON: "0xADF692B254977C0C"
};

type WeaponComponentData = Record<number, Set<number>>;

interface ExtendedPlayerMp extends PlayerMp {
    __weaponComponentData?: WeaponComponentData;
}

function debugChat(text: string) {
    mp.gui.chat.push(`[DEBUG] ${text}`);
}

function addComponentToPlayer(player: ExtendedPlayerMp, weaponHash: number, componentHash: number) {
    if (!player.__weaponComponentData) player.__weaponComponentData = {};
    if (!player.__weaponComponentData[weaponHash]) player.__weaponComponentData[weaponHash] = new Set();

    player.__weaponComponentData[weaponHash].add(componentHash);
    debugChat(`AddComponent: weapon=${weaponHash} comp=${componentHash}`);
    mp.game.invoke(Natives.GIVE_WEAPON_COMPONENT_TO_PED, player.handle, weaponHash | 0, componentHash | 0);
}

function removeComponentFromPlayer(player: ExtendedPlayerMp, weaponHash: number, componentHash: number) {
    if (!player.__weaponComponentData) player.__weaponComponentData = {};
    if (!player.__weaponComponentData[weaponHash]) player.__weaponComponentData[weaponHash] = new Set();

    player.__weaponComponentData[weaponHash].delete(componentHash);
    debugChat(`RemoveComponent: weapon=${weaponHash} comp=${componentHash}`);
    mp.game.invoke(Natives.REMOVE_WEAPON_COMPONENT_FROM_PED, player.handle, weaponHash | 0, componentHash | 0);
}

mp.events.add("updatePlayerWeaponComponent", (
    player: ExtendedPlayerMp,
    weaponHash: string | number,
    componentHash: string | number,
    removeComponent: boolean
) => {
    const wHash = typeof weaponHash === "string" ? parseInt(weaponHash, 36) : weaponHash;
    const cHash = typeof componentHash === "string" ? parseInt(componentHash, 36) : componentHash;

    debugChat(`updatePlayerWeaponComponent: weapon=${wHash}, comp=${cHash}, remove=${removeComponent}`);
    if (removeComponent) {
        removeComponentFromPlayer(player, wHash, cHash);
    } else {
        addComponentToPlayer(player, wHash, cHash);
    }
});

mp.events.add("resetPlayerWeaponComponents", (
    player: ExtendedPlayerMp,
    weaponHash: string | number
) => {
    if (!player.__weaponComponentData) return;

    const wHash = typeof weaponHash === "string" ? parseInt(weaponHash, 36) : weaponHash;
    if (!player.__weaponComponentData[wHash]) return;

    debugChat(`resetPlayerWeaponComponents: weapon=${wHash}`);

    for (const componentHash of player.__weaponComponentData[wHash]) {
        mp.game.invoke(Natives.REMOVE_WEAPON_COMPONENT_FROM_PED, player.handle, wHash | 0, componentHash | 0);
    }
    player.__weaponComponentData[wHash].clear();
});

mp.events.add("nukePlayerWeaponComponents", (player: ExtendedPlayerMp) => {
    if (!player.__weaponComponentData) return;

    debugChat("nukePlayerWeaponComponents");
    for (const weapon in player.__weaponComponentData) {
        const wHash = Number(weapon);
        for (const componentHash of player.__weaponComponentData[wHash]) {
            mp.game.invoke(Natives.REMOVE_WEAPON_COMPONENT_FROM_PED, player.handle, wHash | 0, componentHash | 0);
        }
    }

    player.__weaponComponentData = {};
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type === 'player') {
        // Oferim o proprietate custom pentru interval
        if (entity.syncInterval) clearInterval(entity.syncInterval);

        entity.syncInterval = setInterval(() => {
            let data = entity.getVariable('currentWeaponComponents');
            if (data) {
                let [weaponHash, components] = data.split('.');
                weaponHash = parseInt(weaponHash, 36);
                let componentsArray = (components && components.length > 0) ? components.split('|').map(hash => parseInt(hash, 36)) : [];

                entity.giveWeapon(weaponHash, -1, true);
                for (let component of componentsArray) addComponentToPlayer(entity, weaponHash, component);
                mp.game.invoke(Natives.SET_CURRENT_PED_WEAPON, entity.handle, weaponHash >> 0, true);
            }
        }, 1000);
    }
});

mp.events.add('entityStreamOut', (entity) => {
    if (entity.type === 'player' && entity.syncInterval) {
        clearInterval(entity.syncInterval);
        entity.syncInterval = undefined;
    }
    // Cleanup-ul de la __weaponComponentData poate rămâne
    const extPlayer = entity;
    if (extPlayer.__weaponComponentData) {
        debugChat(`entityStreamOut: cleanup for player`);
        extPlayer.__weaponComponentData = {};
    }
});


mp.events.addDataHandler("currentWeaponComponents", (entity: EntityMp, value: string) => {
    if (entity.type === "player" && entity.handle !== 0) {
        const extPlayer = entity as ExtendedPlayerMp;
        if (!extPlayer.__weaponComponentData) extPlayer.__weaponComponentData = {};

        let [weaponHash, components] = value.split(".");
        const wHash = parseInt(weaponHash, 36);

        if (!extPlayer.__weaponComponentData[wHash]) extPlayer.__weaponComponentData[wHash] = new Set();

        const currentComponents = extPlayer.__weaponComponentData[wHash];
        const newComponents = (components && components.length > 0)
            ? components.split("|").map(hash => parseInt(hash, 36))
            : [];

        debugChat(`addDataHandler: weapon=${wHash}, comps=[${newComponents.join(",")}]`);

        // Remove components not present anymore
        for (const component of Array.from(currentComponents)) {
            if (!newComponents.includes(component)) removeComponentFromPlayer(extPlayer, wHash, component);
        }

        // Add new components
        for (const component of newComponents) {
            addComponentToPlayer(extPlayer, wHash, component);
        }
        mp.game.invoke(Natives.SET_CURRENT_PED_WEAPON, extPlayer.handle, wHash | 0, true);

        // Sync set
        extPlayer.__weaponComponentData[wHash] = new Set(newComponents);
    }
});
