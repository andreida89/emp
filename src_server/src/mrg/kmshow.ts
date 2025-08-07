import VehicleModel from 'models/Vehicle';
import masini from 'helpers/vehicles';

    function noShowKm(player, vehicle) {
        mp.events.remove("playerEnterVehicle", sShowKm);
        player.call("noShowKM", [false]);
       
    }

    function sShowKm(player, vehicle) {
        if (player.vehicle && player.vehicle.dbId != null) {
            let mileage = 0;
            if (player.vehicle.mileage != 0) {
                mileage = player.vehicle.mileage;
            } 
            let mId = player.vehicle.dbId;
            player.call("showKM", [true, mileage, mId]);
        }
    }

    function kmSave(player, masina, mileage, id) {
        var km = 0;
        km = (mileage.toFixed(2) * 100).toFixed(0);
        player.call("kmRemove", [true]);
        VehicleModel.findByIdAndUpdate(masina, {
                $set: { mileage: km }
        }, function (err) {
            if (err) {
                console.log(err)
            }
            else {
                //do nothing
            }
        }
        );
        var mas = masini.getById(masina);
        mas.mileage = km;
        mp.events.remove("playerStartExitVehicle", noShowKm);
        mp.events.remove("saveKM");
        
    }

    function kminit(player) {
        if (player.vehicle && player.vehicle.dbId != NaN) {
            mp.events.add("playerEnterVehicle", sShowKm);
            mp.events.add("playerStartExitVehicle", noShowKm);
            mp.events.add("saveKM", (player, masina, mileage, id) => {
                kmSave(player, masina, mileage, id);
            });
            player.call("showKMinit", [true]);
        }
    }


//mp.events.add("playerStartEnterVehicle", kminit);