let animations = {
    active: false,
    lastAnim: null,

    play: function (animName, isRemote = false, player = null) {
        let animDict, animClip, animFlag = 49;

        switch (animName.toLowerCase()) {
            case "explica1":
                animDict = "special_ped@pamela@monologue_12@monologue_12d";
                animClip = "pamela_ig_1_p12_nowonderthisplaceis_3";
                break;
            
            case "sprijinit1":
                animDict = "missfam3";
                animClip = "argument_outro_coach";
                break;

            case "drunk1":
                animDict = "missarmenian2";
                animClip = "standing_idle_loop_drunk";
                break;

            case "drunk2":
                animDict = "amb@world_human_stupor@male_looking_left@idle_a";
                animClip = "idle_a";
                break;

            case "drunk3":
                animDict = "random@drunk_driver_1";
                animClip = "drunk_argument_dd1";
                break;

            case "walkhorror1":
                animDict = "amb@world_human_bum_standing@drunk@idle_a";
                animClip = "idle_a";
                break;

            case "vomita":
                    animDict = "missheistpaletoscore1leadinout";
                    animClip = "trv_puking_leadout";
                    break;

            case "whistle":
                    animDict = "rcmnigel1c";
                    animClip = "hailing_whistle_waive_a";
                    break;
                    
            case "k":
                this.kneelSequence(isRemote, player);
                return; // Don't proceed further since we're running multiple animations
            default:
                if (!isRemote) mp.gui.chat.push(`!{ff0000}Animatie inexistenta!`);
                return;
        }

        mp.game.streaming.requestAnimDict(animDict);
        while (!mp.game.streaming.hasAnimDictLoaded(animDict)) {
            mp.game.wait(0);
        }

        if (isRemote) {
            if (player) {
                player.taskPlayAnim(animDict, animClip, 8.0, 0, -1, animFlag, 0, false, false, false);
            }
        } else {
            mp.players.local.taskPlayAnim(animDict, animClip, 8.0, 0, -1, animFlag, 0, false, false, false);
            this.active = true;
            this.lastAnim = { dict: animDict, clip: animClip };

            // Tell the server to sync the animation with other players
            mp.events.callRemote("animation.sync", animName, true);
        }
    },

    kneelSequence: function (isRemote, player) {
        let target = isRemote ? player : mp.players.local;
        if (!target) return;

        if (this.active) {
            // If already kneeling, stand up
            target.taskPlayAnim("random@arrests", "kneeling_arrest_get_up", 8.0, 1.0, -1, 2, 0, false, false, false);
            this.active = false;
            this.lastAnim = null;
            if (!isRemote) mp.events.callRemote("animation.sync", "kneeling_arrest_get_up", false);
        } else {
            // Kneel down with hands on head
            mp.game.streaming.requestAnimDict("random@arrests");
            mp.game.streaming.requestAnimDict("random@arrests@busted");
            while (!mp.game.streaming.hasAnimDictLoaded("random@arrests") || !mp.game.streaming.hasAnimDictLoaded("random@arrests@busted")) {
                mp.game.wait(0);
            }

            target.taskPlayAnim("random@arrests", "idle_2_hands_up", 8.0, 1.0, -1, 2, 0, false, false, false);
            mp.game.wait(3000); // Wait 3 seconds before going to kneel position

            target.taskPlayAnim("random@arrests", "kneeling_arrest_idle", 8.0, 1.0, -1, 2, 0, false, false, false);
            mp.game.wait(1000); // Wait 1 second

            target.taskPlayAnim("random@arrests@busted", "enter", 8.0, 1.0, -1, 2, 0, false, false, false);
            mp.game.wait(1000);

            target.taskPlayAnim("random@arrests@busted", "idle_a", 8.0, 1.0, -1, 9, 0, false, false, false);

            this.active = true;
            this.lastAnim = { dict: "random@arrests@busted", clip: "idle_a" };

            if (!isRemote) mp.events.callRemote("animation.sync", "kneeling_arrest_idle", true);
        }
    },

    stop: function (isRemote = false, player = null) {
        if (isRemote) {
            if (player) player.clearTasksImmediately();
        } else {
            if (this.active) {
                mp.players.local.clearTasksImmediately();
                this.active = false;
                this.lastAnim = null;

                // Tell the server to stop the animation for others
                mp.events.callRemote("animation.sync", null, false);
            }
        }
    }
};

// Bind chat command
mp.events.add("animation.play", (animName) => {
    animations.play(animName);
});

mp.events.add("animation.stop", () => {
    animations.stop();
});

// Sync animations for other players
mp.events.add("animation.sync", (playerId, animName, isActive) => {
    let player = mp.players.atRemoteId(playerId);
    if (player) {
        if (isActive && animName) {
            animations.play(animName, true, player);
        } else {
            animations.stop(true, player);
        }
    }
});
