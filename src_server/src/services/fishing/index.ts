import { random } from 'lodash';
import animations from 'helpers/animations';
import attachments from 'helpers/attachments';
import hud from 'helpers/hud';
import JobLevels from 'jobs/levels';
import playerInventory from 'player/inventory';
import inventoryHelper from 'basic/inventory/helper';
import Service from '../service';
import { locations, levels } from './data';
import './sale';

// Mapping pentru tipul de momeală per level
const BAIT_PER_LEVEL: Record<number, string> = {
    1: 'rame',    // Level 1
    2: 'oblete',  // Level 2
    3: 'clean'    // Level 3
    // Adaugă aici dacă vei avea și level 4 etc.
};

class Fishing extends Service {
    private levels: JobLevels;

    constructor() {
        super('fishing', { name: 'Pescuit', model: 68, color: 30 });

        this.levels = new JobLevels(
            this.name,
            levels.map(({ points }) => points)
        );
        this.load(locations);
    }

    protected subscribeToEvents() {
        mp.events.subscribe({
            'Fishing-Success': this.takeFish.bind(this),
            'Fishing-Drop': this.stopFishing.bind(this)
        });
    }

    protected onExitShape(player: Player) {
        if (this.isAlreadyFishing(player)) {
            this.stopFishing(player);
            player.callEvent('Fishing-HideMinigame');
        }
    }

    async onKeyPress(player: Player) {
        const canStart: boolean = await player.callEvent('Phone-CanOpen');
        if (this.isAlreadyFishing(player)) {
            return hud.showNotification(player, 'error', 'Pescuiesti deja');
        }

        const location = this.getCurrentLocation(player);
        const jobLevel = this.getCurrentLevel(player);

        if (location.level > jobLevel) {
            return hud.showNotification(
                player,
                'error',
                `Pentru acest loc este necesar nivelul ${location.level}`
            );
        }

        const rod = inventoryHelper.findItem(player.inventory, 'rod');
        if (!rod) return hud.showNotification(player, 'error', 'Nu aveti undita');

        // --- Momeala pe level ---
        const baitName = BAIT_PER_LEVEL[jobLevel];
        if (!baitName) {
            return hud.showNotification(player, 'error', 'Nu exista momeala pentru acest nivel!');
        }
        const bait = inventoryHelper.findItem(player.inventory, baitName);
        if (!bait) {
            return hud.showNotification(player, 'error', `Nu ai momeala necesara: ${baitName}`);
        }
        // ------------------------

        await this.startFishing(player, rod, bait);
    }

    private isAlreadyFishing(player: Player) {
        return attachments.has(player.mp, 'rod');
    }

    private getCurrentLocation(player: Player) {
        const index: number = mp.colshapes.getData(player.mp);
        return locations[index];
    }

    private getCurrentLevel(player: Player) {
        return this.levels.getCurrentLevel(player) + 1;
    }

    private async startFishing(player: Player, rod: InventoryItem, bait: InventoryItem) {
        await this.useTools(player, rod, bait);

        const waitTime = (Math.floor(random() * 10) + 25) * 1000;
        mp.players.withTimeout(player.mp, () => this.showMinigame(player), waitTime);
    }

    private showMinigame(player: Player) {
        if (!this.isAlreadyFishing(player)) return;

        animations.playOnServer(player.mp, 'fishing_take');
        player.callEvent('Fishing-ShowMinigame');
    }

    private stopFishing(player: Player) {
        animations.stopOnServer(player.mp);
        attachments.remove(player.mp, 'rod');
    }

    private async useTools(player: Player, rod: InventoryItem, bait: InventoryItem) {
        await inventoryHelper.changeItemAmount(player.inventory, bait, -1);
        if (!rod.data) rod.data = { capacity: inventoryHelper.getItemData('rod').capacity };

        rod.data.capacity -= 1;
        const { capacity: rodCapacity } = rod.data;

        if (rodCapacity <= 0) await inventoryHelper.removeItem(player.inventory, rod);
        else if (rodCapacity <= 3) {
            hud.showNotification(
                player,
                'info',
                `Mai poti pescui de ${rodCapacity} ori cu aceasta undita`
            );
        }

        animations.playOnServer(player.mp, 'fishing_wait');
        attachments.add(player.mp, 'rod');
    }

    private async takeFish(player: Player) {
        const location = this.getCurrentLocation(player);
        if (!location || !this.isAlreadyFishing(player)) return;

        const fish = this.getRandomFishByLevel(location.level);
        const { name: fishName } = inventoryHelper.getItemData(fish);

        await playerInventory.addItem(player, { name: fish, amount: 1 });
        await this.levels.addSkill(player);

        const points = this.levels.getSkillPoints(player);
        const level = this.getCurrentLevel(player);
        hud.showNotification(
            player,
            'success',
            `Ati prins pestele "${fishName}". Nivel curent: ${level}. Total prins: ${points}`
        );

        this.stopFishing(player);
    }

    private getRandomFishByLevel(level: number): string {
        const randomValue = random();
        const items = Object.entries(levels[level - 1].fish).filter(
            ([, chance]) => chance / 100 > randomValue
        );
        if (!items.length) return this.getRandomFishByLevel(level);

        const fish = items[random(0, items.length - 1)];
        return fish[0];
    }
}

const job = new Fishing();
export default job;
