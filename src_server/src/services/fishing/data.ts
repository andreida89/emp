export type FishingLocation = PositionEx & {
	radius: number;
	level: number;
};

export const locations: FishingLocation[] = [
	{
		x: -1256.408,
		y: 4378.824,
		z: 4.244,
		radius: 18,
		level: 2
	},
	{
		x: -1214.171,
		y: 4392.421,
		z: 8.165,
		radius: 18,
		level: 2
	},
	{
		x: -536.652,
		y: 2924.715,
		z: 14.133,
		radius: 18,
		level: 2
	},
	{
		x: 2331.49,
		y: 4274.13,
		z: 33.76,
		radius: 50,
		level: 1
	},
	{
		x: 1464.52,
		y: 3820.20,
		z: 32.76,
		radius: 50,
		level: 1
	},
	{
		x: -1449.139,
		y: 5840.072,
		z: 3.424,
		radius: 350,
		level: 3
	},
	{
		x: 4292.723,
		y: 4810.631,
		z: 3.212,
		radius: 350,
		level: 3
	}
];

type FishingLevel = {
	points: number;
	fish: { [name: string]: number };
};

export const levels: FishingLevel[] = [
	{
		points: 1500,
		fish: {
			oblete: 40,
			biban: 30,
			caras: 20,
			crap: 10
		}
	},
	{
		points: 5000,
		fish: {
			clean: 60,
			pastrav: 45,
			salau: 30,
			stiuca: 10
		}
	},
	{
		points: 7000,
		fish: {
			dorada: 30,
			calcan: 20,
			ton: 12,
			rechin: 5
		}
	}
];
