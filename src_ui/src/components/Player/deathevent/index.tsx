import React from 'react';
import rpc from 'utils/rpc';

export default function Death() {
	const handleRespawn = () => {
		rpc.callClient('Player-ClientDieEvent');
	};

	return (
		<div className="respawn-screen">
			<button className="respawn-button" onClick={handleRespawn}>
				<span>Respawn</span>
			</button>
		</div>
	);
}
