import React from 'react';
import { capitalize, trim } from 'lodash';
import {
  Formik,
  Form,
  Field as FormikField,
  ErrorMessage,
  FormikHelpers,
  FormikValues,
} from 'formik';
import * as Yup from 'yup';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import images from 'utils/images';

type Props = {
  setEmail: (email: string) => void;
  toLogin: () => void;
};

export default function Register({ setEmail, toLogin }: Props) {
  async function onSubmit(
    values: FormikValues,
    { setFieldError, setSubmitting }: FormikHelpers<any>
  ) {
    const data = {
      email: trim(values.email).toLowerCase(),
      password: trim(values.password),
      firstName: capitalize(trim(values.firstName)),
      lastName: capitalize(trim(values.lastName)),
      code: trim(values.code),
    };

    try {
      await rpc.callServer('Auth-SignUp', data);
      await rpc.callClient('Auth-SuccessRegister', data.email);

      setEmail(data.email);
      toLogin();
    } catch (err: any) {
      setFieldError(err.field, err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="register-bg">
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          passwordConfirm: '',
          code: '',
        }}
        validationSchema={Yup.object({
          email: Yup.string().email('E-mail incorect').required('Completati campul'),
          password: Yup.string()
            .min(4, 'Lungime min. 4 caractere')
            .max(32, 'Lungime max. 32 caractere')
            .required('Completati campul'),
          passwordConfirm: Yup.string()
            .required('Parolele nu coincid')
            .oneOf([Yup.ref('password'), null], 'Parolele nu coincid'),
          firstName: Yup.string()
            .matches(/^[a-z\s]+$/i, 'Doar litere latine')
            .max(32, 'Lungime max. 32 caractere')
            .required('Completati campul'),
          lastName: Yup.string()
            .matches(/^[a-z\s]+$/i, 'Doar litere latine')
            .max(32, 'Lungime max. 32 caractere')
            .required('Completati campul'),
          code: Yup.string().required('Completati campul'),
        })}
        onSubmit={onSubmit}
      >
        {(formik) => (
          <Form className="register-card" autoComplete="off">
            <img
              src={images.getImage('inregistrare.png')}
              alt="Logo"
              className="register-logo"
              draggable={false}
              onContextMenu={e => e.preventDefault()}
            />
            <div className="register-header">
              <p className="register-subtitle">Introdu datele pentru a te inregistra</p>
            </div>
            <div className="register-form">
              <div className="register-row">
                <div className="register-field">
                  <span className="register-icon material-icons">person</span>
                  <FormikField
                    type="text"
                    name="firstName"
                    placeholder="Prenume"
                    autoComplete="given-name"
                  />
                </div>
                <div className="register-field">
                  <span className="register-icon material-icons">person</span>
                  <FormikField
                    type="text"
                    name="lastName"
                    placeholder="Nume"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="register-error-row">
                <ErrorMessage name="firstName">
                  {msg => <div className="register-error">{msg}</div>}
                </ErrorMessage>
                <ErrorMessage name="lastName">
                  {msg => <div className="register-error">{msg}</div>}
                </ErrorMessage>
              </div>
              <div className="register-field">
                <span className="register-icon material-icons">alternate_email</span>
                <FormikField
                  type="text"
                  name="email"
                  placeholder="Email"
                  autoComplete="email"
                />
              </div>
              <ErrorMessage name="email">
                {msg => <div className="register-error">{msg}</div>}
              </ErrorMessage>
              <div className="register-row">
                <div className="register-field">
                  <span className="register-icon material-icons">lock</span>
                  <FormikField
                    type="password"
                    name="password"
                    placeholder="Parola"
                    autoComplete="new-password"
                  />
                </div>
                <div className="register-field">
                  <span className="register-icon material-icons">lock</span>
                  <FormikField
                    type="password"
                    name="passwordConfirm"
                    placeholder="Confirmare"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="register-error-row">
                <ErrorMessage name="password">
                  {msg => <div className="register-error">{msg}</div>}
                </ErrorMessage>
                <ErrorMessage name="passwordConfirm">
                  {msg => <div className="register-error">{msg}</div>}
                </ErrorMessage>
              </div>
              {/* COD DE CONFIRMARE + BUTON */}
              <div className="register-field register-field--code-group">
                <span className="register-icon material-icons">password</span>
                <FormikField
                  type="text"
                  name="code"
                  placeholder="Cod de confirmare"
                  autoComplete="off"
                  maxLength={8}
                  className="register-code-input"
                />
                <button
                  type="button"
                  className="register-btn register-btn--inline"
                  tabIndex={-1}
                  onClick={async () => {
                    await formik.setTouched({ email: true });
                    await formik.validateField('email');
                    if (!formik.values.email || formik.errors.email) {
                      formik.setFieldError('email', formik.errors.email || 'Completati campul');
                      return;
                    }
                    rpc
                      .callServer('Auth-GetRegisterCode', trim(formik.values.email).toLowerCase())
                      .then(() => showNotification('info', 'Verificati e-mailul dvs.'))
                      .catch(() => formik.setFieldError('email', 'E-mail deja folosit'));
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '1em', verticalAlign: 'middle', marginRight: '0.2vw' }}>send</span>
                  Trimite
                </button>
              </div>
              <ErrorMessage name="code">
                {msg => <div className="register-error">{msg}</div>}
              </ErrorMessage>
              <button
                type="submit"
                className="register-btn"
                disabled={formik.isSubmitting}
              >
                INREGISTREAZA
              </button>
            </div>
            <div className="register-footer">
              <button
                type="button"
                className="register-footer-btn"
                onClick={toLogin}
              >
                Am deja un cont!
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
