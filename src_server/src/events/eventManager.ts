export const eventLocations = {
    cayo: {
      name: 'Razie Cayo',
      position: { x: 4447.22, y: -4490.71, z: 4.22 },
      teams: {
        diicot: { x: 3084.40, y: -4779.14, z: 15.26 },
        mafioti: { x: 4378.01, y: -4564.35, z: 4.20 }
      }
    },
    mirror: {
      name: 'Razie Mirror',
      position: { x: 1154.70, y: -477.24, z: 66.22 },
      teams: {
        diicot: { x: 916.76, y: -63.55, z: 78.76 },
        mafioti: { x: 1176.42, y: -517.12, z: 65.09 }
      }
    },
    highway: {
      name: 'Jaf Highway',
      position: { x: -2956.57, y: 465.85, z: 15.18 },
      teams: {
        diicot: { x: -2600.66, y: -141.25, z: 21.16 },
        mafioti: { x: -3149.72, y: 1075.21, z: 20.68 }
      }
    },
    grove: {
      name: 'Razie Grove',
      position: { x: 31.12, y: -1754.74, z: 29.30 },
      teams: {
        diicot: { x: -328.01, y: -1460.40, z: 30.50 },
        mafioti: { x: 356.97, y: -1970.18, z: 24.42 }
      }
    },
    vespucci: {
      name: 'Razie Vespucci',
      position: { x: -1046.97, y: -1043.92, z: 5.32 },
      teams: {
        diicot: { x: -1380.69, y: -554.43, z: 30.23 },
        mafioti: { x: -1194.00, y: -1489.61, z: 4.38 }
      }
    },
    paleto: {
      name: 'Jaf Paleto',
      position: { x: -117.84, y: 6454.96, z: 31.40 },
      teams: {
        diicot: { x: -476.69, y: 5993.55, z: 31.34 },
        mafioti: { x: 183.35, y: 6626.54, z: 31.67 }
      }
    },
    pacific: {
      name: 'Jaf Pacific',
      position: { x: 221.96, y: 205.29, z: 105.48 },
      teams: {
        diicot: { x: -46.05, y: 216.46, z: 106.55 },
        mafioti: { x: 613.40, y: 121.16, z: 92.98 }
      }
    },
    dusty: {
      name: 'Razie Dusty',
      position: { x: 1980.39, y: 3772.49, z: 32.18 },
      teams: {
        diicot: { x: 2685.03, y: 4333.38, z: 45.87 },
        mafioti: { x: 1538.17, y: 3537.21, z: 35.36 }
      }
    },
    primarie: {
      name: 'Atentat Primarie',
      position: { x: -535.48, y: -223.70, z: 37.65 },
      teams: {
        diicot: { x: -479.06, y: -615.60, z: 31.17 },
        mafioti: { x: -618.55, y: 191.16, z: 69.80 }
      }
    }
  };
  
  export let activeEvent: {
    type: string;
    position: Vector3;
    teams: {
      diicot: Vector3;
      mafioti: Vector3;
    };
  } | null = null;
  