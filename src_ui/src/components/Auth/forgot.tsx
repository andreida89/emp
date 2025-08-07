import React from 'react';
import { trim } from 'lodash';
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
  toLogin: () => void;
};

export default function Forgot({ toLogin }: Props) {
  async function onSubmit(
    values: FormikValues,
    { setFieldError, setSubmitting }: FormikHelpers<any>
  ) {
    const data = {
      email: trim(values.email).toLowerCase(),
      password: trim(values.password),
      code: trim(values.code),
    };

    try {
      await rpc.callServer('Auth-ResetPassword', data);
      toLogin();
    } catch (err: any) {
      setFieldError(err.field, err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="forgotpassword-bg">
      <Formik
        initialValues={{
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
          code: Yup.string().required('Completati campul'),
        })}
        onSubmit={onSubmit}
      >
        {(formik) => (
          <Form className="forgotpassword-card" autoComplete="off">
            <img
              src={images.getImage('forgot.png')}
              alt="Logo"
              className="forgotpassword-logo"
              draggable={false}
              onContextMenu={e => e.preventDefault()}
            />
            <div className="forgotpassword-header">
              <p className="forgotpassword-subtitle">Recupereaza-ti parola</p>
            </div>
            <div className="forgotpassword-form">
              {/* EMAIL */}
              <div className="forgotpassword-field">
                <span className="forgotpassword-icon material-icons">alternate_email</span>
                <FormikField
                  type="text"
                  name="email"
                  placeholder="Email"
                  autoComplete="email"
                />
              </div>
              <ErrorMessage name="email">
                {msg => <div className="forgotpassword-error">{msg}</div>}
              </ErrorMessage>

              {/* PAROLA + CONFIRMARE */}
              <div className="forgotpassword-row">
                <div className="forgotpassword-field">
                  <span className="forgotpassword-icon material-icons">lock</span>
                  <FormikField
                    type="password"
                    name="password"
                    placeholder="Parola nouă"
                    autoComplete="new-password"
                  />
                </div>
                <div className="forgotpassword-field">
                  <span className="forgotpassword-icon material-icons">lock</span>
                  <FormikField
                    type="password"
                    name="passwordConfirm"
                    placeholder="Confirmare"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="forgotpassword-error-row">
                <ErrorMessage name="password">
                  {msg => <div className="forgotpassword-error">{msg}</div>}
                </ErrorMessage>
                <ErrorMessage name="passwordConfirm">
                  {msg => <div className="forgotpassword-error">{msg}</div>}
                </ErrorMessage>
              </div>

              {/* COD DE CONFIRMARE + BUTON TRIMITE */}
              <div className="forgotpassword-field forgotpassword-field--code-group">
                <span className="forgotpassword-icon material-icons">password</span>
                <FormikField
                  type="text"
                  name="code"
                  placeholder="Cod de confirmare"
                  autoComplete="off"
                  maxLength={8}
                  className="forgotpassword-code-input"
                />
                <button
                  type="button"
                  className="forgotpassword-btn forgotpassword-btn--inline"
                  tabIndex={-1}
                  onClick={async () => {
                    await formik.setTouched({ email: true });
                    await formik.validateField('email');
                    if (!formik.values.email || formik.errors.email) {
                      formik.setFieldError('email', formik.errors.email || 'Completati campul');
                      return;
                    }
                    rpc
                      .callServer('Auth-GetResetCode', trim(formik.values.email).toLowerCase())
                      .then(() => showNotification('info', 'Verificati e-mailul dvs.'))
                      .catch(() => formik.setFieldError('email', 'Contul nu a fost gasit'));
                  }}
                >
                  <span
                    className="material-icons"
                    style={{
                      fontSize: '1em',
                      verticalAlign: 'middle',
                      marginRight: '0.2vw',
                    }}
                  >
                    send
                  </span>
                  Trimite
                </button>
              </div>
              <ErrorMessage name="code">
                {msg => <div className="forgotpassword-error">{msg}</div>}
              </ErrorMessage>

              <button
                type="submit"
                className="forgotpassword-btn"
                disabled={formik.isSubmitting}
              >
                CONFIRMA
              </button>
            </div>
            <div className="forgotpassword-footer">
              <button
                type="button"
                className="forgotpassword-footer-btn"
                onClick={toLogin}
              >
                Inapoi la autentificare
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
