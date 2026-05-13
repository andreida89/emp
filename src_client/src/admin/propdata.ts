class PropData {
    private active: boolean = false;

    constructor() {
        this.subscribeToEvents();
    }

    private toggle(state: boolean) {
        this.active = state;
        mp.game.graphics.notify(`PropData: ${this.active ? '~g~ON' : '~r~OFF'}`);
    }

    private render() {
        if (!this.active) return;

        const playerPos = mp.players.local.position;
        const radius = 5.0;

        // Script objects
        mp.objects.forEachInStreamRange((object) => {
            const pos = object.position;
            const dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, pos.x, pos.y, pos.z);
            
            if (dist <= radius) {
                this.drawInfo(object.handle, pos);
            }
        });
        
        // Aiming at object (to include map objects)
        const handle = mp.game.player.getEntityIsFreeAimingAt();
        if (handle && mp.game.entity.doesExist(handle) && mp.game.entity.getType(handle) === 3) {
            const pos = mp.game.entity.getCoords(handle, true);
            const dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, pos.x, pos.y, pos.z);
            if (dist <= 15) {
                 this.drawInfo(handle, pos);
            }
        }
    }

    private drawInfo(handle: number, pos: Vector3Mp) {
        const model = mp.game.entity.getModel(handle);
        const rotation = mp.game.entity.getRotation(handle, 2);
        
        const text = `Hash: ${model}\nPos: ${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}\nRot: ${rotation.x.toFixed(3)}, ${rotation.y.toFixed(3)}, ${rotation.z.toFixed(3)}`;
        
        const screenPos = mp.game.graphics.world3dToScreen2d(pos);
        if (screenPos) {
            mp.game.graphics.drawText(text, [screenPos.x, screenPos.y], {
                font: 0,
                color: [255, 255, 255, 255],
                scale: [0.35, 0.35],
                outline: true,
                centre: true
            });
        }
    }

    private subscribeToEvents() {
        mp.events.add('client:PropData:Toggle', (state: boolean) => this.toggle(state));
        mp.events.subscribeToDefault({ render: this.render.bind(this) });
    }
}

new PropData();
