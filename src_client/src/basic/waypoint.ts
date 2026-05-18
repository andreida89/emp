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
        
        const blipIterator = mp.game.invoke('0x186E5D252FA50E7D');
        const firstInfoId = mp.game.invoke('0x1BEDE233E6CD2A1F', blipIterator);
        
        const now = Date.now();
        const shouldLog = now - this.lastLog > 2000;
        if (shouldLog) this.lastLog = now;

        for (
            let i = firstInfoId;
            mp.game.invoke('0xA6DB27D19ECBB7DA', i) !== 0;
            i = mp.game.invoke('0x14F96AA50D6FBEA7', blipIterator)
        ) {
            const sprite = mp.game.invoke('0xBE9B0959FFD0779B', i);
            
            if (sprite === 4) {
                const position = mp.game.ui.getBlipInfoIdCoord(i);
                
                // pozitia e invalida inca
                if (position.x === 0 && position.y === 0) return;
                
                if (this.hasChanged(position)) {
                    this.position = position;
                    this.triggerEvent();
                }
            }
        }
    }
    private triggerEvent() {
        const vehicle = mp.players.local.vehicle;
        mp.events.callServer('server:playerCreateWaypoint', { 
            vehicle_id: vehicle ? vehicle.remoteId : null, 
            x: this.position.x, 
            y: this.position.y, 
            z: this.position.z 
        });
    }
}

export default new Waypoint();