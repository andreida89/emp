import React, { useState } from 'react';
import rpc from 'utils/rpc';
import GradientButton from 'components/Common/gradient-button';

export default function AdminSelfCoords() {
    const [coords, setCoords] = useState<string | null>(null);

    async function fetchSelfCoords() {
        console.log("Requesting coordinates from server..."); // Debugging log

        try {
            const result = await rpc.callServer('Admin-GetSelfCoords');

            console.log("Received from server:", result); // Debugging log

            if (result && typeof result === 'object') {
                const { x, y, z } = result;
                setCoords(`${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
            } else {
                setCoords('Failed to fetch coordinates');
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            setCoords('Error retrieving coordinates');
        }
    }

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <GradientButton onClick={fetchSelfCoords}>Get My Coordinates</GradientButton>

            {/* Input field to display coordinates */}
            <div style={{ marginTop: '10px' }}>
                <input
                    type="text"
                    value={coords || ''}
                    readOnly
                    style={{
                        width: '80%',
                        padding: '10px',
                        fontSize: '16px',
                        textAlign: 'center',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        background: '#f5f5f5',
                        color: '#333'
                    }}
                />
            </div>
        </div>
    );
}
