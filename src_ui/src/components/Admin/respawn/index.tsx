import React from 'react';
import rpc from 'utils/rpc';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { showNotification } from 'utils/notifications';
import GradientButton from 'components/Common/gradient-button';
import Players from '../partials/players';

export default function AdminRespawn() {
	async function respawnPlayer(player: string) {
		try {
			await rpc.callServer('Admin-Rspwn', [player]);
			showNotification('success', 'Jucatorul a primit respawn');
		} catch (error) {
			showNotification('error', 'Eroare la respawn');
		}
	}

	return (
		<div className="admin_respawn">
			<Formik
				initialValues={{ player: '' }}
				validationSchema={Yup.object({
					player: Yup.string().required()
				})}
				onSubmit={(values) => respawnPlayer(values.player)}
			>
				{(formik) => (
					<Form>
						<Players onChange={(data) => {
							formik.setFieldValue('player', data.dbId);
						}} />

						<GradientButton type="submit">Respawn</GradientButton>
					</Form>
				)}
			</Formik>
		</div>
	);
}
