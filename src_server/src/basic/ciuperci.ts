import player from 'helpers/players';

// List of plant positions (X, Y only, Z will be calculated)
const cocaPositions = [
    [5301.06, -5261.18], 
    [5297.67, -5258.31]
];

// Event triggered when a player connects (used to get the ground height)
mp.events.add("playerReady", (player) => {
    if (player && player.id === 0) { // Ensure only one request is sent on server start
        if (cocaPositions.length > 0) {
            player.call('requestGroundZMultiple', [JSON.stringify(cocaPositions)]);
        }
    }
});

// Event to receive correct ground heights and spawn plants
mp.events.add('spawnPlants', (player, positionsJSON) => {
    let positions;
    
    try {
        positions = JSON.parse(positionsJSON); // Convert JSON string back to array
    } catch (error) {
        return;
    }

    if (!Array.isArray(positions) || positions.length === 0) {
        console.log("[ERROR] Invalid or empty positions array.");
        return;
    }

    // Spawn each plant at the correct ground Z level
    positions.forEach(pos => {
        const [x, y, groundZ] = pos;

        mp.objects.new('h4_prop_weed_01_plant', new mp.Vector3(x, y, groundZ), {
            rotation: new mp.Vector3(0, 0, 0),
            alpha: 255,
            dimension: 0
        });

    });

});
