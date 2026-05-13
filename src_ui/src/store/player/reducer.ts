import {
	PlayerActionTypes,
	PlayerState,
	SET_BONUS,
	SET_ID,
	SET_MONEY,
	SET_SATIETY,
	SET_THIRST,
	SET_HEALTH,
	SET_ARMORVALUE,
	SET_STAMINA,
	SET_TASKS,
	SET_HAS_STATIE,
	SET_HAS_SMARTWATCH,
	SET_IN_VEHICLE
} from './types';
import './events';

const initialState: PlayerState = {
	id: 0,
	satiety: 100,
	thirst: 100,
	health: 100,
	armorValue: 100,
	stamina: 100,
	money: {
		cash: 0,
		bank: 0,
		points: 0
	},
	bonus: -1,
	tasks: [],
	hasStatie: false,
	hasSmartwatch: false,
	inVehicle: false
};

export default function playerReducer(
	state = initialState,
	action: PlayerActionTypes
): PlayerState {
	switch (action.type) {
		case SET_SATIETY:
			return {
				...state,
				satiety: action.payload
			};
        case SET_THIRST:
            return {
                ...state,
                thirst: action.payload
            };
        case SET_HEALTH:
            return {
                ...state,
                health: action.payload
            };
        case SET_ARMORVALUE:
            return {
                ...state,
                armorValue: action.payload
            };
        case SET_STAMINA:
            return {
                ...state,
                stamina: action.payload
            };
		case SET_MONEY:
			return {
				...state,
				money: action.payload
			};
		case SET_TASKS:
			return {
				...state,
				tasks: action.payload
			};
		case SET_ID:
			return {
				...state,
				id: action.payload
			};
		case SET_BONUS:
			return {
				...state,
				bonus: action.payload
			};
		case SET_HAS_STATIE:
			return {
				...state,
				hasStatie: action.payload
			};
		case SET_HAS_SMARTWATCH:
			return {
				...state,
				hasSmartwatch: action.payload
			};
		case SET_IN_VEHICLE:
			return {
				...state,
				inVehicle: action.payload
			};

		default:
			return state;
	}
}
