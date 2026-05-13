const doorsData = [
    {uid: 0,  name: 'Pacific Standard Bank Main Doors',                     hash: 110411286,    locked: true, position: {x: 232.6054, y: 214.1584, z: 106.4049}},
    {uid: 1,  name: 'Pacific Standard Bank Main Doors',                     hash: 110411286,    locked: true, position: {x: 231.5123, y: 216.5177, z: 106.4049}},
    {uid: 2,  name: 'Pacific Standard Bank Main Doors',                     hash: 110411286,    locked: true, position: {x: 260.6432, y: 203.2052, z: 106.4049}},
    {uid: 3,  name: 'Pacific Standard Bank Main Doors',                     hash: 110411286,    locked: true, position: {x: 258.2022, y: 204.1005, z: 106.4049}},
    {uid: 4,  name: 'Pacific Standard Bank Door To Upstair',                hash: 1956494919,   locked: true, position: {x: 237.7704, y: 227.87, z: 106.426}},
    {uid: 5,  name: 'Pacific Standard Bank Upstair Door',                   hash: 1956494919,   locked: true, position: {x: 236.5488, y: 228.3147, z: 110.4328}},
    {uid: 6,  name: 'Pacific Standard Bank Back To Hall Doors',             hash: 110411286,    locked: true, position: {x: 259.9831, y: 215.2468, z: 106.4049}},
    {uid: 7,  name: 'Pacific Standard Bank Back To Hall Doors',             hash: 110411286,    locked: true, position: {x: 259.0879, y: 212.8062, z: 106.4049}},
    {uid: 8,  name: 'Pacific Standard Bank Upstair Door To Offices',        hash: 1956494919,   locked: true, position: {x: 256.6172, y: 206.1522, z: 110.4328}},
    {uid: 9,  name: 'Pacific Standard Bank Big Office Door',                hash: 964838196,    locked: true, position: {x: 260.8579, y: 210.4453, z: 110.4328}},
    {uid: 10, name: 'Pacific Standard Bank Small Office Door',              hash: 964838196,    locked: true, position: {x: 262.5366, y: 215.0576, z: 110.4328}},
    {uid: 100, name: 'Discount Store South Enter Door',                     hash: -1148826190,  locked: true, position: {x: 82.38156, y: -1390.476, z: 29.52609}},
    {uid: 101, name: 'Discount Store South Enter Door',                     hash: 868499217,    locked: true, position: {x: 82.38156, y: -1390.752, z: 29.52609}},
    {uid: 110, name: 'Los Santos Customs Popular Street Door',              hash: 270330101,    locked: true, position: {x: 723.116, y: -1088.831, z: 23.23201}},
    {uid: 111, name: 'Los Santos Customs Carcer Way Door',                  hash: -550347177,   locked: true, position: {x: -356.0905, y: -134.7714, z: 40.01295}},
    {uid: 112, name: 'Los Santos Customs Greenwich Parkway Door',           hash: -550347177,   locked: true, position: {x: -1145.898, y: -1991.144, z: 14.18357}},
    {uid: 113, name: 'Los Santos Customs Route 68 Doors',                   hash: -822900180,   locked: true, position: {x: 1174.656, y: 2644.159, z: 40.50673}},
    {uid: 114, name: 'Los Santos Customs Route 68 Doors',                   hash: -822900180,   locked: true, position: {x: 1182.307, y: 2644.166, z: 40.50784}},
    {uid: 115, name: 'Los Santos Customs Route 68 Office Door',             hash: 1335311341,   locked: true, position: {x: 1187.202, y: 2644.95, z: 38.55176}},
    {uid: 116, name: 'Los Santos Customs Route 68 Office Door',             hash: 1544229216,   locked: true, position: {x: 1182.646, y: 2641.182, z: 39.31031}},
    {uid: 117, name: 'Beekers Garage Paleto Bay Doors',                     hash: -822900180,   locked: true, position: {x: 114.3135, y: 6623.233, z: 32.67305}},
    {uid: 118, name: 'Beekers Garage Paleto Bay Doors',                     hash: -822900180,   locked: true, position: {x: 108.8502, y: 6617.877, z: 32.67305}},
    {uid: 119, name: 'Beekers Garage Paleto Bay Office Door',               hash: 1335311341,   locked: true, position: {x: 105.1518, y: 6614.655, z: 32.58521}},
    {uid: 120, name: 'Beekers Garage Paleto Bay Interior Door',             hash: 1544229216,   locked: true, position: {x: 105.7772, y: 6620.532, z: 33.34266}},
    {uid: 121, name: 'Ammu Nation Vespucci Boulevard Doors',                hash: -8873588,     locked: true, position: {x: 842.7685, y: -1024.539, z: 28.34478}},
    {uid: 122, name: 'Ammu Nation Vespucci Boulevard Doors',                hash: 97297972,     locked: true, position: {x: 845.3694, y: -1024.539, z: 28.34478}},
    {uid: 123, name: 'Ammu Nation Lindsay Circus Doors',                    hash: -8873588,     locked: true, position: {x: -662.6415, y: -944.3256, z: 21.97915}},
    {uid: 124, name: 'Ammu Nation Lindsay Circus Doors',                    hash: 97297972,     locked: true, position: {x: -665.2424, y: -944.3256, z: 21.97915}},
    {uid: 125, name: 'Ammu Nation Popular Street Doors',                    hash: -8873588,     locked: true, position: {x: 810.5769, y: -2148.27, z: 29.76892}},
    {uid: 126, name: 'Ammu Nation Popular Street Doors',                    hash: 97297972,     locked: true, position: {x: 813.1779, y: -2148.27, z: 29.76892}},
    {uid: 128, name: 'Ammu Nation Popular Street Doors',                    hash: -8873588,     locked: true, position: {x: 18.572, y: -1115.495, z: 29.94694}},
    {uid: 129, name: 'Ammu Nation Popular Street Doors',                    hash: 97297972,     locked: true, position: {x: 16.12787, y: -1114.606, z: 29.94694}},
    {uid: 130, name: 'Ammu Nation Adams Apple Boulevard',                   hash: 452874391,    locked: true, position: {x: 6.81789, y: -1098.209, z: 29.94685}},
    {uid: 131, name: 'Ammu Nation Vinewood Plaza Doors',                    hash: -8873588,     locked: true, position: {x: 243.8379, y: -46.52324, z: 70.09098}},
    {uid: 132, name: 'Ammu Nation Vinewood Plaza Doors',                    hash: 97297972,     locked: true, position: {x: 244.7275, y: -44.07911, z: 70.09098}},
    {uid: 150, name: 'Ponsonbys Portola Drive Door',                        hash: -1922281023,  locked: true, position: {x: -715.6154, y: -157.2561, z: 37.67493}},
    {uid: 151, name: 'Ponsonbys Portola Drive Door',                        hash: -1922281023,  locked: true, position: {x: -716.6755, y: -155.42, z: 37.67493}},
    {uid: 152, name: 'Ponsonbys Portola Drive Door',                        hash: -1922281023,  locked: true, position: {x: -1456.201, y: -233.3682, z: 50.05648}},
    {uid: 153, name: 'Ponsonbys Portola Drive Door',                        hash: -1922281023,  locked: true, position: {x: -1454.782, y: -231.7927, z: 50.05649}},
    {uid: 154, name: 'Ponsonbys Rockford Plaza Door',                       hash: -1922281023,  locked: true, position: {x: -156.439, y: -304.4294, z: 39.99308}},
    {uid: 155, name: 'Ponsonbys Rockford Plaza Door',                       hash: -1922281023,  locked: true, position: {x: -157.1293, y: -306.4341, z: 39.99308}},
    {uid: 156, name: 'Sub Urban Prosperity Street Promenade Door',          hash: 1780022985,   locked: true, position: {x: -1201.435, y: -776.8566, z: 17.99184}},
    {uid: 157, name: 'Sub Urban Hawick Avenue Door',                        hash: 1780022985,   locked: true, position: {x: 127.8201, y: -211.8274, z: 55.22751}},
    {uid: 158, name: 'Sub Urban Route 68 Door',                             hash: 1780022985,   locked: true, position: {x: 617.2458, y: 2751.022, z: 42.75777}},
    {uid: 159, name: 'Sub Urban Chumash Plaza Door',                        hash: 1780022985,   locked: true, position: {x: -3167.75, y: 1055.536, z: 21.53288}},
    {uid: 160, name: 'Robs Liquor Route 1 Main Enter Door',                 hash: -1212951353,  locked: true, position: {x: -2973.535, y: 390.1414, z: 15.18735}},
    {uid: 161, name: 'Robs Liquor Route 1 Personnal Door',                  hash: 1173348778,   locked: true, position: {x: -2965.648, y: 386.7928, z: 15.18735}},
    {uid: 162, name: 'Robs Liquor Route 1 Back Door',                       hash: 1173348778,   locked: true, position: {x: -2961.749, y: 390.2573, z: 15.19322}},
    {uid: 163, name: 'Robs Liquor Prosperity Street Main Enter Door',       hash: -1212951353,  locked: true, position: {x: -1490.411, y: -383.8453, z: 40.30745}},
    {uid: 164, name: 'Robs Liquor Prosperity Street Personnal Door',        hash: 1173348778,   locked: true, position: {x: -1482.679, y: -380.153, z: 40.30745}},
    {uid: 165, name: 'Robs Liquor Prosperity Street Back Door',             hash: 1173348778,   locked: true, position: {x: -1482.693, y: -374.9365, z: 40.31332}},
    {uid: 166, name: 'Robs Liquor San Andreas Avenue Main Enter Door',      hash: -1212951353,  locked: true, position: {x: -1226.894, y: -903.1218, z: 12.47039}},
    {uid: 167, name: 'Robs Liquor San Andreas Avenue Personnal Door',       hash: 1173348778,   locked: true, position: {x: -1224.755, y: -911.4182, z: 12.47039}},
    {uid: 168, name: 'Robs Liquor San Andreas Avenue Back Door',            hash: 1173348778,   locked: true, position: {x: -1219.633, y: -912.406, z: 12.47626}},
    {uid: 169, name: 'Robs Liquor El Rancho Boulevard Main Enter Door',     hash: -1212951353,  locked: true, position: {x: 1141.038, y: -980.3225, z: 46.55986}},
    {uid: 170, name: 'Robs Liquor El Rancho Boulevard Personnal Door',      hash: 1173348778,   locked: true, position: {x: 1132.645, y: -978.6059, z: 46.55986}},
    {uid: 171, name: 'Robs Liquor El Rancho Boulevard Back Door',           hash: 1173348778,   locked: true, position: {x: 129.51, y: -982.7756, z: 46.56573}},
    {uid: 180, name: 'Bob Mulét Barber Shop Door',                          hash: 145369505,    locked: true, position: {x: -822.4442, y: -188.3924, z: 37.81895}},
    {uid: 181, name: 'Bob Mulét Barber Shop Door',                          hash: -1663512092,  locked: true, position: {x: -823.2001, y: -187.0831, z: 37.81895}},
    {uid: 182, name: 'Hair on Hawick Barber Shop Door',                     hash: -1844444717,  locked: true, position: {x: -29.86917, y: -148.1571, z: 57.22648}},
    {uid: 183, name: 'OSheas Barber Shop Door',                             hash: -1844444717,  locked: true, position: {x: 1932.952, y: 3725.154, z: 32.9944}},
    {uid: 190, name: 'Premium Deluxe Motorsport Parking Doors',             hash: 1417577297,   locked: true, position: {x: -37.33113, y: -1108.873, z: 26.7198}},
    {uid: 191, name: 'Premium Deluxe Motorsport Parking Doors',             hash: 2059227086,   locked: true, position: {x: -39.13366, y: -1108.218, z: 26.7198}},
    {uid: 192, name: 'Premium Deluxe Motorsport Main Doors',                hash: 1417577297,   locked: true, position: {x: -60.54582, y: -1094.749, z: 26.88872}},
    {uid: 193, name: 'Premium Deluxe Motorsport Main Doors',                hash: 2059227086,   locked: true, position: {x: -59.89302, y: -1092.952, z: 26.88362}},
    {uid: 194, name: 'Premium Deluxe Motorsport Right Office Door',         hash: -2051651622,  locked: true, position: {x: -33.80989, y: -1107.579, z: 26.57225}},
    {uid: 195, name: 'Premium Deluxe Motorsport Left Office Door',          hash: -2051651622,  locked: true, position: {x: -31.72353, y: -1101.847, z: 26.57225}},
    {uid: 300, name: 'Franklin House Enter Door',                           hash: 520341586,    locked: true, position: {x: -14.86892, y: -1441.182, z: 31.19323}},
    {uid: 301, name: 'Franklin House Garage Door',                          hash: 703855057,    locked: true, position: {x: -25.2784, y: -1431.061, z: 30.83955}},
    {uid: 1000, name: 'Mission Row Police Station Main Enter Doors',        hash: 320433149,    locked: true, position: {x: 434.7479, y: -983.2151, z: 30.83926}},
    {uid: 1001, name: 'Mission Row Police Station Main Enter Doors',        hash: -1215222675,  locked: true, position: {x: 434.7479, y: -980.6184, z: 30.83926}},
    {uid: 1002, name: 'Mission Row Police Station Back Enter Doors',        hash: -2023754432,  locked: true, position: {x: 469.9679, y: -1014.452, z: 26.53623}},
    {uid: 1003, name: 'Mission Row Police Station Back Enter Doors',        hash: -2023754432,  locked: true, position: {x: 467.3716, y: -1014.452, z: 26.53623}},
    {uid: 1004, name: 'Mission Row Police Station Back To Cells Door',      hash: -1033001619,  locked: true, position: {x: 463.4782, y: -1003.538, z: 25.00599}},
    {uid: 1005, name: 'Mission Row Police Station Cell Door 1',             hash: 631614199,    locked: true, position: {x: 461.8065, y: -994.4086, z: 25.06443}},
    {uid: 1006, name: 'Mission Row Police Station Cell Door 2',             hash: 631614199,    locked: true, position: {x: 461.8065, y: -997.6583, z: 25.06443}},
    {uid: 1007, name: 'Mission Row Police Station Cell Door 3',             hash: 631614199,    locked: true, position: {x: 461.8065, y: -1001.302, z: 25.06443}},
    {uid: 1008, name: 'Mission Row Police Station Door To Cells Door',      hash: 631614199,    locked: true, position: {x: 464.5701, y: -992.6641, z: 25.06443}},
    {uid: 1009, name: 'Mission Row Police Station Captans Office Door',     hash: -1320876379,  locked: true, position: {x: 446.5728, y: -980.0106, z: 30.8393}},
    {uid: 1010, name: 'Mission Row Police Station Armory Double Door',      hash: 185711165,    locked: true, position: {x: 450.1041, y: -984.0915, z: 30.8393}},
    {uid: 1011, name: 'Mission Row Police Station Armory Double Door',      hash: 185711165,    locked: true, position: {x: 450.1041, y: -981.4915, z: 30.8393}},
    {uid: 1012, name: 'Mission Row Police Station Armory Secure Door',      hash: 749848321,    locked: true, position: {x: 453.0793, y: -983.1895, z: 30.83926}},
    {uid: 1013, name: 'Mission Row Police Station Locker Rooms Door',       hash: 1557126584,   locked: true, position: {x: 450.1041, y: -985.7384, z: 30.8393}},
    {uid: 1014, name: 'Mission Row Police Station Locker Room 1 Door',      hash: -2023754432,  locked: true, position: {x: 452.6248, y: -987.3626, z: 30.8393}},
    {uid: 1015, name: 'Mission Row Police Station Roof Access Door',        hash: 749848321,    locked: true, position: {x: 461.2865, y: -985.3206, z: 30.83926}},
    {uid: 1016, name: 'Mission Row Police Station Roof Door',               hash: -340230128,   locked: true, position: {x: 464.3613, y: -984.678, z: 43.83443}},
    {uid: 1017, name: 'Mission Row Police Station Cell And Briefing Doors', hash: 185711165,    locked: true, position: {x: 443.4078, y: -989.4454, z: 30.8393}},
    {uid: 1018, name: 'Mission Row Police Station Cell And Briefing Doors', hash: 185711165,    locked: true, position: {x: 446.0079, y: -989.4454, z: 30.8393}},
    {uid: 1019, name: 'Mission Row Police Station Briefing Doors',          hash: -131296141,   locked: true, position: {x: 443.0298, y: -991.941, z: 30.8393}},
    {uid: 1020, name: 'Mission Row Police Station Briefing Doors',          hash: -131296141,   locked: true, position: {x: 443.0298, y: -994.5412, z: 30.8393}},
    {uid: 1021, name: 'Mission Row Police Station Back Gate Door',          hash: -1603817716,  locked: true, position: {x: 489.301, y: -1020.029, z: 28.078}},
    {uid: 500, name: 'Vanilla Unicorn Main Enter Door',                     hash: -1116041313,  locked: true, position: {x: 127.9552, y: -1298.503, z: 29.41962}},
    {uid: 501, name: 'Vanilla Unicorn Back Enter Door',                     hash: 668467214,    locked: true, position: {x: 96.09197, y: -1284.854, z: 29.43878}},
    {uid: 502, name: 'Vanilla Unicorn Office Door',                         hash: -626684119,   locked: true, position: {x: 99.08321, y: -1293.701, z: 29.41868}},
    {uid: 503, name: 'Vanilla Unicorn Dress Door',                          hash: -495720969,   locked: true, position: {x: 113.9822, y: -1297.43, z: 29.41868}},
    {uid: 504, name: 'Vanilla Unicorn Private Rooms Door',                  hash: -1881825907,  locked: true, position: {x: 116.0046, y: -1294.692, z: 29.41947}},


	{uid: 2000, name: 'Pacific Standard Bank Main Safe',                    hash: 961976194,    locked: true, position: {x: 254.230, y: 224.55, z: 101.87}},

    {uid: 510, name: 'Bolingbroke Penitentiary Main Enter First Door',      hash: 741314661,    locked: true, position: {x: 1844.72, y: 2608.49, z: 46.0}},
    {uid: 511, name: 'Bolingbroke Penitentiary Main Enter Second Door',     hash: 741314661,    locked: true, position: {x: 1818.252, y: 2608.384, z: 46.0}},
    {uid: 512, name: 'Bolingbroke Penitentiary Main Enter Third Door',      hash: 741314661,    locked: true, position: {x: 1795.98, y: 2616.696, z: 45.565}},

	
	{uid: 3000, name: 'Usa intrare politie paleto dreapta',                 hash: 2793810241,   locked: true, position: {x: -444.525, y: 6017.031, z: 31.866}, faction: 'politie'},
    {uid: 3001, name: 'Usa intrare politie paleto stanga',                  hash: 2793810241,   locked: true, position: {x: -442.682, y: 6015.207, z: 31.867}, faction: 'politie'}

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
            mp.game.graphics.notify(locked ? `~r~Usa a fost incuiata!` : `~g~Usa a fost descuiata!`);
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
