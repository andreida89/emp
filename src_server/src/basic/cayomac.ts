import player from 'helpers/players';

// List of plant positions (X, Y only, Z will be calculated)
const plantPositions = [
    [5300.65, -5261.00], 
    [5297.33, -5257.88]
];
// Event triggered when a player connects (used to get the ground height)
mp.events.add("playerReady", (player) => {
    if (player) { // Ensure only one request is sent on server start
        if (plantPositions.length > 0) {
            player.call('requestGroundZMultiple', [JSON.stringify(plantPositions)]);
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
        return;
    }

    // Spawn each plant at the correct ground Z level
    positions.forEach(pos => {
        const [x, y, groundZ] = pos;

        mp.objects.new('prop_weed_01', new mp.Vector3(x, y, groundZ), {
            rotation: new mp.Vector3(0, 0, 0),
            alpha: 255,
            dimension: 0
        });

    });

});