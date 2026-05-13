export interface GarageVehicle {
	id: number;
	name: string;
	category: string;
	km: number;
	fuel: number;
	tax: string;
	expiry: string;
	stage: string;
	isVip: boolean;
	img: string;
	description: string;
}

export type GarageState = {
    vehicles: GarageVehicle[];
    title: string;
    subTitle: string;
};

export enum GarageEvents {
    SET_GARAGE_DATA = 'garage:setData',
}
