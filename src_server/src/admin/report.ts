import moment from 'moment';
import CharModel from 'models/Character';
import ReportModel from 'models/Report';
import TicketModel from 'models/Ticket';
import hud from 'helpers/hud';
import permissions from './permissions';
import Teleport from './teleport'; // Import your teleport class
import UserModel from 'models/User';

class Report {
	constructor() {
		mp.events.subscribe({
			'Admin-SendReport': this.create.bind(this),
			'Admin-AcceptReport': this.accept.bind(this),
			'Admin-GetReports': this.getReports.bind(this),
			'Admin-GetReportCount': this.getReportCount.bind(this)
		});
	}

	async create(player: Player, message: string) {
		const isReported = await this.isReported(player.dbId);
		if (isReported) return;

		await ReportModel.create({ sender: player?.dbId, message });
		this.notifyAdmins(message);
	}

	notifyAdmins(message: string) {
		mp.players
			.toCustomArray()
			.forEach(
				(player) => (player.adminLvl && player.admin_duty) && hud.showNotification(player, 'info', message, true)
			);
	}


	private async accept(player: Player, reportId: string) {
		//console.log(`[REPORT] Admin ${player.dbId} is attempting to accept report ID: ${reportId}`);
	
		if (!permissions.hasPermission(player, 'helperinteste', true)) {
		//console.log(`[REPORT] Access denied for ${player.dbId}`);
			throw new SilentError('access denied');
		}
	
		// Fetch the report from MongoDB
		const report = await ReportModel.findOneAndUpdate(
			{ _id: reportId, admin: { $exists: false } },
			{ $set: { admin: player.dbId } }
		);
	
		if (!report) {
			//console.log(`[REPORT] Report ${reportId} already accepted or doesn't exist`);
			throw new SilentError('report already accepted');
		}
	
		//console.log(`[REPORT] Report sender ID from database: ${report.sender}`);
	
		try {
			// Fetch the user where `character` matches `report.sender`
			const user = await UserModel.findOne({ character: report.sender });
	
			if (!user) {
				console.log(`[REPORT] No user found for character ID ${report.sender}`);
				throw new SilentError('user not found');
			}
	
			//console.log(`[REPORT] Found user with character ID: ${user.character}`);
	
			// Find the online player whose `dbId` matches `character`
			const sender = mp.players.toCustomArray().find((p) => String(p.dbId) === String(user.character));
	
			if (!sender) {
				//console.log(`[REPORT] Player with character ID ${user.character} is not online.`);
				throw new SilentError('player not found');
			}
	
			//console.log(`[REPORT] Teleporting admin ${player.name} to player ${sender.name} (ID: ${sender.mp.id})`);
	
			// Teleport the admin to the player who made the report
			Teleport.toPlayer(player, sender.mp.id);
	
			// Confirm teleportation
			//console.log(`[REPORT] Teleportation successful for ${player.name}`);
	
			// Notify the admin
			hud.showNotification(player, 'info', `Te-ai teleportat la ${sender.mp.name}`);
			hud.showNotification(sender, 'info', `Cererea ti-a fost acceptata`);

			return true;
		} catch (error) {
			//console.error(`[REPORT] Error while fetching user data:`, error);
			throw new SilentError('Database query failed');
		}
	}
	
	
	

	private async isReported(sender: string) {
		const count = await ReportModel.findOne({
			sender,
			timestamp: {
				$gt: moment().subtract(10, 'minutes').toISOString()
			}
		}).countDocuments();

		return count > 1;
	}

	private async getReports(player: Player, page: number) {
		const data = await ReportModel.find({ admin: { $exists: false } })
			.skip(page * 20)
			.limit(20)
			.sort({ _id: -1 })
			.populate({
				path: 'sender',
				select: 'firstName lastName'
			})
			.lean();

		return data.map((item) => {
			const { sender } = item as typeof item & { sender: CharModel };

			return {
				...item,
				sender: sender ? `${sender.firstName} ${sender.lastName}` : 'Deleted'
			};
		});
	}

	private async getReportCount(player: Player) {
		if (!permissions.hasPermission(player, 'helperinteste', true)) {
			return -1;
		}
	
		try {
			const reportCount = await ReportModel.countDocuments({ admin: { $exists: false } });
			const ticketCount = await TicketModel.countDocuments();
			return reportCount + ticketCount;
		} catch (err) {
			console.error('[Admin-GetReportCount]', err);
			return -1;
		}
	}
}

export default new Report();
