import invie from "player/death";
import jucator from "helpers/players";
import owning from "vehicle/owning";
import playerClothes from "player/clothes";
import repara from "vehicle/health";
import mongoose from "mongoose";
import Character from "models/Character";
import Business from "models/Business";
import House from "models/House";
import Vehicle from "models/Vehicle";
import User from "models/User";
import playerInventory from "player/inventory";
import { reloadWhitelist } from "helpers/whitelist";
import "vehicle/despawn";
import factions from "factions";
import hud from "helpers/hud"; // dacă nu ai deja

// ----------------------------------------------------------------------------------------------
// TRIMITERE LOGURI CATRE DISCORD START

const DISCORD_WEBHOOK_URLCK =
  "https://discord.com/api/webhooks/1354163525366448228/XC3osYp5ZdgE0TO_W3Dq3GCrq9RbPUiCkcSLkJ5iDjpTTI3M9VWjI32RfBK6_FgKpwBB";
async function sendDiscordLogCk(data: any) {
  try {
    await axios.post(DISCORD_WEBHOOK_URLCK, {
      embeds: [data], // Fix: embeds should be an array, not inside "content"
    });
  } catch (error) {
    console.error("Failed to send Discord log:", error.response?.data || error);
  }
}

// TRIMITERE LOGURI CATRE DISCORD END
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE REVIVE - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("revive", (player, _, targetId) => {
  const admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
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
      trgt.call("client:updateHealth", [100]);

      tpt = true;
    }
  });

  if (tpt) {
    return player.notify(`~g~ID: ~y~${targetId} ~g~a fost reinviat`);
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

// COMANDA DE REVIVE - NIVEL DE ADMIN 1 (HELPER IN TESTE) - END
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE RESPAWN - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("respawn", (player, _, targetId) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
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
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

// COMANDA DE RESPAWN - NIVEL DE ADMIN 1 (HELPER IN TESTE) - END
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE DVAREA - NIVEL DE ADMIN 2 (HELPER) - START

mp.events.addCommand("dvarea", (player, _, range) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  // Convert range to a number, default to 10 if not specified
  let searchRange = parseInt(range);
  if (isNaN(searchRange) || searchRange < 1) {
    return player.notify(
      `~y~Usage: /dvarea [range] \n ~y~(Range must be a positive integer number)`,
    );
  }

  let count = 0;
  const VehicleModel = require("../models/Vehicle").default;
  
  mp.vehicles.forEachInRange(player.position, searchRange, (vehicle) => {
    // Only empty vehicles
    if (vehicle.getOccupants && vehicle.getOccupants().length > 0) return;
    if (vehicle.occupants && vehicle.occupants.length > 0) return;

    if (vehicle.dbId) {
      VehicleModel.updateOne(
        { _id: vehicle.dbId },
        { "state.engine": false, "state.locked": false },
      ).exec();

      const ownerDbId = vehicle.owner && vehicle.owner.player ? vehicle.owner.player.toString() : null;
      if (ownerDbId) {
        const ownerPlayer = mp.players.getByDbId(ownerDbId);
        if (ownerPlayer) {
          ownerPlayer.mp.setOwnVariable("vehicleDespawn", false);
        }
      }
    }

    mp.vehicles.delete(vehicle);
    count++;
  });

  try {
    const DeleteLog = require("../models/DeleteLog").default;
    DeleteLog.create({
      issuerId: player.getVariable("dbId") || player.id,
      issuerName: player.name,
      type: 'DELETE RADIUS',
      details: `Range: ${searchRange}, Count: ${count}`
    });
  } catch (e) {}

  player.call('AnuntNotification', [
    `S-au sters ${count} vehicule goale in raza de ${searchRange} metri.`,
    'info'
  ]);
});

// COMANDA DE DVAREA - NIVEL DE ADMIN 2 (HELPER) - STOP
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE DVALL - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand("dvall", (player, _, timer) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 4) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  let setTimer = parseInt(timer);
  if (isNaN(setTimer) || setTimer < 1) {
    return player.notify(
      `~y~Usage: /dvall [timer] \n ~y~(Timer must be positive integer minutes)`,
    );
  }
  setTimeout(() => {
    mp.players.forEach((_player) => {
      _player.call("AnuntGlobal", [
        `Vehiculele goale vor fi sterse in ${setTimer} minute(s)`,
      ]);
    });
  }, 1000);
  if (setTimer > 1) {
    let lastA = (setTimer - 1) * 60 * 1000;
    setTimeout(() => {
      mp.players.forEach((_player) => {
        _player.call("AnuntGlobal", [`Vehiculele goale vor fi sterse in 1 minut`]);
      });
    }, lastA);
  }
  setTimeout(
    () => {
      let count = 0;
      const VehicleModel = require("../models/Vehicle").default;
      
      mp.vehicles.forEach((vehicle) => {
        // Only empty vehicles
        if (vehicle.getOccupants && vehicle.getOccupants().length > 0) return;
        if (vehicle.occupants && vehicle.occupants.length > 0) return;

        if (vehicle.dbId) {
          VehicleModel.updateOne(
            { _id: vehicle.dbId },
            { "state.engine": false, "state.locked": false },
          ).exec();

          const ownerDbId = vehicle.owner && vehicle.owner.player ? vehicle.owner.player.toString() : null;
          if (ownerDbId) {
            const ownerPlayer = mp.players.getByDbId(ownerDbId);
            if (ownerPlayer) {
              ownerPlayer.mp.setOwnVariable("vehicleDespawn", false);
            }
          }
        }

        mp.vehicles.delete(vehicle);
        count++;
      });

      try {
        const DeleteLog = require("../models/DeleteLog").default;
        DeleteLog.create({
          issuerId: player.getVariable("dbId") || player.id,
          issuerName: player.name,
          type: 'DELETE ALL',
          details: `Timer: ${setTimer}m, Count: ${count}`
        });
      } catch (e) {}

      mp.players.forEach((_player) => {
        _player.call("AnuntGlobal", [
          `Adminul ${player.name} a sters toate vehiculele goale (${count})`,
        ]);
      });
      setTimeout(() => {
        return player.notify(`~g~Toate vehiculele goale au fost sterse.`);
      }, 5000);
    },
    setTimer * 60 * 1000,
  );
});

// COMANDA DE DVALL - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - STOP
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE DV - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("dv", (player) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }

  if (admin < 1) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }

  let vehicle = player.vehicle;
  if (!vehicle || !mp.vehicles.exists(vehicle)) {
    let closestVehicle = null;
    let closestDistance = 1.5; // Max 1.5 meters
    mp.vehicles.forEach((veh) => {
      let distance = player.position.dist(veh.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestVehicle = veh;
      }
    });
    
    if (!closestVehicle || !mp.vehicles.exists(closestVehicle)) {
      return player.notify("~r~Nu este niciun vehicul in apropiere (1.5m)!");
    }
    vehicle = closestVehicle;
  }

  // Dacă are dbId, caută ownerul logat
  if (vehicle.dbId) {
    // Update DB like the "parcheaza" function
    const VehicleModel = require("../models/Vehicle").default;
    VehicleModel.updateOne(
      { _id: vehicle.dbId },
      { "state.engine": false, "state.locked": false },
    ).exec();

    const ownerDbId =
      vehicle.owner && vehicle.owner.player
        ? vehicle.owner.player.toString()
        : null;

    if (ownerDbId) {
      const ownerPlayer = mp.players.getByDbId(ownerDbId);
      if (ownerPlayer) {
        // If owner is online, set the variable to false just in case
        ownerPlayer.mp.setOwnVariable("vehicleDespawn", false);
      }
    }
  }

  // Use the custom delete method which cleans up the map
  mp.vehicles.delete(vehicle);

  try {
    const DeleteLog = require("../models/DeleteLog").default;
    DeleteLog.create({
      issuerId: player.getVariable("dbId") || player.id,
      issuerName: player.name,
      type: 'DELETE',
      details: `Vehicle ID: ${vehicle.id} ${vehicle.dbId ? `(DB ID: ${vehicle.dbId})` : ''}`
    });
  } catch (e) {}

  player.notify(`~g~Vehiculul a fost sters.`);
});

// COMANDA DE DV - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE FIX - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("fix", (player, _, targetId) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }

  const logFix = async (issuer: any, target: any) => {
    try {
      const FixLog = require("../models/FixLog").default;
      const UserModel = require("../models/User").default;
      const issuerLogic = jucator.get(issuer.id);
      const targetLogic = jucator.get(target.id);
      
      const issuerUser = await UserModel.findOne({ character: issuerLogic.dbId });
      const targetUser = await UserModel.findOne({ character: targetLogic.dbId });
      
      if (issuerUser && targetUser) {
        await FixLog.create({
          issuerId: issuerLogic.fixId,
          issuerEmail: issuerUser.email || "N/A",
          targetId: targetLogic.fixId,
          targetEmail: targetUser.email || "N/A",
          targetSerial: targetUser.serial || "N/A"
        });
      }
    } catch (e) {}
  };

  let check = false;
  if (targetId == undefined) {
    if (!player.vehicle) return player.notify("~r~Nu esti in vehicul!");
    repara.repair(player.vehicle);
    player.notify(`~g~Masina ta a fost reparata!`);
    logFix(player, player);
    return;
  } else {
    mp.players.forEachFast((trgt) => {
      let target = jucator.get(parseInt(trgt.id));
      if (target.fixId == parseInt(targetId)) {
        if (!trgt.vehicle) {
          check = null;
          return player.notify(
            `~r~Jucatorul ~y~${targetId} ~r~nu este in masina!`,
          );
        }
        repara.repair(trgt.vehicle);
        trgt.notify(`~g~Masina ta a fost reparata!`);
        logFix(player, trgt);
        check = true;
      }
    });
  }
  if (check == null) {
    // sa ma gandesc
  } else {
    if (check == true) {
      return player.notify(
        `~g~Masina jucatorului: ~y~${targetId} ~g~a fost reparata`,
      );
    } else {
      return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
    }
  }
});

// COMANDA DE FIX - NIVEL DE ADMIN 2 (HELPER) - START
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE ARMURA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand("armura", (player, _, targetId, arm) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 4) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  let check = false;
  if (targetId == undefined || arm == undefined)
    return player.notify(`Comanda: /armura [id] [0-100]`);
  mp.players.forEachFast((trgt) => {
    let target = jucator.get(parseInt(trgt.id));
    if (target.fixId == parseInt(targetId)) {
      target.mp.armour = parseInt(arm);
      trgt.notify(`~g~Ai primit ~y~${arm} ~g~armura`);
      check = true;
    }
  });
  if (check == true) {
    return player.notify(
      `~g~Jucatorul ~y~${targetId} ~g~a a primit ~y~${arm} ~g~armura`,
    );
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

// COMANDA DE ARMURA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE VIATA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand("viata", (player, _, targetId, hp) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 4) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  let check = false;

  if (targetId == undefined || hp == undefined)
    return player.notify(`Comanda: /viata [id] [0-100]`);
  mp.players.forEachFast((trgt) => {
    let target = jucator.get(parseInt(trgt.id));
    if (target.fixId == parseInt(targetId)) {
      target.mp.health = parseInt(hp);
      trgt.call("client:updateHealth", [parseInt(hp)]);
      trgt.notify(`~g~Ai primit ~y~${hp} ~g~viata`);
      check = true;
    }
  });
  if (check == true) {
    return player.notify(
      `~g~Jucatorul ~y~${targetId} ~g~a a primit ~y~${hp} ~g~viata`,
    );
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

// COMANDA DE VIATA - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE KILL - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START

mp.events.addCommand("kill", (player, _, targetId) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 4) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  let self = jucator.get(parseInt(player.id));
  if (self.fixId == parseInt(targetId))
    return player.notify(`~r~Nu te poti omora singur!`);
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
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

// COMANDA DE KILL - NIVEL DE ADMIN 4 (MODERATOR AVANSAT) - START
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE TPW - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("tpw", (player) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  let logicPlayer = jucator.get(player.id);
  if (!logicPlayer || !logicPlayer.waypoint) {
    return player.notify("~r~Nu ai un waypoint marcat pe mapa!");
  }

  let wp = logicPlayer.waypoint;
  if (!player.vehicle) {
    player.position = wp;
  } else {
    player.vehicle.position = wp;
  }
  player.dimension = 0;
  player.notify("~g~Te-ai teleportat la waypoint!");

  try {
    const TpLog = require("../models/TpLog").default;
    TpLog.create({
      issuerId: player.getVariable("dbId") || player.id,
      issuerName: player.name,
      type: 'TPW',
      details: `To Waypoint`
    });
  } catch (e) {}
});

// COMANDA DE TPW - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE TPC - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("tpc", (player, _, x, y, z) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 2) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  if (x == undefined || y == undefined || z == undefined)
    return player.outputChatBox("/tpc [x] [y] [z]");
  player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));

  try {
    const TpLog = require("../models/TpLog").default;
    TpLog.create({
      issuerId: player.getVariable("dbId") || player.id,
      issuerName: player.name,
      type: 'TPC',
      details: `To Coords: ${x}, ${y}, ${z}`
    });
  } catch (e) {}
});

// COMANDA DE TPC - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE TPTO - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("tpto", (player, _, tid) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
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

      try {
        const TpLog = require("../models/TpLog").default;
        TpLog.create({
          issuerId: player.getVariable("dbId") || player.id,
          issuerName: player.name,
          type: 'TPTO',
          details: `To Player: ${targetPlayer.name} (ID: ${tid})`
        });
      } catch (e) {}
    }
  });
  if (tpt == true) {
    return player.notify(`~g~ Te-ai teleportat la ID: ~y~${tid} ~g~`);
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

// COMANDA DE TPTO - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE TPTOME - NIVEL DE ADMIN 1 (HELPER IN TESTE) - START

mp.events.addCommand("tptome", (player, _, tid) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
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

      try {
        const TpLog = require("../models/TpLog").default;
        TpLog.create({
          issuerId: player.getVariable("dbId") || player.id,
          issuerName: player.name,
          type: 'TPTOME',
          details: `Target Player: ${targetPlayer.name} (ID: ${tid})`
        });
      } catch (e) {}
    }
  });
  if (tpt == true) {
    return player.notify(`~g~ L-ai teleportat pe ID: ~y~${tid} ~g~`);
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

// COMANDA DE TPTOME - NIVEL DE ADMIN 1 (HELPER IN TESTE) - STOP
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE VREME - NIVEL DE ADMIN 7 (COFONDATOR) - START

mp.events.addCommand("vremea", (player, _, weather) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 7) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  if (weather == undefined) return player.notify("Comanda: /vremea [weather]");
  mp.world.weather = weather;
});

// COMANDA DE VREME - NIVEL DE ADMIN 7 (COFONDATOR) - STOP
// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
// COMANDA DE ZI / NOAPTE - NIVEL DE ADMIN 7 (COFONDATOR) - START

mp.events.addCommand("ora", (player, _, timeArg) => {
  const admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 7) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }

  if (!timeArg) {
    return player.notify("~y~Foloseste: /ora [zi/noapte]");
  }

  const lowerArg = timeArg.toLowerCase();

  if (lowerArg === "zi") {
    mp.world.time.set(12, 0, 0);
    player.call("AnuntNotification", ["Ai setat ZI", "success"]);
  } else if (lowerArg === "noapte") {
    mp.world.time.set(0, 0, 0);
    player.call("AnuntNotification", ["Ai setat NOAPTE", "success"]);
  } else {
    return player.call("AnuntNotification", [
      "Argument invalid! Folosește: day sau night",
      "danger",
    ]);
  }
});

// COMANDA DE ZI / NOAPTE - NIVEL DE ADMIN 7 (COFONDATOR) - START
// ----------------------------------------------------------------------------------------------

mp.events.addCommand("setvw", (player, _, targetId, dim) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 2) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  if (targetId == undefined || dim == undefined)
    return player.notify("Comanda: /setvw [id] [dim]");
  let check = false;
  mp.players.forEachFast((trgt) => {
    let target = jucator.get(parseInt(trgt.id));
    if (target.fixId == parseInt(targetId)) {
      trgt.dimension = parseInt(dim);
      check = true;
    }
  });
  if (check == true) {
    return player.notify(
      `~g~ Ai setat virtualul ~y~${dim} ~g~pentru ID ~y~${targetId}`,
    );
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

mp.events.addCommand("resetvw", (player, _, targetId) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  if (targetId == undefined) return player.notify("Comanda: /resetvw [id]");
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
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

mp.events.addCommand("vw", (player) => {
  player.notify(`Esti in virtual ~r~${player.dimension} ~w~.`);
});
mp.events.addCommand("id", (player) => {
  player.notify(`ID-ul tau este: ~r~${player.id} ~w~.`);
});

mp.events.addCommand("kick", async (player, _, targetId, ...reasonArr) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify("~r~Nu ai aceasta permisiune!");
    return;
  }
  if (targetId == undefined)
    return player.notify("Comanda: /kick [id] [motiv]");
  const reason = reasonArr.length ? reasonArr.join(" ") : "Necompletat";

  let check = false;
  mp.players.forEachFast((trgt) => {
    let tDbId = 0;
    let tAdmin = trgt.getVariable("adminLvl") || 0;

    // Usually target comes from jucator.get
    if (typeof jucator !== "undefined") {
      let j = jucator.get(parseInt(trgt.id));
      if (j) tDbId = j.fixId || j.dbId || 0;
    } else {
      // Let's assume standard
      let j = mp.players.get ? mp.players.get(trgt) : null;
      if (j) tDbId = j.dbId;
    }

    if (tDbId == 0) tDbId = trgt.getVariable("dbId") || trgt.id;

    if (tDbId == parseInt(targetId)) {
      if (tAdmin > 3) {
        player.notify("~r~Nu poti da afara un owner!");
        check = true;
        return;
      }
      if (trgt.id === player.id) {
        player.notify("~r~Nu te poti da afara pe tine!");
        check = true;
        return;
      }
      let newt = mp.players.at(trgt.id);
      trgt.notify("~r~Ai primit kick de pe server");
      trgt.outputChatBox("Ai primit kick de pe server. Motiv: " + reason);
      setTimeout(() => {
        newt.kick("Kicked: " + reason);
      }, 5000);
      check = true;

      // Try to log it
      try {
        const KickLog = require("../models/KickLog").default;
        const UserModel = require("../models/User").default;
        UserModel.findOne({ character: tDbId })
          .then((targetUser) => {
            UserModel.findOne({
              character: player.getVariable("dbId") || player.id,
            })
              .then((adminUser) => {
                if (targetUser) {
                  KickLog.create({
                    issuerId: player.getVariable("dbId") || player.id,
                    issuerEmail: adminUser?.email || "N/A",
                    kickedId: tDbId,
                    kickedEmail: targetUser?.email || "N/A",
                    kickedSerial: targetUser?.serial || "N/A",
                    reason: reason,
                  });
                }
              })
              .catch(() => {});
          })
          .catch(() => {});

        const chat = require("../basic/chat").default;
        chat.sendSystem(
          player.name + " a dat kick lui " + trgt.name + " (" + reason + ")",
        );
      } catch (e) {}
    }
  });

  if (check == true) {
    return player.notify(
      "~g~Jucatorul ~y~" + targetId + " ~g~a fost dat afara",
    );
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

mp.events.addCommand("warn", async (player, _, targetId, ...reasonArr) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify("~r~Nu ai aceasta permisiune!");
    return;
  }
  if (targetId == undefined)
    return player.notify("Comanda: /warn [id] [motiv]");
  const reason = reasonArr.length ? reasonArr.join(" ") : "Necompletat";

  let check = false;
  mp.players.forEachFast((trgt) => {
    let target = jucator.get(parseInt(trgt.id));
    if (target.fixId == parseInt(targetId)) {
      const chat = require("../basic/chat").default;
      chat.sendSystem(player.name + " l-a avertizat pe " + trgt.name + " (" + reason + ")");
      trgt.notify("~r~Ai primit un avertisment (Warn). Motiv: " + reason);
      
      check = true;

      // Log it
      try {
        const WarnLog = require("../models/WarnLog").default;
        const UserModel = require("../models/User").default;
        UserModel.findOne({ character: target.dbId })
          .then((targetUser) => {
            UserModel.findOne({
              character: player.getVariable("dbId") || player.id,
            })
              .then((adminUser) => {
                if (targetUser) {
                  WarnLog.create({
                    issuerId: player.getVariable("dbId") || player.id,
                    issuerEmail: adminUser?.email || "N/A",
                    targetId: target.fixId,
                    targetEmail: targetUser?.email || "N/A",
                    targetSerial: targetUser?.serial || "N/A",
                    reason: reason,
                  });
                }
              })
              .catch(() => {});
          })
          .catch(() => {});
      } catch (e) {}
    }
  });

  if (check == true) {
    return player.notify("~g~Jucatorul ~y~" + targetId + " ~g~a fost avertizat");
  } else {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

mp.events.addCommand("freeze", async (player, _, targetId) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify("~r~Nu ai aceasta permisiune!");
    return;
  }
  if (targetId == undefined)
    return player.notify("Comanda: /freeze [id]");

  let check = false;
  mp.players.forEachFast((trgt) => {
    let target = jucator.get(parseInt(trgt.id));
    if (target.fixId == parseInt(targetId)) {
      const isFrozen = trgt.getVariable('frozen') || false;
      trgt.setVariable('frozen', !isFrozen);
      trgt.call('client:admin:freeze', [!isFrozen]);
      player.notify(`~g~Jucatorul ${trgt.name} a fost ${!isFrozen ? 'inghetat' : 'dezghetat'}.`);
      
      check = true;

      // Log it
      try {
        const FreezeLog = require("../models/FreezeLog").default;
        const UserModel = require("../models/User").default;
        UserModel.findOne({ character: target.dbId })
          .then((targetUser) => {
            UserModel.findOne({
              character: player.getVariable("dbId") || player.id,
            })
              .then((adminUser) => {
                if (targetUser) {
                  FreezeLog.create({
                    issuerId: player.getVariable("dbId") || player.id,
                    issuerEmail: adminUser?.email || "N/A",
                    targetId: target.fixId,
                    targetEmail: targetUser?.email || "N/A",
                    targetSerial: targetUser?.serial || "N/A"
                  });
                }
              })
              .catch(() => {});
          })
          .catch(() => {});
      } catch (e) {}
    }
  });

  if (!check) {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
  }
});

mp.events.addCommand("unfreeze", async (player, _, targetId) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify("~r~Nu ai aceasta permisiune!");
    return;
  }
  if (targetId == undefined)
    return player.notify("Comanda: /unfreeze [id]");

  let check = false;
  mp.players.forEachFast((trgt) => {
    let target = jucator.get(parseInt(trgt.id));
    if (target.fixId == parseInt(targetId)) {
      trgt.setVariable('frozen', false);
      trgt.call('client:admin:freeze', [false]);
      player.notify(`~g~Jucatorul ${trgt.name} a fost dezghetat.`);
      
      check = true;

      // Log it
      try {
        const UnfreezeLog = require("../models/UnfreezeLog").default;
        const UserModel = require("../models/User").default;
        UserModel.findOne({ character: target.dbId })
          .then((targetUser) => {
            UserModel.findOne({
              character: player.getVariable("dbId") || player.id,
            })
              .then((adminUser) => {
                if (targetUser) {
                  UnfreezeLog.create({
                    issuerId: player.getVariable("dbId") || player.id,
                    issuerEmail: adminUser?.email || "N/A",
                    targetId: target.fixId,
                    targetEmail: targetUser?.email || "N/A",
                    targetSerial: targetUser?.serial || "N/A"
                  });
                }
              })
              .catch(() => {});
          })
          .catch(() => {});
      } catch (e) {}
    }
  });

  if (!check) {
    return player.notify("~r~ID-ul jucatorului nu a fost gasit!");
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
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
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
    trgt.call("updateTickerText", [tickerText]);
  });
  return console.log(`Call command given`);
});

mp.events.add("playerCommand", (player, command) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 7) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  let arr = command.split(" ");
  if (arr[0] == "setclothes") {
    if (
      arr.length < 5 ||
      parseInt(arr[1]) === undefined ||
      parseInt(arr[2]) === undefined ||
      parseInt(arr[3]) === undefined ||
      parseInt(arr[4]) === undefined
    ) {
      return player.outputChatBox(
        "Use syntax: /setclothes [component_id] [drawable_id] [texture_id] [palette_id]",
      );
    } else {
      player.setClothes(
        parseInt(arr[1]),
        parseInt(arr[2]),
        parseInt(arr[3]),
        parseInt(arr[4]),
      );
    }
  }
});
mp.events.add("playerCommand", (player, command) => {
  let arr = command.split(" ");
  if (arr[0] === "setprops") {
    let admin = player.getVariable("adminLvl"); /* ADUTY */
    if (admin > 0 && !player.admin_duty) {
      player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
      return;
    }
    if (admin < 7) {
      player.notify(`~r~Nu ai aceasta permisiune!`);
      return;
    }
    if (
      arr.length < 4 ||
      isNaN(parseInt(arr[1])) ||
      isNaN(parseInt(arr[2])) ||
      isNaN(parseInt(arr[3]))
    ) {
      return player.outputChatBox(
        "Use syntax: /setprops [component_id] [drawable_id] [texture_id]",
      );
    }

    const componentId = parseInt(arr[1]);
    const drawableId = parseInt(arr[2]);
    const textureId = parseInt(arr[3]);

    player.setProp(componentId, drawableId, textureId);
  }
});

mp.events.addCommand(
  "ck",
  async (
    player: PlayerMp,
    _,
    targetIdStr: string,
    ...reasonParts: string[]
  ) => {
    const adminLvl = player.getVariable("adminLvl"); /* ADUTY */
    if (adminLvl > 0 && !player.admin_duty) {
      player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
      return;
    }
    if (adminLvl < 7)
      return player.outputChatBox("~r~Nu ai acces la aceasta comanda.");

    const targetId = parseInt(targetIdStr);
    const reason = reasonParts.join(" ").trim();

    if (!targetId || isNaN(targetId) || !reason) {
      return player.outputChatBox("FOLOSESTE: /ck [playerID] [motiv]");
    }

    let targetPlayer: PlayerMp | null = null;
    mp.players.forEachFast((p) => {
      const logic = jucator.get(p.id);
      if (logic?.fixId === targetId) {
        targetPlayer = p;
      }
    });

    if (!targetPlayer)
      return player.outputChatBox("~r~Jucatorul nu a fost gasit.");

    const logicTarget = jucator.get(targetPlayer.id);
    if (!logicTarget?.fixId)
      return player.outputChatBox("~r~Eroare la identificarea jucatorului.");

    try {
      const character = await Character.findOne({ uid: logicTarget.fixId });
      if (!character)
        return player.outputChatBox(
          "~r~Caracterul nu a fost gasit in baza de date.",
        );

      const characterId = character._id;

      // Sterge caracterul
      await Character.deleteOne({ _id: characterId });
      // Da update la afaceri cu owner null
      await Business.updateMany(
        { owner: characterId },
        { $set: { owner: null } },
      );
      //
      await House.updateMany({ owner: characterId }, { $set: { owner: null } });

      await Vehicle.deleteMany({ owner: characterId });

      await User.deleteMany({ character: characterId });

      // Kick jucatorul
      targetPlayer.kick(`Ai primit CK. Motiv: ${reason}`);

      player.outputChatBox(`~g~Ai dat CK lui ${targetId}.`);
    } catch (err) {
      console.error("Eroare la executarea /ck:", err);
      player.outputChatBox("~r~Eroare interna. Verifica consola.");
    }
  },
);

async function handleCharacterKill(
  targetPlayer: PlayerMp,
  reasonText: string,
  adminName: string = "Server",
) {
  const logicTarget = jucator.get(targetPlayer.id);
  if (!logicTarget?.fixId) return;

  try {
    const character = await Character.findOne({ uid: logicTarget.fixId });
    if (!character) return;

    const characterId = character._id;

    // Sterge caracterul
    await Character.deleteOne({ _id: characterId });

    // Scoate ownership-uri
    await Business.updateMany(
      { owner: characterId },
      { $set: { owner: null } },
    );
    await House.updateMany({ owner: characterId }, { $set: { owner: null } });
    await Vehicle.deleteMany({ owner: characterId });
    await User.deleteMany({ character: characterId });

    // Kick jucatorul
    targetPlayer.kick(`Ai primit CK. Motiv: ${reasonText}`);

    console.log(
      `[CK] ${targetPlayer.name} a fost sters de ${adminName} cu motivul: ${reasonText}`,
    );

    await sendDiscordLogCk({
      title: "📌 Player Death",
      color: 3066993, // Light blue color
      description: `**${targetPlayer.name}** (DB ID: **${logicTarget.fixId}** a primit CK de la **${adminName}** cu motivul **${reasonText}**.`,
      footer: {
        text: "Loguri server | Empire",
        icon_url: "https://redland.ro/empirerp.png",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[CK ERROR]", err);
  }
}

mp.events.addCommand("me", (player, _, ...message) => {
  if (message.length === 0)
    return player.outputChatBox(
      `!{${SERVER_COLORS.RED}}(me) !{${SERVER_COLORS.WHITE}}/me (actiune)`,
    );

  const msg = `* ${message.join(" ")}`;

  mp.players.forEachInRange(player.position, 15, (target) => {
    target.call("client:me:PushMeText", [player.id, msg]);
  });
});
mp.events.addCommand("ME", (player, _, ...message) => {
  if (message.length === 0)
    return player.outputChatBox(
      `!{${SERVER_COLORS.RED}}(me) !{${SERVER_COLORS.WHITE}}/me (actiune)`,
    );

  const msg = `* ${message.join(" ")}`;

  mp.players.forEachInRange(player.position, 15, (target) => {
    target.call("client:me:PushMeText", [player.id, msg]);
  });
});

mp.events.addCommand("notificare", (player: PlayerMp, fullText: string) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 4) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }

  const args = fullText.split(" ");
  const type = args[0]?.toLowerCase();
  const message = args.slice(1).join(" ");

  if (!["info", "danger", "success"].includes(type)) {
    player.outputChatBox("Syntax: /anunt [info | danger | success] [message]");
    return;
  }

  if (!message || message.length < 2) {
    player.outputChatBox("Please enter a message.");
    return;
  }

  // Send to all players
  mp.players.forEach((p) => {
    p.call("AnuntNotification", [message, type]);
  });
});

mp.events.addCommand("anunt", (player: PlayerMp, fullText: string) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 5) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  const message = fullText.trim();

  if (!message || message.length < 2) {
    player.outputChatBox("Please enter a message: /anunt [message]");
    return;
  }

  // Send to all players
  mp.players.forEach((p) => {
    p.call("AnuntGlobal", [message]);
  });
});

mp.events.addCommand("scare", (player, _, targetId) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
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
      target.mp.call("ShowJumpScare");
      found = true;
    }
  });

  if (found) {
    player.notify(
      `~g~Ai declansat jumpscare-ul pentru jucatorul cu ID-ul ~y~${targetId}`,
    );
  } else {
    player.notify("~r~Jucatorul nu a fost gasit!");
  }
});

mp.events.addCommand(
  "arma",
  async (player, _, targetId, weaponName, ammoAmountStr, ammoType) => {
    const adminLvl = player.getVariable("adminLvl"); /* ADUTY */
    if (adminLvl > 0 && !player.admin_duty) {
      player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
      return;
    }
    if (adminLvl < 6) {
      player.call("AnuntNotification", [
        "Nu ai acces la aceasta comanda",
        "danger",
      ]);
      return;
    }

    if (!targetId || !weaponName || !ammoAmountStr || !ammoType) {
      player.outputChatBox(
        "/arma [id] [weapon_name] [ammo_amount] [ammo_type]",
      );
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
          await playerInventory.checkEnoughSlots(target, [
            weaponItem,
            ammoItem,
          ]);
          await playerInventory.addItem(target, weaponItem);
          await playerInventory.addItem(target, ammoItem);

          check = true;
          player.notify(
            `~g~Ai dat cu succes arma ${weaponName} și ${ammoItem.amount} ${ammoType} jucătorului cu ID-ul ${targetId}`,
          );
        } catch (err) {
          player.notify(
            "~r~Inventarul jucătorului este plin sau a apărut o eroare.",
          );
        }
      }
    });
  },
);

mp.events.addCommand("gun", (player, _, targetId, weapon, ammoStr) => {
  const adminLvl = player.getVariable("adminLvl"); /* ADUTY */
  if (adminLvl > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (adminLvl < 6) {
    player.call("AnuntNotification", [
      "Nu ai acces la aceasta comanda",
      "danger",
    ]);
    return;
  }

  if (!targetId || !weapon || !ammoStr) {
    player.outputChatBox("/gun [fixId] [weapon] [ammo]");
    return;
  }

  const ammo = parseInt(ammoStr);
  if (isNaN(ammo) || ammo <= 0) {
    player.call("AnuntNotification", [
      "Cantitatea de gloante trebuie sa fie un numar valid.",
      "danger",
    ]);
    return;
  }

  let found = false;

  mp.players.forEachFast((plr) => {
    const target = jucator.get(plr.id);
    if (!target) return;

    if (target.fixId === parseInt(targetId)) {
      found = true;
      plr.giveWeapon(mp.joaat(`weapon_${weapon}`), ammo);
      player.call("AnuntNotification", [
        "Ai dat arma ${weapon} (${ammo} gloante) catre jucatorul cu ID-ul ${targetId}.",
        "success",
      ]);
    }
  });

  if (!found) {
    player.call("AnuntNotification", [
      "Jucatorul cu acel id nu a fost gasit!",
      "danger",
    ]);
  }
});

mp.events.addCommand("addcomp", (player, _, weapon, compName) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
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

mp.events.addCommand(
  "giveitem",
  async (player, _, targetId, itemName, amountStr) => {
    const adminLvl = player.getVariable("adminLvl"); /* ADUTY */
    if (adminLvl > 0 && !player.admin_duty) {
      player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
      return;
    }
    if (adminLvl < 6) {
      player.call("AnuntNotification", [
        "Nu ai acces la aceasta comanda",
        "danger",
      ]);
      return;
    }

    if (!targetId || !itemName || !amountStr) {
      player.outputChatBox("/giveitem [id] [item_name] [amount]");
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
          player.notify(
            `~g~Ai dat cu succes ${item.amount}x ${item.name} jucătorului cu ID-ul ${targetId}`,
          );
        } catch (err) {
          player.notify(
            "~r~Inventarul jucatorului este plin sau a aparut o eroare.",
          );
        }
      }
    });

    setTimeout(() => {
      if (!check) {
        player.notify("~r~ID-ul jucatorului nu a fost gasit!");
      }
    }, 200);
  },
);

mp.events.addCommand("notif", (player: PlayerMp, fullText: string) => {
  const adminLvl = player.getVariable("adminLvl"); /* ADUTY */
  if (adminLvl > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (adminLvl < 4) {
    player.call("AnuntNotification", [
      "Nu ai acces la aceasta comanda",
      "danger",
    ]);
    return;
  }

  if (!fullText) {
    player.outputChatBox(
      "Syntax: /notif [albastru | rosu | verde | galben | roz | mov] [mesaj]",
    );
    return;
  }

  const args = fullText.split(" ");
  const type = args[0]?.toLowerCase();
  const message = args.slice(1).join(" ");

  const allowedTypes = ["albastru", "rosu", "verde", "galben", "roz", "mov"];
  if (!allowedTypes.includes(type)) {
    player.outputChatBox(
      "Syntax: /notif [albastru | rosu | verde | galben | roz | mov] [mesaj]",
    );
    return;
  }

  if (!message || message.length < 2) {
    player.outputChatBox("Introdu un mesaj.");
    return;
  }

  const typeMap: any = {
    'rosu': 'danger',
    'verde': 'success',
    'galben': 'info',
    'albastru': 'info',
    'roz': 'info',
    'mov': 'info'
  };
  const mappedType = typeMap[type] || 'info';

  mp.players.forEach((p) => {
    p.call("AnuntNotification2", [message, mappedType]);
  });
});

mp.events.addCommand("alertapolitie", (player: PlayerMp, fullText: string) => {
  const adminLvl = player.getVariable("adminLvl"); /* ADUTY */
  if (adminLvl > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (adminLvl < 5) {
    player.call("AnuntNotification", [
      "Nu ai acces la aceasta comanda",
      "danger",
    ]);
    return;
  }

  if (!fullText || fullText.trim().length < 2) {
    player.outputChatBox("Foloseste: /alertapolitie [mesaj]");
    return;
  }

  const message = fullText.trim();

  mp.players.forEach((p) => {
    p.call("AlertaPolitie", [message]);
  });
});

mp.events.addCommand("as", (player: PlayerMp) => {
  const playerFaction = player.getVariable("faction");

  if (playerFaction !== "sindicat") {
    player.call("AnuntNotification", [
      "Nu ai acces la această comandă",
      "danger",
    ]);
    return;
  }

  const factionsToAlert = ["santamuerte", "losdiablos"];
  let notifiedCount = 0;
  const position = player.position;

  factionsToAlert.forEach((factionName) => {
    const targetFaction = factions.getFaction(factionName);
    if (targetFaction) {
      const members = targetFaction.getPlayers();
      members.forEach((member) => {
        if (!member || !member.fixId) return;

        const isOnline = mp.players
          .toCustomArray()
          .find((p) => p.fixId === member.fixId);
        if (isOnline) {
          isOnline.mp.call("AlertaSindicat", [
            position.x,
            position.y,
            position.z,
          ]);
          notifiedCount++;
        }
      });
    }
  });

  if (notifiedCount === 0) {
    player.call("AnuntNotification", [
      "Niciun membru nu a putut fi alertat.",
      "danger",
    ]);
  } else {
    player.call("AnuntNotification", [
      `Ai trimis alerta către ${notifiedCount} membri din mafii/gang-uri.`,
      "success",
    ]);
  }
});

// COORDONATE SI ROTATE POSITION
mp.events.addCommand("pos", (player) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }
  const pos = player.position;
  const rot = player.heading;

  player.outputChatBox(
    `X: ${pos.x.toFixed(4)} Y: ${pos.y.toFixed(4)} Z: ${pos.z.toFixed(4)}`,
  );
  player.outputChatBox(`Head rotate: ${rot.toFixed(4)}`);

  console.log(
    `X: ${pos.x.toFixed(2)} Y: ${pos.y.toFixed(2)} Z: ${pos.z.toFixed(2)} | Head rotate: ${rot.toFixed(4)}`,
  );
});

// COMANDA DE BOOST VITEZA LA MASINA START

mp.events.addCommand("viteza", (player, fullText, valueArg) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 7) {
    player.notify(`~r~Nu ai aceasta permisiune!`);
    return;
  }

  // Parsează valoarea ca număr
  const value = parseFloat(valueArg);
  if (isNaN(value) || value <= 0) {
    return player.outputChatBox(
      "Folosire: /viteza [valoare] (ex: /viteza 200)",
    );
  }

  // Trimite către client
  player.call("util:player:admin:vehicles:speed", [value]);
  player.outputChatBox(
    `Limita de viteza setata la ${value} km/h pentru vehiculul tau.`,
  );
});

// COMANDA DE BOOST VITEZA LA MASINA END

// COMANDA DE DRIFT MODE START

mp.events.addCommand("drift", (player: PlayerMp, _, valueArg: string) => {
  let admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 7) return player.notify(`~r~Nu ai aceasta permisiune!`);
  let value = (valueArg || "").toLowerCase();
  if (value !== "on" && value !== "off")
    return player.outputChatBox("Folosire: /drift [on|off]");
  player.call("util:player:admin:vehicles:drift", [value === "on"]);
  player.outputChatBox(
    `Drift mode ${value === "on" ? "activat" : "dezactivat"} pentru vehiculul tau.`,
  );
});

// COMANDA DE DRIFT MODE STOP

// COMANDA DE TELEPORT LA ADMIN HOUSE START

mp.events.addCommand("ah", (player) => {
  const admin = player.getVariable("adminLvl"); /* ADUTY */
  if (admin > 0 && !player.admin_duty) {
    player.notify("~r~Trebuie sa fii ON DUTY (/aduty)!");
    return;
  }
  if (admin < 1) {
    return player.notify("~r~Nu ai aceasta permisiune!");
  }

  // Coordonate dorite
  const coord = { x: 123.456, y: 789.012, z: 34.567 };

  player.position = new mp.Vector3(coord.x, coord.y, coord.z);
  player.notify("~g~Te-ai teleportat la Admin Place!");
});

// COMANDA DE TELEPORT LA ADMIN HOUSE STOP

mp.events.addCommand("intro", (player) => {
  player.call("PlayGlobalVideo"); // nu ai nevoie de argument aici
  player.notify("Intro video pornit!");
});

mp.events.addCommand("shop", (player) => {
  player.call("OpenShopUI");
});

mp.events.addCommand("hudsettings", (player) => {
  // Îi trimitem jucătorului și setările pe care le are
  const logicPlayer = jucator.get(player.id);
  if (logicPlayer && logicPlayer.hudSettings) {
    player.call("OpenHudSettingsUI", [JSON.stringify(logicPlayer.hudSettings)]);
  } else {
    player.call("OpenHudSettingsUI");
  }
});

// Function to sort vehicles by distance from the player
function byEntityDistance(a, b) {
  let entityA = a.veh.position.dist(a.playerPos);
  let entityB = b.veh.position.dist(b.playerPos);

  return entityA - entityB; // Sort from nearest to farthest
}
