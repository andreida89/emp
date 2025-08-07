//let lightState = vehicle.getLightsState(1, 1);

//mp.gui.chat.push(`Low Beam: ${lightState.lightsOn}, High Beam: ${lightState.highbeamsOn}`);


function showKMinit(valid: boolean) {
    mp.events.add('showKM', showKM);
    mp.events.add('noShowKM', noShowKM);
    mp.events.add('kmRemove', kmOut);
}

function showKM(status, mileage, mId) {
    newDraw(status, mileage, mId);
}

function noShowKM(status) {
    newDraw(status);
}

function kmOut(status) {
    if (status) {
        mp.events.remove("showKM", showKM);
        mp.events.remove("noShowKM", noShowKM);
        mp.events.remove('kmremove', kmOut);
        //mp.events.remove("playerLeaveVehicle");
    }
}

//mp.events.add("showKMinit", showKMinit);
/*
mp.events.add('playerExitVehicle', () => {
    //mp.events.remove('playerEnterVehicle', kmHandler);
    let status = false;
    newDraw(status);
});

mp.events.add("playerStartExitVehicle", () => {
    //mp.events.remove('playerEnterVehicle', kmHandler);
    let status = false;
    newDraw(status);
});
*/

function kmShowDraw(iPosition, far, vid, km) {
    
}

function newDraw(status, mileage?: number, mId?) {
    if (status == true) {
        var iPosition = mp.players.local.vehicle.position;
        var far = "Oprit";
        var vid = mp.players.local.vehicle.id;
        var km = 0;
        //console.log(mileage);
        if (mileage != 0) {
            km = mileage/100;
        }
        mp.events.add('render', () => {
            if (mp.players.local.vehicle) {
                var nPosition = mp.players.local.vehicle.position;
                //let altPosition = iPosition.subtract(nPosition);
                distance = iPosition.subtract(nPosition).length();
                km = km + ((distance * 3.6) * 0.6214 / 1000) / 2;

                let lightState = mp.players.local.vehicle.getLightsState(1, 1);
                if (lightState.lightsOn && lightState.highbeamsOn) {
                    far = "Faza lunga";
                }
                if (lightState.lightsOn && !lightState.highbeamsOn) {
                    far = "Faza scurta";
                }
                if (!lightState.lightsOn && !lightState.highbeamsOn) {
                    far = "Pozitie";
                }
                /*
                mp.game.graphics.drawText(`Speed: ${(currents * 3.6).toFixed(0)}/ ${((maxs * 3.6).toFixed(0))} km/h`, [0.5, 0.050], {
                    font: 4,
                    color: [255, 255, 255, 185],
                    scale: [0.5, 0.5],
                    outline: false
                });
                
                mp.game.graphics.drawText(`Kilometraj: ${km.toFixed(2)}km `, [0.5, 0.005], {
                    font: 0,
                    color: [255, 255, 255, 185],
                    scale: [0.4, 0.3],
                    outline: true
                });*/
                iPosition = nPosition;
            }
        });
        
        mp.events.add("playerLeaveVehicle", () => {
            mp.events.callRemote("saveKM", mId, km, vid);
            
        });

} else {
    
}
}

function pSetInv(status) {
    let localPlayer = mp.players.local;
    let localP = mp.game.player;
    if (status) {
        localPlayer.setInvincible(true);
        localP.setInvincible(true);
    } else {
        localPlayer.setInvincible(false);
        localP.setInvincible(false);
    }
}

mp.events.add("admSetInvincible", pSetInv);