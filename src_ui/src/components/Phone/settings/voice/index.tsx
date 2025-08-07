import React from 'react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import Navigation from '../../partials/navigation';
import Button from '../../partials/button';

type Props = {
	close: () => void;
};

export default function SettingsVoice({ close }: Props) {
	async function reload() {
		await rpc.callClient('Voice-Reload');

		showNotification('info', 'Chatul vocal a fost repornit');
	}

	return (
		<div className="settings_voice">
			<Navigation title="Chat vocal" close={{ title: '', onClick: close }} />

			<Button color="blue" onClick={reload}>
			Repornire
			</Button>
		</div>
	);
}
