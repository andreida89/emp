import React from 'react';
import rpc from 'utils/rpc';
import { Formik, Form, Field as FormikField, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import images from 'utils/images';

type Props = {
	setEmail: (email: string) => void;
	openForm: (name: any) => void;
	email: string;
};

export default function Login({ setEmail, openForm, email = '' }: Props) {
	return (
		<div className="login-bg">
			<Formik
				initialValues={{ email, password: '' }}
				validationSchema={Yup.object({
					email: Yup.string().email('E-mail incorect').required('Completati campul'),
					password: Yup.string().required('Completati campul')
				})}
onSubmit={(values, actions) => {
	rpc
		.callServer('Auth-SignIn', Object.values(values))
		.then(() => {
			rpc.callClient('Auth-SuccessLogin', values.email);

			actions.setSubmitting(false);
		})
		.catch((err: any) => {
			if (err.confirm) {
				setEmail(values.email);
				openForm('confirm');
				actions.setSubmitting(false);
				return;
			}
			actions.setFieldError(err.field, err.message);
			actions.setSubmitting(false);
		});
}}


			>
				{({ isSubmitting }) => (
					<Form className="login-card" autoComplete="off">
						<img src={images.getImage('autentificare.png')} alt="Logo" className="login-logo" draggable={false} />
						<div className="login-header">
							<p className="login-subtitle">Introdu datele pentru a intra pe server</p>
						</div>
						<div className="login-form">
							<div className="login-field">
								<span className="login-icon material-icons">person</span>
								<FormikField
									type="text"
									name="email"
									placeholder="Email"
									autoFocus
									autoComplete="username"
								/>
							</div>
							<ErrorMessage name="email">
								{msg => <div className="login-error">{msg}</div>}
							</ErrorMessage>
							<div className="login-field">
								<span className="login-icon material-icons">lock</span>
								<FormikField
									type="password"
									name="password"
									placeholder="Parola"
									autoComplete="current-password"
								/>
							</div>
							<ErrorMessage name="password">
								{msg => <div className="login-error">{msg}</div>}
							</ErrorMessage>
							<button type="submit" className="login-btn" disabled={isSubmitting}>
								INTRA IN JOC
							</button>
						</div>
						<div className="login-footer">
							<button
								type="button"
								className="footer-btn footer-btn-main1"
								onClick={() => openForm('forgot')}
							>
								RECUPERARE PAROLA
							</button>
							<button
								type="button"
								className="footer-btn footer-btn-main"
								onClick={() => openForm('register')}
							>
								CREAZA CONT NOU
							</button>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
}