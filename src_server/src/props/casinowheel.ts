// server-side (RAGE:MP TypeScript)

const luckyWheel = mp.objects.new(
    mp.joaat('ch_prop_casino_lucky_wheel_01a'),
    new mp.Vector3(943.31, 56.58, 74.75), // Z mai jos
    {
        rotation: new mp.Vector3(0, 0, -137.8951),
        dimension: 0,
        alpha: 255,
    }
);

// optional
luckyWheel.setVariable('staticObject', true);