
let mansionBitfield: number = (1 << 3) | (1 << 4) | (1 << 5) | (1 << 8) | (1 << 9) | (1 << 10) | (1 << 11);

function sendBits(player: PlayerMp) {
    player.call("mansions:update", [mansionBitfield, 0]);
}

function pushState(player: PlayerMp, jsonObj: any) {
    player.call("mansions:setState", [JSON.stringify(jsonObj)]);
}

mp.events.add("playerReady", (player: PlayerMp) => {
    sendBits(player);
});

// Since the user wants them enabled by default and no commands, we just broadcast this at start
// In RAGE MP, when a player joins, they should receive the current state.
// If needed, we could also send it when it changes, but here it's static.

export default {
    getBitfield: () => mansionBitfield,
    sendBits,
    pushState
};
