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

type Door = {
	uid: number;
    name: string;
	hash: number;
	position: { x: number; y: number; z: number };
	locked: boolean;
    faction?: string;
};

const localPlayer = mp.players.local;

class Doors {
	private items: Map<number, Door>;

	constructor() {
		this.items = new Map();

        // Register client events
        mp.events.add('client:Doors:SyncAll', (statesJson: string) => {
            const states = JSON.parse(statesJson);
            Object.keys(states).forEach(uidStr => {
                const uid = parseInt(uidStr);
                const locked = states[uidStr];
                this.updateDoorState(uid, locked);
            });
        });

        mp.events.add('client:Doors:UpdateState', (uid: number, locked: boolean) => {
            this.updateDoorState(uid, locked);
            //mp.game.graphics.notify(locked ? `~r~Usa a fost incuiata!` : `~g~Usa a fost descuiata!`);
        });

		mp.keys.bind(0x45, true, this.toggleNearest.bind(this));
	}

	init() {
		doorsData.forEach((data) => {
            const door: Door = {
                ...data
            };

            // Apply initial control
            mp.game.object.doorControl(door.hash, door.position.x, door.position.y, door.position.z, door.locked, 0.0, 0.0, 0);
            
            this.items.set(door.uid, door);
        });
	}

    private updateDoorState(uid: number, locked: boolean) {
        const door = this.items.get(uid);
        if (door) {
            door.locked = locked;
            mp.game.object.doorControl(door.hash, door.position.x, door.position.y, door.position.z, door.locked, 0.0, 0.0, 0);
        }
    }

	private toggleNearest() {
        let nearestDoor: Door | null = null;
        let minDistance = 2.1;

		this.items.forEach((door) => {
			const dist = mp.game.system.vdist(
                localPlayer.position.x, localPlayer.position.y, localPlayer.position.z,
                door.position.x, door.position.y, door.position.z
            );
            
            if (dist < minDistance) {
                minDistance = dist;
                nearestDoor = door;
            }
		});

        if (nearestDoor) {
            mp.events.callServer('Doors-Toggle', [nearestDoor.uid]);
        }
	}
}

const doors = new Doors();
doors.init();
export default doors;
