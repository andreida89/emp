import businessCtrl from '../business/entities';
import permissions from './permissions';
import journal from './journal';
import CharacterModel from '../models/Character';

class AdminBusiness {
	constructor() {
		/*  mp.events.subscribeToDefault({
			'Admin-CreateBiz': this.createBiz.bind(this),
			'Admin-DeleteBiz': this.destroyBiz.bind(this),
			'Admin-CreateBizPoint': this.createBizPoint.bind(this)
		}); */
	}

	private async createBiz(admin: Player, data: any) {
		if (!permissions.hasPermission(admin, 'cofondator')) {
			return admin.mp.notify('~r~Nu ai permisiunea de cofondator!');
		}

		try {
			const customId = parseInt(data.extraId); // ID Afacere
			const price = parseInt(data.price);
			const income = 1000; 
			const profitPercent = parseInt(data.profitPercent) || 0;
			
			let ownerId = null;
			if (data.id && data.id.trim().length > 0) {
				const char = await CharacterModel.findOne({ uid: parseInt(data.id) });
				if (char) {
					ownerId = char._id.toString();
				} else {
					return admin.mp.notify('~r~Proprietarul (UID) nu a fost gasit.');
				}
			}

			if (isNaN(customId)) {
				return admin.mp.notify('~r~ID Afacere invalid.');
			}
			if (isNaN(price)) {
				return admin.mp.notify('~r~Pret afacere invalid.');
			}

			const biz = await businessCtrl.create(admin, data.name, data.bizType, price, income, ownerId, profitPercent, customId);
			if (biz) {
				journal.recordAction(admin, 'biz_add', biz.id);
				admin.mp.notify(`~g~Afacerea ~y~${data.name} (${data.bizType}) ~g~a fost creata cu succes!`);
			} else {
				admin.mp.notify('~r~Eroare la crearea afacerii (controller).');
			}
		} catch (error: any) {
			console.error('Error creating biz:', error);
			admin.mp.notify(`~r~Eroare: ${error.message}`);
		}
	}

	private async destroyBiz(admin: Player, index: number) {
		if (!permissions.hasPermission(admin, 'cofondator')) {
			return admin.mp.notify('~r~Nu ai permisiunea de cofondator!');
		}

		try {
			await businessCtrl.delete(index);
			journal.recordAction(admin, 'biz_delete', index.toString());
			admin.mp.notify(`~g~Afacerea cu index ~y~${index} ~g~a fost stearsa.`);
		} catch (error: any) {
			admin.mp.notify(`~r~Eroare la stergere: ${error.message}`);
		}
	}

	private async createBizPoint(admin: Player, data: any) {
		if (!permissions.hasPermission(admin, 'cofondator')) {
			return admin.mp.notify('~r~Nu ai permisiunea de cofondator!');
		}

		// Find nearest business to admin
		let nearestBiz = null;
		let minDist = 50.0; // Start with 50m for gas stations

		businessCtrl.items.forEach(biz => {
			if (!biz) return;
			const dist = admin.mp.position.dist(new mp.Vector3(biz.position.x, biz.position.y, biz.position.z));
			
			// If it's a gas station or auto service, we accept up to 50m. 
			// If not, we only accept if it's within 10m.
			if (biz.type === 'Benzinarie' || biz.type === 'gas' || biz.type === 'Service auto' || biz.type === 'Service' || biz.type === 'lscustoms') {
				if (dist < minDist) {
					minDist = dist;
					nearestBiz = biz;
				}
			} else {
				if (dist < 10.0 && dist < minDist) {
					minDist = dist;
					nearestBiz = biz;
				}
			}
		});

		if (!nearestBiz) {
			return admin.mp.notify('~r~Nu esti langa nicio afacere (10m / 50m pt benzinarie/service)!');
		}

		const points = nearestBiz.interactionPoints || [];
		points.push({
			name: data.bizType,
			position: { x: admin.mp.position.x, y: admin.mp.position.y, z: admin.mp.position.z }
		});

		await businessCtrl.update(nearestBiz, { interactionPoints: points });
		admin.mp.notify(`~g~Punct de interactiune pentru ~y~${nearestBiz.name} ~g~adaugat la coordonatele tale.`);
	}
}

export default new AdminBusiness();
