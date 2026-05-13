import UserModel from 'models/User';
import hud from 'helpers/hud';

export type PermissionLevel = 'helperinteste' | 'helper' | 'moderator' | 'moderatoravansat' | 'administrator' | 'manager' | 'cofondator' | 'fondator';

class Permissions {
	private list: { [name in PermissionLevel]: number };

	constructor() {
		this.list = {
			helperinteste: 1,
			helper: 2,
			moderator: 3,
			moderatoravansat: 4,
			administrator: 5,
			manager: 6,
			cofondator: 7,
			fondator: 8
		};
	}

	hasPermission(player: Player, level: PermissionLevel, silent = false) {
		if (player.adminLvl < this.list[level]) return false;

		const onDuty = player.admin_duty || (player.mp && player.mp.getVariable('admin_duty')) || (player.mp && (player.mp as any).admin_duty) || (player.mp && player.mp.getVariable('adminTag'));

		if (player.adminLvl > 0 && !onDuty) {
			if (!silent) hud.showNotification(player, 'error', 'Trebuie sa fii ON DUTY (/aduty)!', true);
			return false;
		}

		return true;
	}

	async giveAccess(player: Player, level: PermissionLevel) {
		await this.setPermission(player, level);
	}

	async withdrawAccess(player: Player) {
		await this.setPermission(player);
	}

	private async setPermission(player: Player, level?: PermissionLevel) {
		const index = this.list[level] || 0;

		await UserModel.findByIdAndUpdate(player.account, {
			$set: { adminLvl: index }
		});

		player.adminLvl = index;
	}
}

export default new Permissions();
