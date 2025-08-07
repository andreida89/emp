export default {
	send(player: Player, type: string = 'info', message: string) {
		player.call('AnuntNotification', [message, type]);
	}
};
