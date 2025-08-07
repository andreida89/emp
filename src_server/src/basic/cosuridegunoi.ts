import cosuri from 'data/cosuridegunoi.json';

const BIN_MODEL = mp.joaat('prop_bin_delpiero_b');

export function spawnCosuri() {
cosuri.forEach((pos) => {
    mp.objects.new(BIN_MODEL, new mp.Vector3(pos.x, pos.y, pos.z - 1), {
        dimension: 0
    });
});

}
