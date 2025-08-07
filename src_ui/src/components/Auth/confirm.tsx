import React from 'react';
import rpc from 'utils/rpc';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import GradientButton from 'components/Common/gradient-button';
import PrimaryTitle from 'components/Common/primary-title';
import Field from './field';

type Props = {
	email: string;
};

export default function AuthConfirm({ email }: Props) {
	return (
		<div className="auth_confirm">
			<PrimaryTitle className="auth_title">Dispozitiv necunoscut</PrimaryTitle>


<p className="auth_confirm-remark">
    Incercare de conectare de pe un dispozitiv necunoscut.
    <br />
    Va rugam sa confirmati ca sunteti dumneavoastra.
</p>

			<Formik
				initialValues={{ code: '' }}
				validationSchema={Yup.object({
					code: Yup.string().required('Completati campul')
				})}
				onSubmit={(values, { setFieldError }) => {
					rpc
						.callServer('Auth-SignInWithCode', [email, values.code])
						.then(() => rpc.callClient('Auth-SuccessLogin', email))
						.catch(() => setFieldError('code', 'Cod incorect'));
				}}
			>
				<Form className="auth_form">
					<Field
title="Cod de confirmare"
type="text"
name="code"
placeholder="Verificati e-mailul dvs."

					/>

					<GradientButton type="submit">Confirma</GradientButton>
				</Form>
			</Formik>
		</div>
	);
}
