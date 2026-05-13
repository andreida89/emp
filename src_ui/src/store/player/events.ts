import rpc from 'utils/rpc';
import { setSatiety, setThirst, setHealth, setArmorValue, setStamina, setMoney, setTasks, setId, setBonus, setHasStatie, setHasSmartwatch, setInVehicle } from './actions';
import { updateState } from '../index';

rpc.register('Player-SetSatiety', (value) => updateState(setSatiety(value)));
rpc.register('Player-SetThirst', (value) => updateState(setThirst(value)));
rpc.register('Player-SetHealth', (value) => updateState(setHealth(value)));
rpc.register('Player-SetArmorValue', (value) => updateState(setArmorValue(value)));
rpc.register('Player-SetStamina', (value) => updateState(setStamina(value)));
rpc.register('Player-SetMoney', (money) => updateState(setMoney(money)));
rpc.register('Player-SetTasks', (list) => updateState(setTasks(list)));
rpc.register('Player-SetId', (id) => updateState(setId(id)));
rpc.register('Player-SetBonus', (time) => updateState(setBonus(time)));
rpc.register('Player-SetHasStatie', (status) => updateState(setHasStatie(status)));
rpc.register('Player-SetHasSmartwatch', (status) => updateState(setHasSmartwatch(status)));
rpc.register('Player-SetInVehicle', (status) => updateState(setInVehicle(status)));
