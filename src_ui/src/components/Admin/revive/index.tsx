import React from 'react';
import rpc from 'utils/rpc';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { showNotification } from 'utils/notifications';
import GradientButton from 'components/Common/gradient-button';
import Players from '../partials/players';

export default function AdminRevive() {
	async function revivePlayer(player: string) {
		//console.log('Attempting to revive player:', player);
		try {
			await rpc.callServer('Admin-Revive', [player]);
			showNotification('success', 'Jucatorul a primit revive');
			//console.log('Revive request sent successfully');
		} catch (error) {
			//console.error('Error reviving player:', error);
			showNotification('error', 'Eroare la revive');
		}
	}

	return (
		<div className="admin_revive">
			<Formik
				initialValues={{ player: '' }}
				validationSchema={Yup.object({
					player: Yup.string().required()
				})}
				onSubmit={(values) => revivePlayer(values.player)}
			>
				{(formik) => (
					<Form>
						<Players onChange={(data) => {
							console.log('Selected player:', data.dbId);
							formik.setFieldValue('player', data.dbId);
						}} />

						<GradientButton type="submit">Revive</GradientButton>
					</Form>
				)}
			</Formik>
		</div>
	);
}
