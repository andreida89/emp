mp.events.add('requestGroundZMultiple', (positionsJSON) => {
    let positions;

    try {
        positions = JSON.parse(positionsJSON); // Convert JSON string to array
    } catch (error) {
        console.log("[ERROR] Failed to parse positions data!");
        return;
    }

    if (!Array.isArray(positions) || positions.length === 0) {
        console.log("[ERROR] Invalid or empty positions array.");
        return;
    }

    let plantPositionsWithZ = [];

    positions.forEach(pos => {
        let x = pos[0];
        let y = pos[1];
        let groundZ = mp.game.gameplay.getGroundZFor3dCoord(x, y, 100, false, false);

        // Adjust ground height if necessary (e.g., if the plants appear floating or sinking)
        groundZ -= 0.5; // Slight adjustment to ensure it’s on the ground

        plantPositionsWithZ.push([x, y, groundZ]);
    });

    // Send back all positions with correct ground heights to the server
    mp.events.callRemote('spawnPlants', JSON.stringify(plantPositionsWithZ));
});
