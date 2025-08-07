class NoClip {
	constructor() {
		mp.events.add('Admin-NoClipToggle', this.toggle.bind(this));
	}

	private toggle(player: PlayerMp, enabled: boolean) {
		//console.log(`[ADMIN] ${player.name} NoClip: ${enabled ? "ENABLED" : "DISABLED"}`);

		// ✅ Corrected: Set variable directly on the player
		player.setVariable('NoClip', enabled);

		// ✅ Corrected: Use player instead of player.mp
		//player.setInvincible(enabled);
		//player.setCollision(!enabled, !enabled); // Disable collision when NoClip is enabled
	}
}

export default new NoClip();
