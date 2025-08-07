mp.nametags.enabled = false;


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

mp.events.add('render', () => EyesManager.Render());

mp.keys.bind(0x2E, true, () => {
    mp.events.callRemote('server:eyes:getids');
});

export { EyesManager };
