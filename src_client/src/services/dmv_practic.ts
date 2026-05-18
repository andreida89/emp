import rpc from 'utils/rpc';
import browser from 'helpers/browser';

const CHECKPOINTS = [
    { x: -752.57, y: -1297.03, z: 5.00 },
    { x: -703.95, y: -1246.49, z: 10.31 },
    { x: -648.11, y: -1298.42, z: 10.67 },
    { x: -532.81, y: -1107.89, z: 22.24 },
    { x: -533.99, y: -981.87, z: 23.28 },
    { x: -492.18, y: -860.25, z: 30.29 },
    { x: -304.94, y: -864.85, z: 31.70 },
    { x: -62.18, y: -944.36, z: 29.42 },
    { x: 77.03, y: -994.94, z: 29.41 },
    { x: 381.72, y: -1060.18, z: 29.20 },
    { x: 485.26, y: -1134.33, z: 29.41 },
    { x: 532.55, y: -1410.15, z: 29.25 },
    { x: 603.09, y: -1634.78, z: 25.06 },
    { x: 525.65, y: -1890.70, z: 25.40 },
    { x: 411.80, y: -1944.97, z: 24.23 },
    { x: 301.33, y: -1870.98, z: 26.97 },
    { x: 136.25, y: -2019.33, z: 18.25 },
    { x: -136.21, y: -2081.85, z: 25.84 },
    { x: -240.16, y: -1845.26, z: 29.14 },
    { x: -361.85, y: -1815.50, z: 22.65 },
    { x: -269.91, y: -1455.10, z: 31.32 },
    { x: -438.08, y: -1417.30, z: 29.32 },
    { x: -518.90, y: -1131.96, z: 20.67 },
    { x: -621.47, y: -1262.08, z: 11.18 },
    { x: -705.56, y: -1285.87, z: 5.00 }
];

class DMVPractic {
    private currentCheckpoint = 0;
    private blip: BlipMp | null = null;
    private marker: MarkerMp | null = null;
    private colshape: ColshapeMp | null = null;
    private inExam = false;
    private accidents = 0;
    private speedViolations = 0;
    private startTime = 0;
    private lastTotalHealth = 2000;
    private checkInterval: any = null;

    constructor() {
        rpc.register('DMV-StartPracticalExam', this.startExam.bind(this));
        
        mp.events.add('playerEnterColshape', (colshape) => {
            if (this.inExam && colshape === this.colshape) {
                this.nextCheckpoint();
            }
        });
    }

    private async startExam() {
        this.currentCheckpoint = 0;
        this.accidents = 0;
        this.speedViolations = 0;
        this.startTime = Date.now();
        this.inExam = true;
        this.lastTotalHealth = 2000;

        await this.showDialog("Esti pregatit?", "Hai sa incepem proba practica! Respecta regulile de circulatie, nu depasi 80 km/h si ai grija la accidente. Mult succes!", ["SA INCEPEM!"]);
        
        browser.hidePage();
        this.createCheckpoint();
        this.startChecking();
    }

    private startChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.checkInterval = setInterval(() => {
            if (!this.inExam) return;

            const vehicle = mp.players.local.vehicle;
            if (!vehicle) {
                this.fail("Ai parasit vehiculul de examen!");
                return;
            }

            // Check Speed
            const speedKmH = vehicle.getSpeed() * 3.6;
            if (speedKmH > 80) {
                this.speedViolations++;
                if (this.speedViolations >= 3) {
                    this.fail("Ai depasit viteza legala (80 km/h) de 3 ori!");
                    return;
                } else {
                    mp.gui.chat.push('Ai depasit viteza legala! (' + this.speedViolations + '/3)');
                }
            }

            // Check Accidents
            const engineHealth = vehicle.getEngineHealth();
            const bodyHealth = vehicle.getBodyHealth();
            const currentTotalHealth = engineHealth + bodyHealth;

            if (currentTotalHealth < this.lastTotalHealth - 15) { // Threshold: 15 units
                if (engineHealth < 700 || bodyHealth < 700) {
                    this.fail("Ai avut un accident major!");
                    return;
                }
                this.accidents++;
                if (this.accidents >= 3) {
                    this.fail("Ai avut prea multe accidente usoare!");
                    return;
                } else {
                    mp.gui.chat.push('Ai avut un accident! (' + this.accidents + '/3)');
                }
            }
            this.lastTotalHealth = currentTotalHealth;

            // Check Time (6 min = 360000 ms)
            if (Date.now() - this.startTime > 360000) {
                this.fail("Timpul a expirat!");
            }
        }, 1000);
    }

    private createCheckpoint() {
        if (this.blip && mp.blips.exists(this.blip)) this.blip.destroy();
        if (this.marker && mp.markers.exists(this.marker)) this.marker.destroy();
        if (this.colshape && mp.colshapes.exists(this.colshape)) this.colshape.destroy();

        const pos = CHECKPOINTS[this.currentCheckpoint];
        const vector = new mp.Vector3(pos.x, pos.y, pos.z);
        const dimension = mp.players.local.dimension;

        this.blip = mp.blips.new(1, vector, {
            name: 'Punct de control',
            color: 5, // Yellow
            scale: 1.0,
            shortRange: false,
            dimension: dimension
        });
        
        if (this.blip && mp.blips.exists(this.blip)) {
            this.blip.setRoute(true);
            this.blip.setRouteColour(5);
        }

        this.marker = mp.markers.new(1, new mp.Vector3(pos.x, pos.y, pos.z - 1.1), 4.0, {
            color: [255, 204, 0, 150],
            visible: true,
            dimension: dimension
        });

        this.colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 5.0, dimension);
    }

    private nextCheckpoint() {
        this.currentCheckpoint++;
        if (this.currentCheckpoint >= CHECKPOINTS.length) {
            this.finish(true);
        } else {
            mp.game.audio.playSoundFrontend(-1, "CHECKPOINT_NORMAL", "HUD_MINI_GAME_SOUNDSET", true);
            this.createCheckpoint();
            mp.gui.chat.push(`Mergi la urmatorul punct de control (${this.currentCheckpoint + 1}/${CHECKPOINTS.length})`);
        }
    }

    private fail(reason: string) {
        this.showDialog("EXAMEN PICAT", reason, ["INCHIDE"]);
        this.finish(false);
    }

    private async finish(passed: boolean) {
        this.inExam = false;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.blip) this.blip.destroy();
        if (this.marker) this.marker.destroy();
        if (this.colshape) this.colshape.destroy();
        this.blip = null;
        this.marker = null;
        this.colshape = null;

        if (passed) {
            await this.showDialog("FELICITARI!", "Ai trecut cu succes proba practica! Acum ai permis de conducere categoria B.", ["MINUNAT!"]);
        }

        mp.events.callServer('DMV-FinishPracticalExam', passed);
    }

    private showDialog(title: string, text: string, buttons: string[]): Promise<void> {
        return new Promise((resolve) => {
            // Remove cursor for DMV dialog as per user request
            // mp.gui.cursor.show(true, true); 
            browser.browser.execute(`window.DmvDialog('${title}', '${text}', ${JSON.stringify(buttons)})`);
            
            const handler = (index: number) => {
                rpc.unregister('DmvDialog-Selected');
                mp.gui.cursor.show(false, false);
                mp.gui.cursor.visible = false;
                resolve();
            };
            rpc.register('DmvDialog-Selected', handler);
        });
    }
}

export default new DMVPractic();
