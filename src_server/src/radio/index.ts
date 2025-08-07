type RadioPlayer = PlayerMp & { radioChannel?: number };

class RadioSystem {
	private channels: Map<number, Set<number>> = new Map();

	constructor() {
		mp.events.add('radio:join', this.joinChannel.bind(this));
		mp.events.add('radio:leave', this.leaveChannel.bind(this));
	}

	private joinChannel(player: RadioPlayer, channel: number) {
		player.radioChannel = channel;

		if (!this.channels.has(channel)) this.channels.set(channel, new Set());
		this.channels.get(channel)!.add(player.id);

		console.log(`[RADIO] ${player.name} joined channel ${channel}`);
	}

	private leaveChannel(player: RadioPlayer) {
		const channel = player.radioChannel;
		if (channel === undefined) return;

		const players = this.channels.get(channel);
		if (players) players.delete(player.id);

		player.radioChannel = undefined;
		console.log(`[RADIO] ${player.name} left channel ${channel}`);
	}

	getChannelPlayers(channel: number): PlayerMp[] {
		const ids = this.channels.get(channel);
		if (!ids) return [];

		return Array.from(ids)
			.map((id) => mp.players.at(id))
			.filter((p): p is PlayerMp => !!p);
	}
}

export default new RadioSystem();