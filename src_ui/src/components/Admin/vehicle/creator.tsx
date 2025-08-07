import React from 'react';
import rpc from 'utils/rpc';
import Select from 'react-select';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { showNotification } from 'utils/notifications';
import GradientButton from 'components/Common/gradient-button';
import vehicles from 'data/vehicles.json';
import Checkbox from '../partials/checkbox';
import Players from '../partials/players';

export default function AdminVehicleCreator() {
	async function createVehicle(data: any[]) {
		await rpc.callServer('Admin-CreateVehicle', data);
		showNotification('success', 'Vehiculul a fost spawnat cu succes');
	}

	return (
		<Formik
			initialValues={{ model: '', player: '', temporary: false }}
			validationSchema={Yup.object({
				model: Yup.string().required().min(1).max(1000)
			})}
			onSubmit={(values) => createVehicle(Object.values(values))}
		>
			{(formik) => (
				<Form>
					<Field className="admin_field" type="text" name="model" placeholder="Model" />

					<Select
						className="admin_select"
						classNamePrefix="admin_select"
						placeholder="Vehicul"
						options={Object.entries(vehicles).map(([value, label]) => ({
							value,
							label
						}))}
						noOptionsMessage={() => 'Nu a fost gasit'}
						onChange={(option) => formik.setFieldValue('model', option?.value)}
					/>

					<Players onChange={(data) => formik.setFieldValue('player', data.dbId)} />

					<Checkbox name="temporary" label="Temporar" />

					<GradientButton type="submit">Spawneaza</GradientButton>
				</Form>
			)}
		</Formik>
	);
}
