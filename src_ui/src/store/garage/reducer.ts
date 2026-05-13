import { GarageState, GarageEvents } from './types';

const initialState: GarageState = {
	vehicles: [],
	title: 'GARAJ',
	subTitle: 'PERSONAL'
};

export default function garageReducer(state = initialState, action: any): GarageState {
	switch (action.type) {
		case GarageEvents.SET_GARAGE_DATA:
			return {
				...state,
				...action.payload
			};
		default:
			return state;
	}
}
