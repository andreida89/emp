mp.nametags.enabled = false;

class AdminNametagManager {
    static Render() {
        const localPlayer = mp.players.local;
        const adminLvl = localPlayer.getVariable('adminLvl') || 0;
        const isAdminOnDuty = (!!localPlayer.getVariable('adminTag') || !!localPlayer.getVariable('admin_duty')) && adminLvl > 0;

        if (!isAdminOnDuty) return;

        mp.players.forEachInStreamRange((player) => {
            if (!player.handle || player.handle === localPlayer.handle) return;

            const localPos = localPlayer.position;
            const playerPos = player.position;
            const distance = mp.game.system.vdist(
                localPos.x, localPos.y, localPos.z,
                playerPos.x, playerPos.y, playerPos.z
            );

            if (distance > 450) return;

            const screenPos = mp.game.graphics.world3dToScreen2d(playerPos.x, playerPos.y, playerPos.z + 1.2);
            if (!screenPos) return;

			const fixId = player.getVariable('fixId') || player.getVariable('uid') || player.remoteId;
			const isSpeaking = player.isVoiceActive;
			const playerName = player.name.replace('_', ' ');
			const distText = `${Math.floor(distance)}m`;

			const scale = Math.max(0.2, 0.4 - (distance * 0.001));
			
			const voicePart = isSpeaking ? "~r~[Vorbeste] " : "";
			const idPart = `~y~[${fixId}] `;
			const namePart = `~w~${playerName} | `;
			const distancePart = `~g~${distText}`;
			
			const colorFormattedText = `${voicePart}${idPart}${namePart}${distancePart}`;

			mp.game.graphics.drawText(colorFormattedText, [screenPos.x, screenPos.y], {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [scale, scale],
                outline: true,
                centre: true
            });
        });
    }
}

class EyesManager {
    public static floatingIds: Map<number, { text: string, time: number, duration: number }> = new Map();

    static UpdateText(fixId: number, playerId: number, duration: number) {
        const player = mp.players.atRemoteId(playerId);
        if (!player) return;

        const localPlayer = mp.players.local;
        if (player.id === localPlayer.id) return; 

        const text = `ID: ${fixId}`;

        this.floatingIds.set(playerId, { text, time: Date.now(), duration });

        setTimeout(() => {
            this.floatingIds.delete(playerId);
        }, duration);
    }

    static Render() {
        const localPlayer = mp.players.local;
        const currentTime = Date.now();

        this.floatingIds.forEach((data, playerId) => {
            const player = mp.players.atRemoteId(playerId);
            if (!player || !player.handle) return;

            if (currentTime - data.time >= data.duration) {
                this.floatingIds.delete(playerId);
                return;
            }

            const distance = mp.game.system.vdist(
                localPlayer.position.x, localPlayer.position.y, localPlayer.position.z,
                player.position.x, player.position.y, player.position.z
            );

            if (distance > 100) return;

            const scale = Math.max(0.2, 0.5 - (distance * 0.026));
            const { x, y, z } = player.getBoneCoords(12844, 0.6, 0, 0);

            mp.game.graphics.drawText(data.text, [x, y, z], {
                font: 0,
                color: [255, 0, 0, 255],
                scale: [scale, scale],
                outline: true
            });
        });
    }
}

mp.events.add("client:key:eyes", (fixId: number, playerId: number, duration: number) => {
    EyesManager.UpdateText(fixId, playerId, duration);
});

mp.events.add('render', () => {
    EyesManager.Render();
    AdminNametagManager.Render();
});

mp.keys.bind(0x2E, true, () => {
    mp.events.callRemote('server:eyes:getids');
});

export { EyesManager };
