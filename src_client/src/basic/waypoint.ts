class Waypoint {
    private position: Vector3Mp;

    constructor() {
        this.setDefaultState();
        mp.events.add('render', this.getCurrentCoords.bind(this));
        mp.events.add('client:syncWaypoint', this.create.bind(this));
    }

    get currentPosition() {
        return this.position;
    }

    isActive() {
        return mp.game.invoke('0x1DD1F58F493F1DA5') as boolean;
    }

    hasChanged(coords: Vector3Mp) {
        return (
            this.position.x !== coords.x ||
            this.position.y !== coords.y ||
            this.position.z !== coords.z
        );
    }

    create(x: number, y: number) {
        mp.game.ui.setNewWaypoint(x, y);
    }

    private setDefaultState() {
        this.position = new mp.Vector3(0, 0, 0);
    }

    private lastLog = 0;
    
    private getCurrentCoords() {
        if (!this.isActive()) return this.setDefaultState();
        if (!mp.players.local.vehicle) return;
        
        const blipIterator = mp.game.invoke('0x186E5D252FA50E7D');
        const firstInfoId = mp.game.invoke('0x1BEDE233E6CD2A1F', blipIterator);
        
        const now = Date.now();
        const shouldLog = now - this.lastLog > 2000;
        if (shouldLog) this.lastLog = now;

        let foundAny = false;

        for (
            let i = firstInfoId;
            mp.game.invoke('0xA6DB27D19ECBB7DA', i) !== 0;
            i = mp.game.invoke('0x14F96AA50D6FBEA7', blipIterator)
        ) {
            const sprite = mp.game.invoke('0xBE9B0959FFD0779B', i);
            
            //if (shouldLog) mp.console.logInfo(`[Waypoint] sprite: ${sprite}`);
            
            if (sprite === 4) {
                foundAny = true;
                const position = mp.game.ui.getBlipInfoIdCoord(i);
                
                // pozitia e invalida inca
                if (position.x === 0 && position.y === 0) return;
                
                if (this.hasChanged(position)) {
                    this.position = position;
                    this.triggerEvent();

                    //if (shouldLog) mp.console.logInfo(`[Waypoint] am trm in server`);
                }
            }
        }

        //if (shouldLog && !foundAny) mp.console.logInfo('[Waypoint] niciun blip cu sprite 4 gasit');
    }
    private triggerEvent() {
        mp.events.callServer('server:playerCreateWaypoint', { vehicle_id: mp.players.local.vehicle.remoteId, x: this.position.x, y: this.position.y, z: this.position.z });
    }
}

export default new Waypoint();