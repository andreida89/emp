function serializeComponentSet(dataSet: Set<number>): string {
    return Array.from(dataSet).map((hash) => hash.toString(36)).join("|");
}

interface ExtendedPlayerMp extends PlayerMp {
    __weaponComponents: Record<number, Set<number>>;
}

// Events
mp.events.add("playerJoin", (player: PlayerMp) => {
    const extPlayer = player as ExtendedPlayerMp;
    extPlayer.__weaponComponents = {};
    console.log(`[DEBUG] playerJoin: Initialized __weaponComponents for ${player.name}`);
});

mp.events.add("playerWeaponChange", (player: PlayerMp, oldWeapon: number, newWeapon: number) => {
    const extPlayer = player as ExtendedPlayerMp;
    const compSet = extPlayer.__weaponComponents?.[newWeapon];
    extPlayer.setVariable(
        "currentWeaponComponents",
        newWeapon.toString(36) + "." + (compSet ? serializeComponentSet(compSet) : "")
    );
    console.log(`[DEBUG] playerWeaponChange: ${player.name} switched from ${oldWeapon} to ${newWeapon}, comps: ${compSet ? serializeComponentSet(compSet) : "none"}`);
});

// Prototype methods
(mp.Player.prototype as ExtendedPlayerMp).giveWeaponComponent = function(this: ExtendedPlayerMp, weaponHash: number, componentHash: number): void {
    if (!Number.isInteger(weaponHash) || !Number.isInteger(componentHash)) throw new TypeError("Non number argument(s) passed to giveWeaponComponent.");
    if (!this.__weaponComponents.hasOwnProperty(weaponHash)) this.__weaponComponents[weaponHash] = new Set();
    this.__weaponComponents[weaponHash].add(componentHash);

    console.log(`[DEBUG] giveWeaponComponent: ${this.name} hash=${weaponHash} component=${componentHash}`);

    if (this.weapon === weaponHash) {
        this.setVariable("currentWeaponComponents", weaponHash.toString(36) + "." + serializeComponentSet(this.__weaponComponents[weaponHash]));
        console.log(`[DEBUG] giveWeaponComponent: Updated currentWeaponComponents variable for ${this.name}`);
    } else {
        mp.players.callInRange(this.position, mp.config["stream-distance"], "updatePlayerWeaponComponent", [this, weaponHash.toString(36), componentHash.toString(36), false]);
        console.log(`[DEBUG] giveWeaponComponent: Called updatePlayerWeaponComponent in range for ${this.name}`);
    }
};

(mp.Player.prototype as ExtendedPlayerMp).hasWeaponComponent = function(this: ExtendedPlayerMp, weaponHash: number, componentHash: number): boolean {
    if (!Number.isInteger(weaponHash) || !Number.isInteger(componentHash)) throw new TypeError("Non number argument(s) passed to hasWeaponComponent.");
    const has = this.__weaponComponents.hasOwnProperty(weaponHash)
        ? this.__weaponComponents[weaponHash].has(componentHash)
        : false;
    console.log(`[DEBUG] hasWeaponComponent: ${this.name} hash=${weaponHash} component=${componentHash} result=${has}`);
    return has;
};

(mp.Player.prototype as ExtendedPlayerMp).getWeaponComponents = function(this: ExtendedPlayerMp, weaponHash: number): number[] {
    if (!Number.isInteger(weaponHash)) throw new TypeError("Non number argument passed to getWeaponComponents.");
    const comps = this.__weaponComponents.hasOwnProperty(weaponHash)
        ? Array.from(this.__weaponComponents[weaponHash])
        : [];
    console.log(`[DEBUG] getWeaponComponents: ${this.name} hash=${weaponHash} result=[${comps.join(',')}]`);
    return comps;
};

(mp.Player.prototype as ExtendedPlayerMp).removeWeaponComponent = function(this: ExtendedPlayerMp, weaponHash: number, componentHash: number): void {
    if (!Number.isInteger(weaponHash) || !Number.isInteger(componentHash)) throw new TypeError("Non number argument(s) passed to removeWeaponComponent.");

    if (this.__weaponComponents.hasOwnProperty(weaponHash)) {
        this.__weaponComponents[weaponHash].delete(componentHash);
        console.log(`[DEBUG] removeWeaponComponent: ${this.name} hash=${weaponHash} component=${componentHash}`);

        if (this.weapon === weaponHash) {
            this.setVariable("currentWeaponComponents", weaponHash.toString(36) + "." + serializeComponentSet(this.__weaponComponents[weaponHash]));
            console.log(`[DEBUG] removeWeaponComponent: Updated currentWeaponComponents variable for ${this.name}`);
        } else {
            mp.players.callInRange(this.position, mp.config["stream-distance"], "updatePlayerWeaponComponent", [this, weaponHash.toString(36), componentHash.toString(36), true]);
            console.log(`[DEBUG] removeWeaponComponent: Called updatePlayerWeaponComponent in range for ${this.name}`);
        }
    }
};

(mp.Player.prototype as ExtendedPlayerMp).removeAllWeaponComponents = function(this: ExtendedPlayerMp, weaponHash: number): void {
    if (!Number.isInteger(weaponHash)) throw new TypeError("Non number argument passed to removeAllWeaponComponents.");

    if (this.__weaponComponents.hasOwnProperty(weaponHash)) {
        console.log(`[DEBUG] removeAllWeaponComponents: ${this.name} hash=${weaponHash}`);
        if (this.weapon === weaponHash) {
            this.setVariable("currentWeaponComponents", weaponHash.toString(36) + ".");
            console.log(`[DEBUG] removeAllWeaponComponents: Updated currentWeaponComponents variable for ${this.name}`);
        } else {
            mp.players.callInRange(this.position, mp.config["stream-distance"], "resetPlayerWeaponComponents", [this, weaponHash.toString(36)]);
            console.log(`[DEBUG] removeAllWeaponComponents: Called resetPlayerWeaponComponents in range for ${this.name}`);
        }
        delete this.__weaponComponents[weaponHash];
    }
};

(mp.Player.prototype as ExtendedPlayerMp).resetAllWeaponComponents = function(this: ExtendedPlayerMp): void {
    if (this.__weaponComponents.hasOwnProperty(this.weapon)) {
        this.setVariable("currentWeaponComponents", this.weapon.toString(36) + ".");
        console.log(`[DEBUG] resetAllWeaponComponents: Updated currentWeaponComponents variable for ${this.name}`);
    }
    mp.players.callInRange(this.position, mp.config["stream-distance"], "nukePlayerWeaponComponents", [this]);
    console.log(`[DEBUG] resetAllWeaponComponents: Called nukePlayerWeaponComponents in range for ${this.name}`);
    this.__weaponComponents = {};
};
