class AdminTagManager {
    public static floatingTexts: Map<number, { text: string, time: number, adminlvl: number }> = new Map();

    static PushAdminTag(playerId: number, text: string, adminlvl: number) {
        this.floatingTexts.set(playerId, { text, time: Date.now(), adminlvl });
    }

    static RemoveAdminTag(playerId: number) {
        this.floatingTexts.delete(playerId);
    }

    static GetAdminColor(adminLevel: number): [number, number, number, number] {
const colors = new Map<number, [number, number, number, number]>([
    [1, [5, 255, 0, 255]],     // Helper in Teste - Verde foarte deschis
    [2, [5, 255, 0, 255]],     // Helper Avansat - Verde deschis (aceeași culoare ca la 2)
    [3, [0, 150, 255, 255]],   // Moderator - Albastru deschis
    [4, [0, 150, 255, 255]],     // Moderator Avansat - Albastru deschis (observă că are culoare diferită, așa scrie comentariul)
    [5, [0, 255, 238, 255]],   // Administrator - Albastru mai inchis
    [6, [0, 234, 147, 255]],   // Manager Comunitate - Mov deschis
    [7, [255, 255, 0, 255]],   // Co-fondator - Galben (corectat de la roșu la galben)
    [8, [255, 0, 0, 255]]     // Fondator - Rosu
]);


        return colors.get(adminLevel) || [255, 255, 255, 255];
    }

    static Render() {
        this.floatingTexts.forEach((data, playerId) => {
            const player = mp.players.atRemoteId(playerId);
            if (!player || !player.handle) return;

            const localPlayer = mp.players.local;
            const distance = mp.game.system.vdist(
                localPlayer.position.x, localPlayer.position.y, localPlayer.position.z,
                player.position.x, player.position.y, player.position.z
            );

            if (distance > 20) return;

const scale = 0.25; // valoare fixă, mai mică decât înainte (0.3+)
const { x, y, z } = player.getBoneCoords(12844, 0.5, 0, 0);

mp.game.graphics.drawText(data.text, [x, y, z], {
    font: 0,
    color: AdminTagManager.GetAdminColor(data.adminlvl),
    scale: [scale, scale],
    outline: true
});

        });
    }
}

mp.events.add('client:admin:tag', (playerId: number, text: string, adminlvl: number) => {
    AdminTagManager.PushAdminTag(playerId, text, adminlvl);
});

mp.events.add('client:admin:tag:destroy', (playerId: number) => {
    AdminTagManager.RemoveAdminTag(playerId);
});

mp.events.add('render', () => {
    AdminTagManager.Render();
});

export { AdminTagManager };
