import invie from 'player/death';
import jucator from 'helpers/players';
import owning from 'vehicle/owning';
import playerClothes from 'player/clothes';
import repara from 'vehicle/health';
import mongoose from 'mongoose';
import Character from 'models/Character';
import Business from 'models/Business';
import House from 'models/House';
import Vehicle from 'models/Vehicle';
import User from 'models/User';
import playerInventory from 'player/inventory';
import { reloadWhitelist } from 'helpers/whitelist';
import 'vehicle/despawn';
import factions from 'factions';
import hud from 'helpers/hud'; // dacă nu ai deja



// ----------------------------------------------------------------------------------------------
// TRIMITERE LOGURI CATRE DISCORD START

const DISCORD_WEBHOOK_URLCK = 'https://discord.com/api/webhooks/1354163525366448228/XC3osYp5ZdgE0TO_W3Dq3GCrq9RbPUiCkcSLkJ5iDjpTTI3M9VWjI32RfBK6_FgKpwBB';
async function sendDiscordLogCk(data: any) {
    try {
        await axios.post(DISCORD_WEBHOOK_URLCK, {
            embeds: [data] // Fix: embeds should be an array, not inside "content"
        });
    } catch (error) {
        console.error('Failed to send Discord log:', error.response?.data || error);
    }
}

// TRIMITERE LOGURI CATRE DISCORD END
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE REVIVE - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand('revive', (player, _, targetId) => {
	const admin = player.getVariable('adminLvl');
	if (admin < 1) {
		player.notify(`~r~Nu ai aceasta permisiune!`);
		return;
	}

	if (!targetId || isNaN(targetId)) {
		return player.notify(`~r~Invalid ID \n ~y~Usage: /revive [playerID]`);
	}

	let tpt = false;

	mp.players.forEachFast((trgt) => {
		const target = jucator.get(parseInt(trgt.id));
		if (target?.fixId == parseInt(targetId)) {
			invie.revive(target);

			// ✅ FIX AICI
			trgt.call('client:updateHealth', [100]);

			tpt = true;
		}
	});

	if (tpt) {
		return player.notify(`~g~ID: ~y~${targetId} ~g~a fost reinviat`);
	} else {
		return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
	}
});


// COMANDA DE REVIVE - NIVEL DE ADMIN 1 (HELPER IN TESTE) - END
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE RESPAWN - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand('respawn', (player, _, targetId) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 1) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (!targetId || isNaN(targetId)) {
        return player.notify(`~r~Invalid ID \n ~y~Usage: /respawn [playerID]`);
    }
    let tpt = false;
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(targetId)) {
            invie.rspwn(target);
            tpt = true;
        }
    });
    if (tpt == true) {
        return player.notify(`~g~ Respawned ID: ~y~${targetId} ~g~`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
});

// COMANDA DE RESPAWN - NIVEL DE ADMIN 1 (HELPER IN TESTE) - END
// ----------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------
// COMANDA DE DVAREA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand('dvarea', (player, _, range) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 4) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    // Convert range to a number, default to 10 if not specified
    let searchRange = parseInt(range);
    if (isNaN(searchRange) || searchRange < 1) {
        return player.notify(`~y~Usage: /dvarea [range] \n ~y~(Range must be a positive integer number)`);
    }

    // Fuunction to create an array with all vehicles within range
    let getVehiclesNearby = () => {
        const nearbyVehicles = [];
        mp.vehicles.forEachInRange(player.position, searchRange, (vehicle) => {
            nearbyVehicles.push(vehicle);
        });
        return nearbyVehicles;
    };

    // Assign previously created array to a variable
    let nearbyVehicles = getVehiclesNearby(mp.players.at(0));

    if (nearbyVehicles.length === 0) {
        return player.notify(`~r~No vehicles found within ~y~${searchRange} ~r~meters.`);
    }

    // Destroy vehicles in list
    nearbyVehicles.forEach((vehicul) => vehicul.destroy());

    player.notify(`~p~Destroyed ~y~${nearbyVehicles.length} ~p~vehicle(s) within ~r~${searchRange} ~p~meters.`);
});

// COMANDA DE DVAREA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - STOP
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE DVALL - NIVEL DE ADMIN 5 (ADMINISTRATOR) - START

mp.events.addCommand('dvall', (player, _, timer) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 5) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    let setTimer = parseInt(timer);
    if (isNaN(setTimer) || setTimer < 1) {
        return player.notify(`~y~Usage: /dvall [timer] \n ~y~(Timer must be positive integer minutes)`);
    }
    setTimeout(() => {
        mp.players.forEach((_player) => {
            _player.notify(`~y~Vehicles will be destroyed in ~r~${setTimer} ~y~minute(s)`);
        }); 
    }, 1000);
    if (setTimer > 1) {
        let lastA = (setTimer - 1) * 60 * 1000;
        setTimeout(() => {
            mp.players.forEach((_player) => {
                _player.notify(`~y~Vehicles will be destroyed in 1 minute`);
            });
        }, lastA);
    }
    setTimeout(() => {
        mp.vehicles.forEach((vehicle) => {
            vehicle.destroy();
        });
        mp.players.forEach((_player) => {
            _player.notify(`~y~Player ~r~${player.name} ~y~destroyed all vehicles`);
        });
        setTimeout(() => {
            return player.notify(`~p~All vehicles destroyed`);
        }, 5000);
    }, setTimer * 60 * 1000);
    
});

// COMANDA DE DVALL - NIVEL DE ADMIN 5 (ADMINISTRATOR) - STOP
// ----------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------
// COMANDA DE DV - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand('dv', (player) => {
    let admin = player.getVariable('adminLvl');
    console.log(`[DV][DEBUG] adminLvl: ${admin}`);

    if (admin < 1) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        console.log(`[DV][DEBUG] EROARE: adminLvl prea mic pentru playerId=${player.id}`);
        return;
    }

    let vehicle = player.vehicle;
    if (!vehicle || !mp.vehicles.exists(vehicle)) {
        let closestVehicle = null;
        let closestDistance = Infinity;
        mp.vehicles.forEach((veh) => {
            let distance = player.position.dist(veh.position);
            console.log(`[DV][DEBUG] Vehicul id:${veh.id} dbId:${veh.dbId} dist:${distance.toFixed(2)}`);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestVehicle = veh;
            }
        });
        if (!closestVehicle || !mp.vehicles.exists(closestVehicle)) {
            console.log(`[DV][DEBUG] EROARE: Nu s-a gasit niciun vehicul apropiat pentru playerId=${player.id}`);
            return;
        }
        vehicle = closestVehicle;
        console.log(`[DV][DEBUG] ClosestVehicle: id:${vehicle.id} dbId:${vehicle.dbId}`);
    }

    // Dacă are dbId, caută ownerul logat
    if (vehicle.dbId) {
        const ownerDbId = vehicle.owner && vehicle.owner.player
            ? vehicle.owner.player.toString()
            : vehicle.dbId.toString();

        // Dacă la spawnare ai pus setOwner(player.dbId), așa trebuie să fie
        const ownerPlayer = jucator.getByDbId(ownerDbId);

        console.log(`[DV][DEBUG] Găsesc cu jucator.getByDbId(${ownerDbId}):`, ownerPlayer?.mp?.id);

        if (ownerPlayer) {
            console.log(`[DV][DEBUG] Owner gasit: id:${ownerPlayer.mp.id} dbId:${ownerPlayer.dbId}`);
            mp.events.call('Vehicle-DespawnItem', ownerPlayer, vehicle.dbId);
            console.log(`[DV][DEBUG] Vehicle despawned (garage vehicle) by adminId:${player.id}`);
            return;
        } else {
            console.log(`[DV][DEBUG] EROARE: Nu s-a gasit owner-ul pentru vehiculul cu dbId: ${vehicle.dbId}.`);
            vehicle.destroy();
            console.log("[DV][DEBUG] Fallback destroy pe vehicul cu dbId.");
            return;
        }
    }

    // Dacă nu are dbId, e temporar/spawnat de admin/script
    vehicle.destroy();
    console.log(`[DV][DEBUG] Destroyed the vehicle. [Fara dbId / admin]`);

    // Listă debug toți playerii logați și dbId-urile lor (poate ajută la debug)
    console.log("[DV][DEBUG] Lista tuturor playerilor online:");
    mp.players.toArray().forEach(p => {
        const logic = jucator.get(p.id);
        console.log(`[DV][DEBUG] Player: id:${p.mp.id}, dbId:${logic?.dbId}, vehicles:[${(logic?.vehicles || []).join(',')}]`);
    });
});



// COMANDA DE DV - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE FIX - NIVEL DE ADMIN 2 (HELPER) - START

mp.events.addCommand('fix', (player, _, targetId) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 2) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    let check = false;
    if (targetId == undefined) {
        if (!player.vehicle) return player.notify('~r~Nu esti in vehicul!');
        repara.repair(player.vehicle);
        return player.notify(`~g~Masina ta a fost reparata!`);
        check = true;
    } else {
        mp.players.forEachFast((trgt) => {
            let target = jucator.get(parseInt(trgt.id));
            if (target.fixId == parseInt(targetId)) {
                if (!trgt.vehicle) {
                    check = null;
                    return player.notify(`~r~Jucatorul ~y~${targetId} ~r~nu este in masina!`);
                }
                repara.repair(trgt.vehicle);
                trgt.notify(`~g~Masina ta a fost reparata!`);
                check = true;
            }
        });
    }
    if (check == null) {
        // sa ma gandesc
    } else {
        if (check == true) {
            return player.notify(`~g~Masina jucatorului: ~y~${targetId} ~g~a fost reparata`);
        } else {
            return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
        }
    }
})

// COMANDA DE FIX - NIVEL DE ADMIN 2 (HELPER) - START
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE ARMURA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand('armura', (player, _, targetId, arm) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 4) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    let check = false;
    if (targetId == undefined || arm == undefined) return player.notify(`Comanda: /armura [id] [0-100]`);
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(targetId)) {
            target.mp.armour = parseInt(arm);
            trgt.notify(`~g~Ai primit ~y~${arm} ~g~armura`);
            check = true;
        }
    });
    if (check == true) {
        return player.notify(`~g~Jucatorul ~y~${targetId} ~g~a a primit ~y~${arm} ~g~armura`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
})

// COMANDA DE ARMURA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE VIATA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand('viata', (player, _, targetId, hp) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 4) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    let check = false;
    
    if (targetId == undefined || hp == undefined) return player.notify(`Comanda: /viata [id] [0-100]`);
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(targetId)) {
            target.mp.health = parseInt(hp);
            trgt.call('client:updateHealth', [parseInt(hp)]);
            trgt.notify(`~g~Ai primit ~y~${hp} ~g~viata`);
            check = true;
        }
    });
    if (check == true) {
        return player.notify(`~g~Jucatorul ~y~${targetId} ~g~a a primit ~y~${hp} ~g~viata`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
})

// COMANDA DE VIATA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE KILL - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand('kill', (player, _, targetId) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 4) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    let self = jucator.get(parseInt(player.id));
    if (self.fixId == parseInt(targetId)) return player.notify(`~r~Nu te poti omora singur!`);
    let check = false;
    if (targetId == undefined) return player.notify(`Comanda: /kill [id]`);
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(targetId)) {
            target.mp.health = 0;
            check = true;
        }
    });
    if (check == true) {
        return player.notify(`~g~Jucatorul ~y~${targetId} ~g~a a fost omorat`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
})

// COMANDA DE KILL - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE TPW - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("tpw", (player) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 1) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if(!player.data.markPosition) 
        return player.notify('Nu ai un waypoint marcat pe mapa');
     
    ((!player.vehicle) ? player.position = player.data.markPosition : player.vehicle.position = player.data.markPosition); 
    player.dimension = 0;
});

// COMANDA DE TPW - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE TPC - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand('tpc', (player, _, x, y, z) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 1) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (x == undefined || y == undefined || z == undefined) return player.outputChatBox('/tpc [x] [y] [z]');
    player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
})

// COMANDA DE TPC - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE TPTO - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand('tpto', (player, _, tid) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 1) {
        return player.notify(`~r~Nu ai aceasta permisiune!`);
    }
    if (!tid || isNaN(tid)) {
        return player.notify(`~r~Invalid ID \n ~y~Usage: /tpto [player id]`);
    }
    let tpt = false;
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(tid)) {
            let targetPlayer = mp.players.at(trgt.id);
            player.dimension = targetPlayer.dimension;
            player.position = targetPlayer.position;
            tpt = true;
        }
    });
    if (tpt == true) {
        return player.notify(`~g~ Te-ai teleportat la ID: ~y~${tid} ~g~`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
})

// COMANDA DE TPTO - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------




// ----------------------------------------------------------------------------------------------
// COMANDA DE TPTOME - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand('tptome', (player, _, tid) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 1) {
        return player.notify(`~r~Nu ai aceasta permisiune!`);
    }
    if (!tid || isNaN(tid)) {
        return player.notify(`~r~Invalid ID \n ~y~Usage: /tptome [player id]`);
    }
    let tpt = false;
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(tid)) {
            let targetPlayer = mp.players.at(trgt.id);
            targetPlayer.dimension = player.dimension;
            targetPlayer.position = player.position;
            tpt = true;
        }
    });
    if (tpt == true) {
        return player.notify(`~g~ L-ai teleportat pe ID: ~y~${tid} ~g~`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
})

// COMANDA DE TPTOME - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------





// ----------------------------------------------------------------------------------------------
// COMANDA DE VREME - NIVEL DE ADMIN 7 (COFONDATOR) - START

mp.events.addCommand('vremea', (player, _, weather) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 7) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (weather == undefined) return player.notify('Comanda: /vremea [weather]');
    mp.world.weather = weather;
})

// COMANDA DE VREME - NIVEL DE ADMIN 7 (COFONDATOR) - STOP
// ----------------------------------------------------------------------------------------------





// ----------------------------------------------------------------------------------------------
// COMANDA DE ZI / NOAPTE - NIVEL DE ADMIN 7 (COFONDATOR) - START

mp.events.addCommand('ora', (player, _, timeArg) => {
	const admin = player.getVariable('adminLvl');
	if (admin < 7) {
		player.notify(`~r~Nu ai aceasta permisiune!`);
		return;
	}

	if (!timeArg) {
		return player.notify('~y~Foloseste: /ora [zi/noapte]');
	}

	const lowerArg = timeArg.toLowerCase();

	if (lowerArg === 'zi') {
		mp.world.time.set(12, 0, 0);
        player.call('AnuntNotification', ['Ai setat ZI', 'success']);
	} else if (lowerArg === 'noapte') {
		mp.world.time.set(0, 0, 0);
        player.call('AnuntNotification', ['Ai setat NOAPTE', 'success']);
	} else {
        return player.call('AnuntNotification', ['Argument invalid! Folosește: day sau night', 'danger']);
	}
});

// COMANDA DE ZI / NOAPTE - NIVEL DE ADMIN 7 (COFONDATOR) - START
// ----------------------------------------------------------------------------------------------





mp.events.addCommand('setvw', (player, _, targetId, dim) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 2) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (targetId == undefined || dim == undefined) return player.notify('Comanda: /setvw [id] [dim]');
    let check = false;
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(targetId)) {
            trgt.dimension = parseInt(dim);
            check = true;
        }
    });
    if (check == true) {
        return player.notify(`~g~ Ai setat virtualul ~y~${dim} ~g~pentru ID ~y~${targetId}`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
})

mp.events.addCommand('resetvw', (player, _, targetId) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 1) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (targetId == undefined ) return player.notify('Comanda: /resetvw [id]');
    let check = false;
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(targetId)) {
            trgt.dimension = 0;
            check = true;
        }
    });
    if (check == true) {
        return player.notify(`~g~ Ai resetat virtualul pentru ID ~y~${targetId}`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
})

mp.events.addCommand('vw', (player) => {
    player.notify(`Esti in virtual ~r~${player.dimension} ~w~.`);
})
mp.events.addCommand('id', (player) => {
    player.notify(`ID-ul tau este: ~r~${player.id} ~w~.`);
})

mp.events.addCommand('kick', (player, _, targetId) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 2) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (targetId == undefined) return player.notify('Comanda: /kick [id]');
    let self = jucator.get(parseInt(player.id));
    if (self.fixId == parseInt(targetId)) return player.notify(`~r~Nu te poti da afara pe tine!`);
    let check = false;
    mp.players.forEachFast((trgt) => {
        let target = jucator.get(parseInt(trgt.id));
        if (target.fixId == parseInt(targetId)) {
            if (trgt.getVariable('adminLvl') > 3) return player.notify(`~r~Nu poti da afara un owner!`);
            let newt = mp.players.at(trgt.id);
            trgt.notify(`~r~Ai primit kick de pe server`);
            trgt.outputChatBox("Ai primit kick de pe server.");
            setTimeout(() => {
                newt.kick('Kicked');
            }, 5000);
            check = true;
        }
    });
    if (check == true) {
        return player.notify(`~g~Jucatorul ~y~${targetId} ~g~a fost dat afara`);
    } else {
        return player.notify('~r~ID-ul jucatorului nu a fost gasit!');
    }
});


mp.events.addCommand("pm", (player, _, target, ...message) => {
    if (!target || message.length === 0) {
        player.outputChatBox("Usage: /pm [ID] [message]");
        return;
    }

    let p = mp.players.at(parseInt(target));
    if (!p) {
        player.outputChatBox("Player not found.");
        return;
    }

    let fullMessage = message.join(" ");
    player.outputChatBox(`Ai trimis un mesaj lui ${p.name}: ${fullMessage}`);
    p.outputChatBox(`PM de la ${player.name}: ${fullMessage}`);
});





mp.events.addCommand("news", (player, _, ...message) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 5) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (message.length === 0) {
        player.outputChatBox("Usage: /news [message]");
        return;
    }
    let tickerText = message.join(" ");
    mp.players.forEachFast((trgt) => {
        trgt.call('updateTickerText', [tickerText]);
    });
    return console.log(`Call command given`);
});

mp.events.add('playerCommand', (player, command) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 7) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    let arr = command.split(' ');
    if (arr[0] == 'setclothes') {
      if (arr.length < 5 || parseInt(arr[1]) === undefined || parseInt(arr[2]) === undefined || parseInt(arr[3]) === undefined || parseInt(arr[4]) === undefined) {
        return player.outputChatBox('Use syntax: /setclothes [component_id] [drawable_id] [texture_id] [palette_id]');
      } else {
        player.setClothes(parseInt(arr[1]), parseInt(arr[2]), parseInt(arr[3]), parseInt(arr[4]));
      }
    }
  });
mp.events.add('playerCommand', (player, command) => {
    let arr = command.split(' ');
    if (arr[0] === 'setprops') {
    let admin = player.getVariable('adminLvl');
    if (admin < 7) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
        if (arr.length < 4 || isNaN(parseInt(arr[1])) || isNaN(parseInt(arr[2])) || isNaN(parseInt(arr[3]))) {
            return player.outputChatBox('Use syntax: /setprops [component_id] [drawable_id] [texture_id]');
        }

        const componentId = parseInt(arr[1]);
        const drawableId = parseInt(arr[2]);
        const textureId = parseInt(arr[3]);

        player.setProp(componentId, drawableId, textureId);
    }
});



  mp.events.addCommand('ck', async (player: PlayerMp, _, targetIdStr: string, ...reasonParts: string[]) => {
    const adminLvl = player.getVariable('adminLvl');
    if (adminLvl < 7) return player.outputChatBox('~r~Nu ai acces la aceasta comanda.');
  
    const targetId = parseInt(targetIdStr);
    const reason = reasonParts.join(' ').trim();
  
    if (!targetId || isNaN(targetId) || !reason) {
      return player.outputChatBox('FOLOSESTE: /ck [playerID] [motiv]');
    }
  
    let targetPlayer: PlayerMp | null = null;
    mp.players.forEachFast(p => {
      const logic = jucator.get(p.id);
      if (logic?.fixId === targetId) {
        targetPlayer = p;
      }
    });
  
    if (!targetPlayer) return player.outputChatBox('~r~Jucatorul nu a fost gasit.');
  
    const logicTarget = jucator.get(targetPlayer.id);
    if (!logicTarget?.fixId) return player.outputChatBox('~r~Eroare la identificarea jucatorului.');
  
    try {
      const character = await Character.findOne({ uid: logicTarget.fixId });
      if (!character) return player.outputChatBox('~r~Caracterul nu a fost gasit in baza de date.');
  
      const characterId = character._id;
  
      // Sterge caracterul
      await Character.deleteOne({ _id: characterId });
      // Da update la afaceri cu owner null
      await Business.updateMany({ owner: characterId }, { $set: { owner: null } });
      //
      await House.updateMany({ owner: characterId }, { $set: { owner: null } });
  
      await Vehicle.deleteMany({ owner: characterId });

      await User.deleteMany({ character: characterId });

  
      // Kick jucatorul
      targetPlayer.kick(`Ai primit CK. Motiv: ${reason}`);
  
      player.outputChatBox(`~g~Ai dat CK lui ${targetId}.`);
    } catch (err) {
      console.error('Eroare la executarea /ck:', err);
      player.outputChatBox('~r~Eroare interna. Verifica consola.');
    }
  });

  async function handleCharacterKill(targetPlayer: PlayerMp, reasonText: string, adminName: string = 'Server') {
  const logicTarget = jucator.get(targetPlayer.id);
  if (!logicTarget?.fixId) return;

  try {
    const character = await Character.findOne({ uid: logicTarget.fixId });
    if (!character) return;

    const characterId = character._id;

    // Sterge caracterul
    await Character.deleteOne({ _id: characterId });

    // Scoate ownership-uri
    await Business.updateMany({ owner: characterId }, { $set: { owner: null } });
    await House.updateMany({ owner: characterId }, { $set: { owner: null } });
    await Vehicle.deleteMany({ owner: characterId });
    await User.deleteMany({ character: characterId });

    // Kick jucatorul
    targetPlayer.kick(`Ai primit CK. Motiv: ${reasonText}`);

    console.log(`[CK] ${targetPlayer.name} a fost sters de ${adminName} cu motivul: ${reasonText}`);

    await sendDiscordLogCk({
        title: "📌 Player Death",
        color: 3066993, // Light blue color
        description: `**${targetPlayer.name}** (DB ID: **${logicTarget.fixId}** a primit CK de la **${adminName}** cu motivul **${reasonText}**.`,
        footer: { text: "Loguri server | Empire", icon_url: "https://redland.ro/empirerp.png" },
        timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('[CK ERROR]', err);
  }
}



mp.events.addCommand('me', (player, _, ...message) => {
    if (message.length === 0) return player.outputChatBox(`!{${SERVER_COLORS.RED}}(me) !{${SERVER_COLORS.WHITE}}/me (actiune)`);
    
    const msg = `* ${message.join(" ")}`;

    mp.players.forEachInRange(player.position, 15, (target) => {
        target.call('client:me:PushMeText', [player.id, msg]);
    });

});
mp.events.addCommand('ME', (player, _, ...message) => {
    if (message.length === 0) return player.outputChatBox(`!{${SERVER_COLORS.RED}}(me) !{${SERVER_COLORS.WHITE}}/me (actiune)`);
    
    const msg = `* ${message.join(" ")}`;

    mp.players.forEachInRange(player.position, 15, (target) => {
        target.call('client:me:PushMeText', [player.id, msg]);
    });

});

mp.events.addCommand('notificare', (player: PlayerMp, fullText: string) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 5) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }

	const args = fullText.split(' ');
	const type = args[0]?.toLowerCase();
	const message = args.slice(1).join(' ');

	if (!['info', 'danger', 'success'].includes(type)) {
		player.outputChatBox('Syntax: /anunt [info | danger | success] [message]');
		return;
	}

	if (!message || message.length < 2) {
		player.outputChatBox('Please enter a message.');
		return;
	}

	// Send to all players
	mp.players.forEach((p) => {
		p.call('AnuntNotification', [message, type]);
	});
});


mp.events.addCommand('anunt', (player: PlayerMp, fullText: string) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 5) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
	const message = fullText.trim();

	if (!message || message.length < 2) {
		player.outputChatBox('Please enter a message: /anunt [message]');
		return;
	}

	// Send to all players
	mp.players.forEach((p) => {
		p.call('AnuntGlobal', [message]);
	});
});


mp.events.addCommand('scare', (player, _, targetId) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 6) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }

	if (!targetId || isNaN(targetId)) {
		return player.notify(`~r~ID invalid \n ~y~Folosire: /scare [playerID]`);
	}

	let found = false;

	mp.players.forEachFast((trgt) => {
		const target = jucator.get(trgt.id);
		if (target.fixId === parseInt(targetId)) {
			target.mp.call('ShowJumpScare');
			found = true;
		}
	});

	if (found) {
		player.notify(`~g~Ai declansat jumpscare-ul pentru jucatorul cu ID-ul ~y~${targetId}`);
	} else {
		player.notify('~r~Jucatorul nu a fost gasit!');
	}
});

mp.events.addCommand('arma', async (player, _, targetId, weaponName, ammoAmountStr, ammoType) => {
    const adminLvl = player.getVariable('adminLvl');
    if (adminLvl < 6) {
        player.call('AnuntNotification', ['Nu ai acces la aceasta comanda', 'danger']);
        return;
    }

    if (!targetId || !weaponName || !ammoAmountStr || !ammoType) {
        player.outputChatBox('/arma [id] [weapon_name] [ammo_amount] [ammo_type]');
        return;
    }

    const weaponItem = { name: weaponName, amount: 1 };
    const ammoItem = { name: ammoType, amount: parseInt(ammoAmountStr) };

    let check = false;

    mp.players.forEachFast(async (trgt) => {
        let target = jucator.get(trgt.id);
        if (!target) return;

        if (target.fixId === parseInt(targetId)) {
            try {
                await playerInventory.checkEnoughSlots(target, [weaponItem, ammoItem]);
                await playerInventory.addItem(target, weaponItem);
                await playerInventory.addItem(target, ammoItem);

                check = true;
                player.notify(`~g~Ai dat cu succes arma ${weaponName} și ${ammoItem.amount} ${ammoType} jucătorului cu ID-ul ${targetId}`);
            } catch (err) {
                player.notify('~r~Inventarul jucătorului este plin sau a apărut o eroare.');
            }
        }
    });
});


mp.events.addCommand('gun', (player, _, targetId, weapon, ammoStr) => {
	const adminLvl = player.getVariable('adminLvl');
	if (adminLvl < 6) {
		player.call('AnuntNotification', ['Nu ai acces la aceasta comanda', 'danger']);
		return;
	}

	if (!targetId || !weapon || !ammoStr) {
		player.outputChatBox('/gun [fixId] [weapon] [ammo]');
		return;
	}

	const ammo = parseInt(ammoStr);
	if (isNaN(ammo) || ammo <= 0) {
        player.call('AnuntNotification', ['Cantitatea de gloante trebuie sa fie un numar valid.', 'danger']);
		return;
	}

	let found = false;

	mp.players.forEachFast((plr) => {
		const target = jucator.get(plr.id);
		if (!target) return;

		if (target.fixId === parseInt(targetId)) {
			found = true;
			plr.giveWeapon(mp.joaat(`weapon_${weapon}`), ammo);
            player.call('AnuntNotification', ['Ai dat arma ${weapon} (${ammo} gloante) catre jucatorul cu ID-ul ${targetId}.', 'success']);
		}
	});

	if (!found) {
        player.call('AnuntNotification', ['Jucatorul cu acel id nu a fost gasit!', 'danger']);
	}
});



mp.events.addCommand("addcomp", (player, _, weapon, compName) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 7) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    if (!weapon || !compName) {
        player.outputChatBox("❌ Usage: /addcomp [weapon_name] [component_name]");
        return;
    }

    const weaponHash = mp.joaat("weapon_" + weapon.toLowerCase());
    const componentHash = mp.joaat(compName.toUpperCase());

    player.call("addWeaponComponent", [weaponHash, componentHash]);
    player.outputChatBox(`✅ Componenta ${compName} trimisă pentru ${weapon}`);
});


mp.events.addCommand('giveitem', async (player, _, targetId, itemName, amountStr) => {
    const adminLvl = player.getVariable('adminLvl');
    if (adminLvl < 6) {
        player.call('AnuntNotification', ['Nu ai acces la aceasta comanda', 'danger']);
        return;
    }

    if (!targetId || !itemName || !amountStr) {
        player.outputChatBox('/giveitem [id] [item_name] [amount]');
        return;
    }

    const item = { name: itemName, amount: parseInt(amountStr) };
    let check = false;

    mp.players.forEachFast(async (trgt) => {
        let target = jucator.get(trgt.id);
        if (!target) return;

        if (target.fixId === parseInt(targetId)) {
            try {
                await playerInventory.checkEnoughSlots(target, [item]);
                await playerInventory.addItem(target, item);

                check = true;
                player.notify(`~g~Ai dat cu succes ${item.amount}x ${item.name} jucătorului cu ID-ul ${targetId}`);
            } catch (err) {
                player.notify('~r~Inventarul jucatorului este plin sau a aparut o eroare.');
            }
        }
    });

    setTimeout(() => {
        if (!check) {
            player.notify('~r~ID-ul jucatorului nu a fost gasit!');
        }
    }, 200);
});



mp.events.addCommand('notif', (player: PlayerMp, fullText: string) => {
    const adminLvl = player.getVariable('adminLvl');
    if (adminLvl < 5) {
        player.call('AnuntNotification', ['Nu ai acces la aceasta comanda', 'danger']);
        return;
    }

  if (!fullText) {
    player.outputChatBox('Syntax: /notif [albastru | rosu | verde | galben | roz | mov] [mesaj]');
    return;
  }

  const args = fullText.split(' ');
  const type = args[0]?.toLowerCase();
  const message = args.slice(1).join(' ');

  const allowedTypes = ['albastru', 'rosu', 'verde', 'galben', 'roz', 'mov'];
  if (!allowedTypes.includes(type)) {
    player.outputChatBox('Syntax: /notif [albastru | rosu | verde | galben | roz | mov] [mesaj]');
    return;
  }

  if (!message || message.length < 2) {
    player.outputChatBox('Introdu un mesaj.');
    return;
  }

  mp.players.forEach((p) => {
    p.call('AnuntNotification2', [message, type]);
  });
});

mp.events.addCommand('alertapolitie', (player: PlayerMp, fullText: string) => {
const adminLvl = player.getVariable('adminLvl');
  if (adminLvl < 5) {
        player.call('AnuntNotification', ['Nu ai acces la aceasta comanda', 'danger']);
  return;
}

  if (!fullText || fullText.trim().length < 2) {
    player.outputChatBox('Foloseste: /alertapolitie [mesaj]');
    return;
  }

  const message = fullText.trim();

  mp.players.forEach((p) => {
    p.call('AlertaPolitie', [message]);
  });
});



mp.events.addCommand('as', (player: PlayerMp) => {
	const playerFaction = player.getVariable('faction');
	//console.log(`[AS] ${player.name} - faction=${playerFaction}`);

	if (playerFaction !== 'sindicat') {
		player.call('AnuntNotification', ['Nu ai acces la această comandă', 'danger']);
		return;
	}

	const targetFaction = factions.getFaction('santamuerte');
	if (!targetFaction) {
		player.call('AnuntNotification', ['Facțiunea santamuerte nu există', 'danger']);
		return;
	}

	const position = player.position;
	const members = targetFaction.getPlayers();

	//console.log(`[AS] Găsit ${members.length} membri în facțiunea santamuerte`);

	const notified = members.filter((member) => {
		if (!member || !member.fixId) {
			//console.warn('[AS][WARN] Membru invalid sau deconectat:', member);
			return false;
		}

		const isOnline = mp.players.toCustomArray().find((p) => p.fixId === member.fixId);
		if (!isOnline) {
			//console.warn(`[AS][WARN] Membru cu fixId=${member.fixId} este offline`);
			return false;
		}

		isOnline.mp.call('AlertaSindicat', [position.x, position.y, position.z]);
		return true;
	});

	player.call('AnuntNotification', [`Ai trimis alerta către ${notified.length} membri Santamuerte`, 'success']);
});







// COORDONATE SI ROTATE POSITION
mp.events.addCommand('pos', (player) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 1) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
	const pos = player.position;
	const rot = player.heading;

	player.outputChatBox(`X: ${pos.x.toFixed(4)} Y: ${pos.y.toFixed(4)} Z: ${pos.z.toFixed(4)}`);
	player.outputChatBox(`Head rotate: ${rot.toFixed(4)}`);

	console.log(`X: ${pos.x.toFixed(2)} Y: ${pos.y.toFixed(2)} Z: ${pos.z.toFixed(2)} | Head rotate: ${rot.toFixed(4)}`);
});



// COMANDA DE DAT RELOAD LA LISTA WHITELIST START

mp.events.addCommand('whitelistreload', (player) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 3) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }
    reloadWhitelist();
    player.outputChatBox('Lista WHITELIST a fost reincarcata cu succes!');
});

// COMANDA DE DAT RELOAD LA LISTA WHITELIST END


// COMANDA DE BOOST VITEZA LA MASINA START

mp.events.addCommand('viteza', (player, fullText, valueArg) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 7) {
        player.notify(`~r~Nu ai aceasta permisiune!`);
        return;
    }

    // Parsează valoarea ca număr
    const value = parseFloat(valueArg);
    if (isNaN(value) || value <= 0) {
        return player.outputChatBox('Folosire: /viteza [valoare] (ex: /viteza 200)');
    }

    // Trimite către client
    player.call('util:player:admin:vehicles:speed', [value]);
    player.outputChatBox(`Limita de viteza setata la ${value} km/h pentru vehiculul tau.`);
});

// COMANDA DE BOOST VITEZA LA MASINA END




// COMANDA DE DRIFT MODE START

mp.events.addCommand('drift', (player: PlayerMp, _, valueArg: string) => {
    let admin = player.getVariable('adminLvl');
    if (admin < 7) return player.notify(`~r~Nu ai aceasta permisiune!`);
    let value = (valueArg || '').toLowerCase();
    if (value !== 'on' && value !== 'off')
        return player.outputChatBox('Folosire: /drift [on|off]');
    player.call('util:player:admin:vehicles:drift', [value === 'on']);
    player.outputChatBox(`Drift mode ${value === 'on' ? 'activat' : 'dezactivat'} pentru vehiculul tau.`);
});



// COMANDA DE DRIFT MODE STOP







// COMANDA DE TELEPORT LA ADMIN HOUSE START

mp.events.addCommand('ah', (player) => {
    const admin = player.getVariable('adminLvl');
    if (admin < 1) {
        return player.notify('~r~Nu ai aceasta permisiune!');
    }

    // Coordonate dorite
    const coord = { x: -855.38, y: 1189.14, z: 199.28 };

    player.position = new mp.Vector3(coord.x, coord.y, coord.z);
    player.notify('~g~Te-ai teleportat la Admin Hall!');
});

// COMANDA DE TELEPORT LA ADMIN HOUSE STOP


mp.events.addCommand('intro', (player) => {
    player.call('PlayGlobalVideo'); // nu ai nevoie de argument aici
    player.notify('Intro video pornit!');
});




// Function to sort vehicles by distance from the player
function byEntityDistance(a, b) {
    let entityA = a.veh.position.dist(a.playerPos);
    let entityB = b.veh.position.dist(b.playerPos);
    
    return entityA - entityB; // Sort from nearest to farthest
}