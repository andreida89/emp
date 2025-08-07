const adminTagIntervals: Map<number, NodeJS.Timeout> = new Map();
function getAdminTops(adminLevel: number): [number, number] {
    switch (adminLevel) {
        case 1: return [624, 7];
        case 2: return [624, 6];
        case 3: return [624, 4];
        case 4: return [624, 5];
        case 5: return [624, 3];
        case 6: return [624, 2];
        case 7: return [624, 1];
        case 8: return [624, 0];
        default: return [624, 7];
    }
}
function getAdminMasks(adminLevel: number): [number, number] {
    switch (adminLevel) {
        case 1: return [250, 6];
        case 2: return [250, 5];
        case 3: return [250, 4];
        case 4: return [250, 4];
        case 5: return [250, 3];
        case 6: return [250, 2];
        case 7: return [250, 1];
        case 8: return [250, 0];
        default: return [250, 1];
    }
}

mp.events.addCommand('aduty', (player: PlayerMp, state?: string) => {
    const adminLevel = player.getVariable('adminLvl') || 0;
    if (adminLevel < 1) {
        player.call('AnuntNotification', ['Nu ai acces la aceasta comanda!', 'danger']);
        return;
    }

    if (!state || (state !== 'on' && state !== 'off')) {
        player.notify("Usage: /aduty [on/off]");
        return;
    }

    if (state === 'on') {

        player.admin_duty = true;
        player.setVariable('adminTag', true);

        // Salvare haine
        player.oldClothes = {
            tops: player.getClothes(11),
            pants: player.getClothes(4),
            shoes: player.getClothes(6),
            masks: player.getClothes(1),
            accessories: player.getClothes(7),
            tasks: player.getClothes(9),
            torso: player.getClothes(3),
            undershirts: player.getClothes(8),
            bag: player.getClothes(5),
            hats: player.getProp(0),
            glasses: player.getProp(1),
            ears: player.getProp(2),
            watches: player.getProp(6),
            bracelets: player.getProp(7),
        };

        // Outfit admin
        const adminClothes = {
            male: {
                tops: getAdminTops(adminLevel),
                pants: [33, 0],
                shoes: [24, 0],
                masks: getAdminMasks(adminLevel),
                accessories: [0, 0],
                tasks: [0, 0],
                torso: [0, 0],
                undershirts: [15, 0],
                bag: [0, 0],
                hats: [8, 0],
                glasses: [0, 0],
                ears: [0, 0],
                watches: [0, 0],
                bracelets: [0, 0]

            },
            female: {
                tops: getAdminTops(adminLevel),
                pants: [35, 0],
                shoes: [25, 0],
                masks: getAdminMasks(adminLevel),
                accessories: [0, 0],
                tasks: [0, 0],
                torso: [65, 0],
                undershirts: [15, 0],
                bag: [0, 0],
                hats: [0, 0],
                glasses: [0, 0],
                ears: [0, 0],
                watches: [0, 0],
                bracelets: [0, 0]
            }
        };

        const gender = player.gender === 0 ? 'female' : 'male';
        const outfit = adminClothes[gender];

        player.setProp(0, outfit.hats[0], outfit.hats[1]);
        player.setProp(1, outfit.glasses[0], outfit.glasses[1]);
        player.setProp(2, outfit.ears[0], outfit.ears[1]);
        player.setProp(6, outfit.watches[0], outfit.watches[1]);
        player.setProp(7, outfit.bracelets[0], outfit.bracelets[1]);
        player.setClothes(1, outfit.masks[0], outfit.masks[1], 0);
        player.setClothes(3, outfit.torso[0], outfit.torso[1], 0);
        player.setClothes(4, outfit.pants[0], outfit.pants[1], 0);
        player.setClothes(5, outfit.bag[0], outfit.bag[1], 0);
        player.setClothes(6, outfit.shoes[0], outfit.shoes[1], 0);
        player.setClothes(8, outfit.undershirts[0], outfit.undershirts[1], 0);
        player.setClothes(9, outfit.tasks[0], outfit.tasks[1], 0);
        player.setClothes(7, outfit.accessories[0], outfit.accessories[1], 0);
        player.setClothes(11, outfit.tops[0], outfit.tops[1], 0);

        // Notificări
        player.call('AnuntNotification', ['Acum esti ON DUTY', 'success']);

        // Activează tag-ul
        startAdminTagInterval(player);
        player.call('client:admin:tag', [player.id, 'STAFF', adminLevel]);

    } else {
        if (!player.oldClothes) {
            player.call('AnuntNotification', ['Nu ai haine salvate anterior!', 'danger']);
            return;
        }

        player.admin_duty = false;
        player.setVariable('adminTag', false);

        const clothes = player.oldClothes;
        player.setProp(0, clothes.hats.drawable, clothes.hats.texture);
        player.setProp(1, clothes.glasses.drawable, clothes.glasses.texture);
        player.setProp(2, clothes.ears.drawable, clothes.ears.texture);
        player.setProp(6, clothes.watches.drawable, clothes.watches.texture);
        player.setProp(7, clothes.bracelets.drawable, clothes.bracelets.texture);
        player.setClothes(1, clothes.masks.drawable, clothes.masks.texture, clothes.masks.palette);
        player.setClothes(3, clothes.torso.drawable, clothes.torso.texture, clothes.torso.palette);
        player.setClothes(4, clothes.pants.drawable, clothes.pants.texture, clothes.pants.palette);
        player.setClothes(5, clothes.bag.drawable, clothes.bag.texture, clothes.bag.palette);
        player.setClothes(6, clothes.shoes.drawable, clothes.shoes.texture, clothes.shoes.palette);
        player.setClothes(8, clothes.undershirts.drawable, clothes.undershirts.texture, clothes.undershirts.palette);
        player.setClothes(9, clothes.tasks.drawable, clothes.tasks.texture, clothes.tasks.palette);
        player.setClothes(7, clothes.accessories.drawable, clothes.accessories.texture, clothes.accessories.palette);
        player.setClothes(11, clothes.tops.drawable, clothes.tops.texture, clothes.tops.palette);

        // Notificări
        player.call('AnuntNotification', ['Acum esti Admin OFFDUTY', 'danger']);

        stopAdminTagInterval(player);
        player.call('client:admin:tag:destroy', [player.id]);
    }
});

function AdminTag_Timer(player: PlayerMp) {
    if (!player || !player.admin_duty) return;

    const adminLevel = player.getVariable('adminLvl') || 1;
    mp.players.forEachInRange(player.position, 20, (target) => {
        if (!target || target === player) return;
        target.call('client:admin:tag', [player.id, 'STAFF', adminLevel]);
    });
}

function startAdminTagInterval(player: PlayerMp) {
    if (adminTagIntervals.has(player.id)) return;

    const interval = setInterval(() => {
        AdminTag_Timer(player);
    }, 1000);

    adminTagIntervals.set(player.id, interval);
}

function stopAdminTagInterval(player: PlayerMp) {
    const interval = adminTagIntervals.get(player.id);
    if (interval) {
        clearInterval(interval);
        adminTagIntervals.delete(player.id);
    }

    mp.players.forEachInRange(player.position, 20, (target) => {
        target.call('client:admin:tag:destroy', [player.id]);
    });
}

mp.events.add('playerQuit', (player) => {
    stopAdminTagInterval(player);
});

mp.events.addCommand('admini', (player) => {
    const adminiOnline: string[] = [];

    mp.players.forEach((p) => {
        const adminLvl = p.getVariable('adminLvl');
        const onDuty = p.getVariable('adminTag');
        if (adminLvl && adminLvl > 0 && onDuty) {
            adminiOnline.push(p.name);
        }
    });

    if (adminiOnline.length === 0) {
        player.call('AnuntNotification', ['Nu exista administratori ON DUTY in acest moment.', 'danger']);
    } else {
        const lista = adminiOnline.join(' | ');
        player.outputChatBox(`!{e90000}ADMINI ONLINE: !{ffffff}${lista}`);
    }
});
