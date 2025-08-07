const controlsIds = {
    F6: 117,
    W: 32,
    S: 33,
    A: 34,
    D: 35,
    Space: 321,
    LCtrl: 326,
    LMB: 24,
    RMB: 25
};

const player = mp.players.local;

class FlyMode {
    private enabled = false;
    private forward = 2.0;
    private height = 2.0;
    private l = 2.0;

    constructor() {
        // Toggle NoClip cu F6
        mp.keys.bind(controlsIds.F6, false, this.toggle.bind(this));

        // La fiecare frame, actualizează poziția și vizibilitatea jucătorilor
        mp.events.subscribeToDefault({
            render: this.onRender.bind(this)
        });

        // Ascultă modificarea variabilei NoClip pe oricare jucător și actualizează vizibilitatea
        mp.events.addDataHandler('NoClip', (entity, enabled) => {
            if (entity.handle === player.handle) {
                // Eu, local player
                if (enabled) {
                    player.setAlpha(0);
                    player.setVisible(false, false);
                    player.setCollision(false, false);
                    player.setInvincible(true);
                    player.freezePosition(true);
                } else {
                    player.setAlpha(255);
                    player.setVisible(true, false);
                    player.setCollision(true, true);
                    player.setInvincible(false);
                    player.freezePosition(false);
                }
            } else {
                // Alt jucător
                if (enabled) {
                    entity.setAlpha(0);
                    entity.setVisible(false, false);
                    entity.setCollision(false, false);
                } else {
                    entity.setAlpha(255);
                    entity.setVisible(true, false);
                    entity.setCollision(true, true);
                }
            }
        });

        // Optional: Ascunde nametag-urile pentru jucătorii cu NoClip activ (dacă folosești un sistem custom)
        mp.events.add('render', () => {
            mp.players.forEach(p => {
                if (p.getVariable('NoClip')) {
                    mp.nametags.setVisible(p, false);
                } else {
                    mp.nametags.setVisible(p, true);
                }
            });
        });
    }

    private toggle() {
        const adminLvl = player.getVariable('adminLvl');
        if (!adminLvl) return;

        this.enabled = !this.enabled;

        // Anunță serverul despre schimbarea NoClip
        mp.events.callRemote('Admin-NoClipToggle', this.enabled);

        if (!this.enabled) {
            // La dezactivare, pune playerul la sol și revine la vizibilitate normală
            const { position } = player;
            const groundDist = mp.game.gameplay.getGroundZFor3dCoord(
                position.x,
                position.y,
                position.z,
                0.0,
                false
            );

            this.setCoords(position.x, position.y, groundDist);

            player.setAlpha(255);
            player.setVisible(true, false);
            player.setCollision(true, true);
            player.setInvincible(false);
            player.freezePosition(false);
        }
    }

    private onRender() {
        if (!this.enabled) return;

        const { controls } = mp.game;
        const { position } = player;
        const direction = mp.cameras.gameplay.getDirection();

        let speed = 0.2;
        let updated = false;

        mp.game.controls.enableControlAction(2, 24, true);

        if (controls.isControlPressed(0, controlsIds.LMB)) speed = 1.0;
        else if (controls.isControlPressed(0, controlsIds.RMB)) speed = 0.02;

        if (controls.isControlPressed(0, controlsIds.W)) {
            position.x += direction.x * this.forward * speed;
            position.y += direction.y * this.forward * speed;
            position.z += direction.z * this.forward * speed;
            updated = true;
        } else if (controls.isControlPressed(0, controlsIds.S)) {
            position.x -= direction.x * this.forward * speed;
            position.y -= direction.y * this.forward * speed;
            position.z -= direction.z * this.forward * speed;
            updated = true;
        } else this.forward = 2.0;

        if (controls.isControlPressed(0, controlsIds.A)) {
            if (this.l < 8.0) this.l *= 1.025;
            position.x += -direction.y * this.l * speed;
            position.y += direction.x * this.l * speed;
            updated = true;
        } else if (controls.isControlPressed(0, controlsIds.D)) {
            if (this.l < 8.0) this.l *= 1.05;
            position.x -= -direction.y * this.l * speed;
            position.y -= direction.x * this.l * speed;
            updated = true;
        } else this.l = 2.0;

        if (controls.isControlPressed(0, controlsIds.Space)) {
            if (this.height < 8.0) this.height *= 1.025;
            position.z += this.height * speed;
            updated = true;
        } else if (controls.isControlPressed(0, controlsIds.LCtrl)) {
            if (this.height < 8.0) this.height *= 1.05;
            position.z -= this.height * speed;
            updated = true;
        } else this.height = 2.0;

        if (updated) this.setCoords(position.x, position.y, position.z);
    }

    private setCoords(x: number, y: number, z: number) {
        player.setCoordsNoOffset(x, y, z, false, false, false);
    }
}

new FlyMode();

export {};
