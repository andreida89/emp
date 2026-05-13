
const INT_NAME: { [key: number]: string } = {
    0: "m25_2_int_mansion",
    1: "m25_2_int_mansion_garage",
    3: "m25_2_int_mansion_2",
};

const INT_TYPE: (string | null)[] = [INT_NAME[0], INT_NAME[1], null, INT_NAME[3]];

const POS: { [key: number]: { [key: number]: Vector3Mp } } = {
    1: {
        0: new mp.Vector3(-2586.065, 1909.995, 166.3754),
        1: new mp.Vector3(-2568.934, 1920.203, 155.5182),
        3: new mp.Vector3(-2587.496, 1893.193, 155.5183),
    },
    2: {
        0: new mp.Vector3(-1666.368, 478.9271, 128.2216),
        1: new mp.Vector3(-1679.877, 493.596, 117.3644),
        3: new mp.Vector3(-1649.63, 480.9779, 117.3645),
    },
    3: {
        0: new mp.Vector3(539.7012, 749.0894, 201.3616),
        1: new mp.Vector3(548.6964, 766.8868, 186.076),
        3: new mp.Vector3(547.4955, 734.136, 190.5045),
    },
};

const BIT = (n: number) => 1 << n;
const testBit = (value: number, bitIndex: number) => ((value >>> 0) & (1 << bitIndex)) !== 0;
const setBit = (value: number, bitIndex: number) => (value | (1 << bitIndex)) >>> 0;

class IplController {
    static toggle(enable: boolean, name: string) {
        try {
            if (!name) return;
            if (enable) {
                if (!mp.game.streaming.isIplActive(name)) mp.game.streaming.requestIpl(name);
            } else if (mp.game.streaming.isIplActive(name)) {
                mp.game.streaming.removeIpl(name);
            }
        } catch (e: any) {
            mp.console.logInfo(`[mansions] ${name}: ${e.message}`, true, true);
        }
    }

    static many(names: string[], enable: boolean) {
        for (const n of names) IplController.toggle(enable, n);
    }
}

class InteriorUtil {
    static intAt(pos: Vector3Mp, typeName: string) {
        return mp.game.interior.getInteriorAtCoordsWithType(pos.x, pos.y, pos.z, typeName);
    }

    static isValid(id: number) {
        return id && mp.game.interior.isValidInterior(id);
    }

    static applyCleanSet(ids: { main: number; gar: number; wing: number }) {
        const { main, gar, wing } = ids;
        if (!InteriorUtil.isValid(main)) return;

        mp.game.interior.enableInteriorProp(main, "SET_STYLE_CALI");
        mp.game.interior.enableInteriorProp(main, "SET_STYLE_REG_TINT");
        mp.game.interior.disableInteriorProp(main, "SET_ENTRANCE_BLOCKER");
        mp.game.interior.disableInteriorProp(main, "SET_ENTRANCE_LOCK");

        if (InteriorUtil.isValid(wing)) {
            mp.game.interior.enableInteriorProp(wing, "SET_ELEV_STD");
            mp.game.interior.disableInteriorProp(wing, "SET_VAULT_DOOR_OPEN");
            mp.game.interior.enableInteriorProp(wing, "SET_VAULT_DOOR_CLOSED");
            mp.game.interior.disableInteriorProp(wing, "SET_MOD_BLOCKER");
            mp.game.interior.disableInteriorProp(wing, "SET_PODIUM_BLOCKER");
        }

        if (InteriorUtil.isValid(gar)) {
            mp.game.interior.disableInteriorProp(gar, "SET_GAR_PODIUM_BLOCKER");
            mp.game.interior.disableInteriorProp(gar, "SET_GAR_MOD_BLOCKER");
        }

        mp.game.interior.refreshInterior(main);
        if (InteriorUtil.isValid(gar)) mp.game.interior.refreshInterior(gar);
        if (InteriorUtil.isValid(wing)) mp.game.interior.refreshInterior(wing);
    }
}

class MansionState {
    featureLevel: number = 1; // 0 disables amenities
    disableAmenities: boolean = false;
    activeOrgId: number = 0;
    ownerOrgId: number = 0;
    orgFlags: { [key: number]: { [key: number]: boolean } } = { 1: { 21: false, 23: false }, 2: { 21: false, 23: false }, 3: { 21: false, 23: false } };

    from(json: string | any) {
        const incoming = typeof json === "string" ? JSON.parse(json) : json || {};
        if (typeof incoming.featureLevel === "number") this.featureLevel = incoming.featureLevel | 0;
        if (typeof incoming.disableAmenities === "boolean") this.disableAmenities = incoming.disableAmenities;
        if (typeof incoming.activeOrgId === "number") this.activeOrgId = incoming.activeOrgId | 0;
        if (typeof incoming.ownerOrgId === "number") this.ownerOrgId = incoming.ownerOrgId | 0;
        if (incoming.orgFlags && typeof incoming.orgFlags === "object") {
            for (const k of Object.keys(incoming.orgFlags)) {
                const idx = parseInt(k);
                if (!this.orgFlags[idx]) this.orgFlags[idx] = { 21: false, 23: false };
                const ent = incoming.orgFlags[k] || {};
                if (typeof ent[21] === "boolean") this.orgFlags[idx][21] = ent[21];
                if (typeof ent[23] === "boolean") this.orgFlags[idx][23] = ent[23];
            }
        }
    }

    get amenityBlocked() {
        return this.featureLevel === 0 || this.disableAmenities;
    }

    getOrgFlag(slotIndex: number, flagBit: number) {
        const flags = this.orgFlags[slotIndex] || {};
        return !!flags[flagBit] ? 1 : 0;
    }
}

class MansionSite {
    key: string;
    bits: { gate: number; enable: number; shutters: number; firepit?: number };
    base: any;
    posKey: number;

    constructor(key: string, bits: { gate: number; enable: number; shutters: number; firepit?: number }, base: any, posKey: number) {
        this.key = key; // "west" | "east" | "tongva"
        this.bits = bits; // { gate:3, enable:4/8/10, shutters:5/9/11, firepit?:12 }
        this.base = base; // { generic, private, railings, interiors:[a,b,c], extras:{ gym, dog } }
        this.posKey = posKey; // 2/3/1 matching POS indexes
    }

    getInteriorIds() {
        return {
            main: InteriorUtil.intAt(POS[this.posKey][0], INT_TYPE[0] as string),
            gar: InteriorUtil.intAt(POS[this.posKey][1], INT_TYPE[1] as string),
            wing: InteriorUtil.intAt(POS[this.posKey][3], INT_TYPE[3] as string),
        };
    }

    applyInteriorsIfEnabled(flags: number) {
        if (!(flags & BIT(this.bits.enable))) return;
        InteriorUtil.applyCleanSet(this.getInteriorIds());
    }

    updateWorld(flags: number, state: MansionState) {
        const gateOn = testBit(flags, this.bits.gate);
        if (!gateOn) {
            IplController.many(
                [
                    this.base.private,
                    this.base.generic,
                    this.base.railings,
                    ...this.base.interiors,
                    this.base.extras.gym,
                    this.base.extras.dog,
                ],
                false
            );
            return;
        }

        const enabled = testBit(flags, this.bits.enable);

        // Generic/private swap + interiors + railings
        IplController.toggle(!enabled, this.base.generic);
        IplController.toggle(enabled, this.base.private);
        IplController.toggle(true, "hei_ch1_roads_mansion"); // shared road set used by all three
        IplController.many(this.base.interiors, enabled);
        IplController.toggle(enabled, this.base.railings);

        // Amenities (gym, dog house)
        if (state.amenityBlocked) {
            IplController.toggle(false, this.base.extras.gym);
            IplController.toggle(false, this.base.extras.dog);
        } else {
            const slotIndex = this.key === "west" ? 2 : this.key === "east" ? 3 : 1; // per original mapping
            const canGym = state.activeOrgId !== state.ownerOrgId && !testBit(state.getOrgFlag(slotIndex, 21), 0);
            const canDog = state.activeOrgId !== state.ownerOrgId && !testBit(state.getOrgFlag(slotIndex, 23), 0);
            IplController.toggle(enabled && canGym, this.base.extras.gym);
            IplController.toggle(enabled && canDog, this.base.extras.dog);
        }

        // Firepit (only for west site per original bit 12 usage)
        if (this.bits.firepit !== undefined && enabled) {
            IplController.toggle(!testBit(flags, this.bits.firepit), "hei_ch1_06e_mansion_firepit");
        }

        // Shutters
        if (this.bits.shutters !== undefined) {
            const shuttersOn = testBit(flags, this.bits.shutters);
            IplController.toggle(shuttersOn, this.base.shutters);
        }
    }
}

class MansionManager {
    state: MansionState;
    sites: MansionSite[];

    constructor() {
        this.state = new MansionState();

        this.sites = [
            new MansionSite(
                "west",
                { gate: 3, enable: 4, shutters: 5, firepit: 12 },
                {
                    generic: "hei_ch1_06e_mansion_generic",
                    private: "hei_ch1_06e_mansion_private",
                    railsBase: "hei_ch1_06e_mansion_railings_m",
                    railings: "hei_ch1_06e_mansion_railings_m",
                    interiors: [
                        "m25_2_ch1_06e_mansion_interior_a",
                        "m25_2_ch1_06e_mansion_interior_b",
                        "m25_2_ch1_06e_mansion_interior_c",
                    ],
                    extras: { gym: "m25_2_mansion_gym", dog: "m25_2_dog_house" },
                    shutters: "hei_ch1_06e_mansion_shutters",
                },
                2
            ),
            new MansionSite(
                "east",
                { gate: 3, enable: 8, shutters: 9 },
                {
                    generic: "apa_ch2_04_mansion_generic",
                    private: "apa_ch2_04_mansion_private",
                    railings: "apa_ch2_04_mansion_railings_m",
                    interiors: [
                        "m25_2_ch2_04_mansion_interior_a",
                        "m25_2_ch2_04_mansion_interior_b",
                        "m25_2_ch2_04_mansion_interior_c",
                    ],
                    extras: { gym: "m25_2_east_mansion_gym", dog: "m25_2_east_dog_house" },
                    shutters: "apa_ch2_04_mansion_shutters",
                },
                3
            ),
            new MansionSite(
                "tongva",
                { gate: 3, enable: 10, shutters: 11 },
                {
                    generic: "hei_ch1_09_mansion_generic",
                    private: "hei_ch1_09_mansion_private",
                    railings: "hei_ch1_09_mansion_railings_m",
                    interiors: [
                        "m25_2_ch1_09_mansion_interior_a",
                        "m25_2_ch1_09_mansion_interior_b",
                        "m25_2_ch1_09_mansion_interior_c",
                    ],
                    extras: { gym: "m25_2_tongva_mansion_gym", dog: "m25_2_tongva_dog_house" },
                    shutters: "hei_ch1_09_mansion_shutters",
                },
                1
            ),
        ];
    }

    logInit() {
        mp.console.logInfo("[mansions] inițializare (bit3 activat)", true, true);
    }
    logClear() {
        mp.console.logInfo("[mansions] ștergere totală (bit3 dezactivat)", true, true);
    }

    update(bitfield: number, extraFlags: number) {
        const flags = bitfield >>> 0;
        const out = {
            Global_1836261: 0,
            Global_2686090_f_6510: extraFlags >>> 0 || 0,
        };

        const gateOn = testBit(flags, 3);
        if (gateOn) this.logInit();
        else this.logClear();

        for (const s of this.sites) s.updateWorld(flags, this.state);

        IplController.toggle(!testBit(flags, 3), "hei_ch1_06e_mansion_original");
        IplController.toggle(!testBit(flags, 3), "hei_ch1_06e_props_original");
        IplController.toggle(!testBit(flags, 3), "hei_ch1_roads_original");
        IplController.toggle(!testBit(flags, 3), "hei_ch1_06f_mansion_Original");
        IplController.toggle(testBit(flags, 3), "hei_ch1_06e_mansion_shared");
        IplController.toggle(testBit(flags, 3), "hei_ch1_06f_mansion_shared");
        IplController.toggle(!testBit(flags, 3), "apa_ch2_04_mansion_original");
        IplController.toggle(!testBit(flags, 3), "apa_ch2_04_props_original");
        IplController.toggle(testBit(flags, 3), "apa_ch2_04_mansion_shared");
        IplController.toggle(!testBit(flags, 3), "hei_ch1_09_mansion_original");
        IplController.toggle(!testBit(flags, 3), "hei_ch1_09_props_original");
        IplController.toggle(testBit(flags, 3), "hei_ch1_09_mansion_shared");

        out.Global_1836261 = 1;
        out.Global_2686090_f_6510 = setBit(out.Global_2686090_f_6510, 20);
        return out;
    }

    handleUpdate(bitfield: number, extraFlags: number) {
        const out = this.update(bitfield, extraFlags);

        if (!(bitfield & BIT(3))) return;

        if (bitfield & BIT(4))
            InteriorUtil.applyCleanSet({
                main: InteriorUtil.intAt(POS[2][0], INT_TYPE[0] as string),
                gar: InteriorUtil.intAt(POS[2][1], INT_TYPE[1] as string),
                wing: InteriorUtil.intAt(POS[2][3], INT_TYPE[3] as string),
            });

        if (bitfield & BIT(8))
            InteriorUtil.applyCleanSet({
                main: InteriorUtil.intAt(POS[3][0], INT_TYPE[0] as string),
                gar: InteriorUtil.intAt(POS[3][1], INT_TYPE[1] as string),
                wing: InteriorUtil.intAt(POS[3][3], INT_TYPE[3] as string),
            });

        if (bitfield & BIT(10))
            InteriorUtil.applyCleanSet({
                main: InteriorUtil.intAt(POS[1][0], INT_TYPE[0] as string),
                gar: InteriorUtil.intAt(POS[1][1], INT_TYPE[1] as string),
                wing: InteriorUtil.intAt(POS[1][3], INT_TYPE[3] as string),
            });

        return out;
    }
}

const manager = new MansionManager();

mp.events.add("mansions:update", (bitfield: number, extraFlags: number) => {
    manager.handleUpdate(bitfield >>> 0, extraFlags >>> 0 || 0);
});

mp.events.add("mansions:setState", (json: string) => {
    try {
        manager.state.from(json);
        mp.console.logInfo("[mansions] status actualizat", true, true);
    } catch (e: any) {
        mp.console.logInfo("[mansions] eroare JSON: " + e.message, true, true);
    }
});

export { testBit, setBit };
