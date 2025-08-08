export const SET_SATIETY = 'SET_SATIETY';
export const SET_THIRST = 'SET_THIRST';
export const SET_HEALTH = 'SET_HEALTH';
export const SET_ARMORVALUE = 'SET_ARMORVALUE';
export const SET_STAMINA = 'SET_STAMINA';
export const SET_MONEY = 'SET_MONEY';
export const SET_TASKS = 'SET_TASKS';
export const SET_ID = 'SET_ID';
export const SET_BONUS = 'SET_BONUS';

export type Money = {
	cash: number;
	bank: number;
	points: number;
};

type SetSatietyAction = {
	type: typeof SET_SATIETY;
	payload: number;
};
type SetThirstAction = {
        type: typeof SET_THIRST;
        payload: number;
};
type SetHealthAction = {
        type: typeof SET_HEALTH;
        payload: number;
};
type SetArmorValueAction = {
        type: typeof SET_ARMORVALUE;
        payload: number;
};
type SetStaminaAction = {
        type: typeof SET_STAMINA;
        payload: number;
};
type SetMoneyAction = {
	type: typeof SET_MONEY;
	payload: Money;
};
type SetTasksAction = {
	type: typeof SET_TASKS;
	payload: string[];
};
type SetIdAction = {
	type: typeof SET_ID;
	payload: number;
};
type SetBonusAction = {
	type: typeof SET_BONUS;
	payload: number;
};

export type PlayerActionTypes =
	| SetSatietyAction
    | SetThirstAction
    | SetHealthAction
    | SetArmorValueAction
    | SetStaminaAction
	| SetMoneyAction
	| SetTasksAction
	| SetIdAction
	| SetBonusAction;

export interface PlayerState {
	id: number;
	satiety: number;
	thirst: number;
	health: number;
	armorValue: number;
	stamina: number;
	money: Money;
	tasks: string[];
	bonus: number;
}
