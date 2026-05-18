import { random } from 'lodash';
import animations from 'helpers/animations';
import attachments from 'helpers/attachments';
import JobLevels from 'jobs/levels';
import playerInventory from 'player/inventory';
import inventoryHelper from 'basic/inventory/helper';
import Service from '../service';
import { locations, levels } from './data';
import { prices } from './sale';

// Mapping pentru tipul de momeală per level
const BAIT_PER_LEVEL: Record<number, string> = {
    1: 'rame',
    2: 'oblete',
    3: 'clean'
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
            return player.mp.call('AnuntNotification2', ['Pescuiesti deja', 'rosu']);
        }

        const location = this.getCurrentLocation(player);
        const jobLevel = this.getCurrentLevel(player);

        if (location.level > jobLevel) {
            return player.mp.call(
                'AnuntNotification2',
                [`Pentru acest loc este necesar nivelul ${location.level}`, 'rosu']
            );
        }

        const rod = inventoryHelper.findItem(player.inventory, 'rod');

        if (!rod) {
            return player.mp.call('AnuntNotification2', ['Nu aveti undita', 'rosu']);
        }

        // --- Momeala pe level ---
        const baitName = BAIT_PER_LEVEL[jobLevel];

        if (!baitName) {
            return player.mp.call(
                'AnuntNotification2',
                ['Nu exista momeala pentru acest nivel!', 'rosu']
            );
        }

        const bait = inventoryHelper.findItem(player.inventory, baitName);

        if (!bait) {
            return player.mp.call(
                'AnuntNotification2',
                [`Nu ai momeala necesara: ${baitName}`, 'rosu']
            );
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

    private async startFishing(
        player: Player,
        rod: InventoryItem,
        bait: InventoryItem
    ) {
        await this.useTools(player, rod, bait);

        const waitTime = (Math.floor(random() * 10) + 25) * 1000;

        mp.players.withTimeout(
            player.mp,
            () => this.showMinigame(player),
            waitTime
        );
    }

    private showMinigame(player: Player) {
        if (!this.isAlreadyFishing(player)) return;

        const location = this.getCurrentLocation(player);
        const fish = this.getRandomFishByLevel(location.level);

        const itemData = inventoryHelper.getItemData(fish);
        const displayName = itemData.displayName || itemData.name || fish;
        const price = prices[fish] || 0;

        animations.playOnServer(player.mp, 'fishing_take');

        player.callEvent(
            'Fishing-ShowMinigame',
            [JSON.stringify({ name: displayName, price, id: fish })]
        );
    }

    private stopFishing(player: Player) {
        animations.stopOnServer(player.mp);
        attachments.remove(player.mp, 'rod');
    }

    private async useTools(
        player: Player,
        rod: InventoryItem,
        bait: InventoryItem
    ) {
        await inventoryHelper.changeItemAmount(
            player.inventory,
            bait,
            -1
        );

        if (!rod.data) {
            rod.data = {
                capacity: inventoryHelper.getItemData('rod').capacity
            };
        }

        rod.data.capacity -= 1;

        const { capacity: rodCapacity } = rod.data;

        if (rodCapacity <= 0) {
            await inventoryHelper.removeItem(player.inventory, rod);
        } else if (rodCapacity <= 3) {
            player.mp.call(
                'AnuntNotification2',
                [`Mai poti pescui de ${rodCapacity} ori cu aceasta undita`, 'verde']
            );
        }

        animations.playOnServer(player.mp, 'fishing_wait');
        attachments.add(player.mp, 'rod');
    }

    private async takeFish(player: Player, fishDataStr: string) {
        const location = this.getCurrentLocation(player);

        if (!location || !this.isAlreadyFishing(player)) return;

        let fish = '';

        try {
            const data = JSON.parse(fishDataStr);
            fish = data.id;
        } catch (e) {
            return this.stopFishing(player);
        }

        const itemData = inventoryHelper.getItemData(fish);
        const fishName = itemData.displayName || itemData.name || fish;

        await playerInventory.addItem(player, {
            name: fish,
            amount: 1
        });

        await this.levels.addSkill(player);

        const points = this.levels.getSkillPoints(player);
        const level = this.getCurrentLevel(player);

        player.mp.call(
            'AnuntNotification2',
            [
                `Ati prins pestele "${fishName}". Nivel curent: ${level}. Total prins: ${points}`,
                'verde'
            ]
        );

        this.stopFishing(player);
    }

    private getRandomFishByLevel(level: number): string {
        const randomValue = random();

        const items = Object.entries(levels[level - 1].fish).filter(
            ([, chance]) => chance / 100 > randomValue
        );

        if (!items.length) {
            return this.getRandomFishByLevel(level);
        }

        const fish = items[random(0, items.length - 1)];

        return fish[0];
    }
}

const job = new Fishing();

export default job;