import {
	Money,
	PlayerActionTypes,
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

export function setSatiety(amount: number): PlayerActionTypes {
	return {
		type: SET_SATIETY,
		payload: amount
	};
}
export function setThirst(amount: number): PlayerActionTypes {
        return {
                type: SET_THIRST,
                payload: amount
        };
}
export function setHealth(amount: number): PlayerActionTypes {
        return {
                type: SET_HEALTH,
                payload: amount
        };
}
export function setArmorValue(amount: number): PlayerActionTypes {
        return {
                type: SET_ARMORVALUE,
                payload: amount
        };
}
export function setStamina(amount: number): PlayerActionTypes {
        return {
                type: SET_STAMINA,
                payload: amount
        };
}
export function setMoney(data: Money): PlayerActionTypes {
	return {
		type: SET_MONEY,
		payload: data
	};
}

export function setTasks(tasks: string[]): PlayerActionTypes {
	return {
		type: SET_TASKS,
		payload: tasks
	};
}

export function setId(id: number): PlayerActionTypes {
	return {
		type: SET_ID,
		payload: id
	};
}

export function setBonus(time: number): PlayerActionTypes {
	return {
		type: SET_BONUS,
		payload: time
	};
}

export function setHasStatie(status: boolean): PlayerActionTypes {
	return {
		type: SET_HAS_STATIE,
		payload: status
	};
}

export function setHasSmartwatch(status: boolean): PlayerActionTypes {
	return {
		type: SET_HAS_SMARTWATCH,
		payload: status
	};
}

export function setInVehicle(status: boolean): PlayerActionTypes {
	return {
		type: SET_IN_VEHICLE,
		payload: status
	};
}
