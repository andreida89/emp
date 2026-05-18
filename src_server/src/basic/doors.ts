const doorsData = [
    {uid: 510, name: 'Bolingbroke Penitentiary Main Enter First Door',      hash: 741314661,    locked: true, position: {x: 1844.72, y: 2608.49, z: 46.0}},
    {uid: 511, name: 'Bolingbroke Penitentiary Main Enter Second Door',     hash: 741314661,    locked: true, position: {x: 1818.252, y: 2608.384, z: 46.0}},
    {uid: 512, name: 'Bolingbroke Penitentiary Main Enter Third Door',      hash: 741314661,    locked: true, position: {x: 1795.98, y: 2616.696, z: 45.565}},


	{uid: 3000, name: 'Usa intrare politie paleto dreapta',                 hash: 2793810241,   locked: true, position: {x: -444.525, y: 6017.031, z: 31.866}, faction: 'politie'},
    {uid: 3001, name: 'Usa intrare politie paleto stanga',                  hash: 2793810241,   locked: true, position: {x: -442.682, y: 6015.207, z: 31.867}, faction: 'politie'},
    {uid: 3002, name: 'Usa intrare politie paleto spate',                   hash: 2271212864,   locked: true, position: {x: -447.236, y: 6002.317, z: 31.840}, faction: 'politie'},
    {uid: 3003, name: 'Usa interior politie paleto sec notice',             hash: 749848321,   locked: true, position: {x: -440.422, y: 5998.603, z: 31.868}, faction: 'politie'},
    {uid: 3004, name: 'Usa interior politie paleto sec notice',             hash: 749848321,   locked: true, position: {x: -439.158, y: 5998.157, z: 31.868}, faction: 'politie'},
    {uid: 3005, name: 'Usa interior politie paleto sec notice',             hash: 749848321,   locked: true, position: {x: -437.042, y: 6003.705, z: 31.868}, faction: 'politie'},
	{uid: 3006, name: 'Usa interior politie paleto dreapta',                hash: 2271212864,   locked: true, position: {x: -441.025, y: 6012.792, z: 31.868}, faction: 'politie'},
    {uid: 3007, name: 'Usa interior politie paleto stanga',                 hash: 2271212864,   locked: true, position: {x: -442.867, y: 6010.962, z: 31.869}, faction: 'politie'},
 	{uid: 3008, name: 'Usa interior politie paleto dreapta',                hash: 2271212864,   locked: true, position: {x: -442.655, y: 6009.300, z: 31.871}, faction: 'politie'},
    {uid: 3009, name: 'Usa interior politie paleto stanga',                 hash: 2271212864,   locked: true, position: {x: -440.815, y: 6007.460, z: 31.871}, faction: 'politie'},
    {uid: 3010, name: 'Usa interior politie paleto celule jos',             hash: 2367212570,   locked: true, position: {x: -438.228, y: 6006.167, z: 28.136}, faction: 'politie'},
    {uid: 3011, name: 'Usa interior politie paleto celule jos',             hash: 2367212570,   locked: true, position: {x: -442.108, y: 6010.052, z: 28.136}, faction: 'politie'},
    {uid: 3012, name: 'Usa interior politie paleto celule jos',             hash: 2367212570,   locked: true, position: {x: -444.368, y: 6012.223, z: 28.136}, faction: 'politie'},
    {uid: 3013, name: 'Usa interior politie paleto celule jos',             hash: 749848321,   locked: true, position: {x: -436.628, y: 6002.548, z: 28.141}, faction: 'politie'},
    {uid: 3014, name: 'Usa interior politie paleto celule jos',             hash: 749848321,   locked: true, position: {x: -433.938, y: 6005.278, z: 28.141}, faction: 'politie'},
    {uid: 3015, name: 'Usa interior politie paleto celule jos',             hash: 2974090917,   locked: true, position: {x: -436.516, y: 6007.844, z: 28.138}, faction: 'politie'},
    {uid: 3016, name: 'Usa interior politie paleto celule jos',             hash: 2974090917,   locked: true, position: {x: -434.678, y: 6009.680, z: 28.138}, faction: 'politie'},


]; 

class Doors {
    private items: Map<number, boolean>;
    private doorConfigs: Map<number, any>;

    constructor() {
        this.items = new Map();
        this.doorConfigs = new Map();

        // Initialize with default states
        doorsData.forEach(door => {
            this.items.set(door.uid, door.locked);
            this.doorConfigs.set(door.uid, door);
        });

        mp.events.add('playerJoin', (player: PlayerMp) => {
            // Send current states to the joining player
            player.call('client:Doors:SyncAll', [this.getItemsState()]);
        });

        mp.events.subscribe({
            'Doors-Toggle': this.toggle.bind(this)
        });
    }

    private toggle(player: any, uid: number) {
        const config = this.doorConfigs.get(uid);
        if (!config) return;

        const pmp = player.mp;
        const playerFaction = player.faction || (pmp && typeof pmp.getVariable === 'function' ? pmp.getVariable('faction') : null);
        const aduty = player.admin_duty || (pmp && typeof pmp.getVariable === 'function' ? (pmp.getVariable('admin_duty') || pmp.getVariable('adminTag')) : false);

        // Point 3: /aduty on clarifies all doors
        // New: 'sindicat' faction clarifies all doors
        const isSindicat = playerFaction === 'sindicat';

        // Check faction access if defined
        if (config.faction && !aduty && !isSindicat) {
            if (playerFaction !== config.faction) {
                // Nu facem absolut nimic (Point 2)
                return;
            }
        }

        const currentState = this.items.get(uid);
        if (currentState === undefined) return;

        const newState = !currentState;
        this.items.set(uid, newState);

        // Broadcast to all players
        mp.players.call('client:Doors:UpdateState', [uid, newState]);
    }

    private getItemsState() {
        const state: { [key: number]: boolean } = {};
        this.items.forEach((locked, uid) => {
            state[uid] = locked;
        });
        return JSON.stringify(state);
    }
}

export default new Doors();