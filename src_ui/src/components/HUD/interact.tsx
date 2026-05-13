import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';
import './interact.css';

export default function Interact() {
	const [key, setKey] = useState<string>();

	useEffect(() => {
		rpc.register('HUD-ShowInteract', (data) => setKey(data));

		return () => {
			rpc.unregister('HUD-ShowInteract');
		};
	}, [key]);

	return key ? (
		<div className="btn-inter-wrapper">
			<div className="btn-inter-vertical-text-container">
				<div className="btn-inter-rotated-text">
					<p className="btn-inter-font btn-inter-text-small">Apasa</p>
				</div>
			</div>
			
			<div className="btn-inter-key-cap">
				<div className="btn-inter-key-cap-inner">
					<p className="btn-inter-font btn-inter-key-text">{key}</p>
				</div>
			</div>

			<p className="btn-inter-font btn-inter-text-small">pentru</p>

			<div className="btn-inter-action-label">
				<p className="btn-inter-font btn-inter-action-text">a interactiona</p>
			</div>
		</div>
	) : null;
}
