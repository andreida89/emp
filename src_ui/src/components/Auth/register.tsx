import React, { useState, useEffect } from 'react';
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

// Pictograme SVG Inline
const Icons = {
  User: ({ size = 24, strokeWidth = 2.5, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Mail: ({ size = 24, strokeWidth = 2.5, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Lock: ({ size = 24, strokeWidth = 2.5, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  ShieldCheck: ({ size = 24, strokeWidth = 2.5, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  Send: ({ size = 24, strokeWidth = 2.5, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  ChevronRight: ({ size = 36, strokeWidth = 2, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  LogIn: ({ size = 28, strokeWidth = 2, color = "#f1c40f", className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  )
};

type Props = {
  setEmail: (email: string) => void;
  toLogin: () => void;
};

export default function Register({ setEmail, toLogin }: Props) {
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  
  // State pentru sistemul de cod
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); 

  const showNotice = (type: string, message: string) => {
    setNotification({ type, message });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Timer Logic
  useEffect(() => {
    let timer: any;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  async function onSubmit(
    values: FormikValues,
    { setFieldError, setSubmitting }: FormikHelpers<any>
  ) {
    const data = {
      email: trim(values.email).toLowerCase(),
      password: trim(values.password),
      firstName: capitalize(trim(values.firstName)),
      lastName: capitalize(trim(values.lastName)),
      age: parseInt(values.age),
      code: trim(values.code),
    };

    try {
      await rpc.callServer('Auth-SignUp', data);
      await rpc.callClient('Auth-SuccessRegister', data.email);

      setEmail(data.email);
      showNotice('success', 'Contul a fost creat cu succes!');
      setTimeout(() => {
      	toLogin();
      }, 1500);
    } catch (err: any) {
      setFieldError(err.field, err.message);
      showNotice('error', err.message || 'Eroare la înregistrare!');
      setSubmitting(false);
    }
  }

  return (
    <div className="empire-register-main-container">
      {/* Notificări */}
      {notification && (
        <div className={`empire-register-notification-box ${notification.type === 'success' ? 'empire-register-success' : 'empire-register-error'}`}>
          <div className="empire-register-notification-content">
            <span className="empire-register-notification-title">
              {notification.type === 'success' ? 'Succes' : 'Eroare'}
            </span>
            <span className="empire-register-notification-message">
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Imagine de Fundal */}
      <div 
        className="empire-register-background-image"
        style={{
          backgroundImage: `url('https://empirerp.eu/bglogin.jpg')`
        }}
      />
      
      <div className="empire-register-background-overlay" />

      <div className="empire-register-login-wrapper">
        
        <div className="empire-register-header-section">
          <h1 className="empire-register-main-title">INREGISTRARE</h1>
          <div className="empire-register-subtitle-container">
            <div className="empire-register-line" />
            <span className="empire-register-subtitle-text">EMPIRE ROMANIA ROLEPLAY</span>
            <div className="empire-register-line" />
          </div>
        </div>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            age: '',
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
            age: Yup.number()
              .min(18, 'Varsta minima 18 ani')
              .max(90, 'Varsta maxima 90 ani')
              .required('Completati campul'),
            code: Yup.string().required('Completati campul'),
          })}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <Form className="empire-register-login-form" autoComplete="off">
              <div className="empire-register-form-content">
                
                {/* Nume si Prenume pe aceeasi linie */}
                <div className="empire-register-row-inputs">
                  <div className="empire-register-input-wrapper empire-register-half">
                    <div className="empire-register-input-icon"><Icons.User size={14} strokeWidth={2.5} className="empire-register-crisp-icon" /></div>
                    <FormikField
                      name="lastName"
                      type="text" 
                      placeholder="NUME"
                      autoComplete="family-name"
                      className="empire-register-custom-input"
                    />
                    <ErrorMessage name="lastName">
                      {msg => <div className="empire-register-error">{msg}</div>}
                    </ErrorMessage>
                  </div>
                  <div className="empire-register-input-wrapper empire-register-half">
                    <div className="empire-register-input-icon"><Icons.User size={14} strokeWidth={2.5} className="empire-register-crisp-icon" /></div>
                    <FormikField
                      name="firstName"
                      type="text" 
                      placeholder="PRENUME"
                      autoComplete="given-name"
                      className="empire-register-custom-input"
                    />
                    <ErrorMessage name="firstName">
                      {msg => <div className="empire-register-error">{msg}</div>}
                    </ErrorMessage>
                  </div>
                </div>

                {/* Varsta pe o singura linie */}
                <div className="empire-register-input-wrapper">
                  <div className="empire-register-input-icon"><Icons.User size={14} strokeWidth={2.5} className="empire-register-crisp-icon" /></div>
                  <FormikField
                    name="age"
                    type="number" 
                    placeholder="VARSTA PERSONAJULUI (MIN. 18)"
                    className="empire-register-custom-input"
                  />
                  <ErrorMessage name="age">
                    {msg => <div className="empire-register-error">{msg}</div>}
                  </ErrorMessage>
                </div>

                {/* Email pe o singura linie */}
                <div className="empire-register-input-wrapper">
                  <div className="empire-register-input-icon"><Icons.Mail size={14} strokeWidth={2.5} className="empire-register-crisp-icon" /></div>
                  <FormikField
                    name="email"
                    type="email" 
                    placeholder="INTRODU EMAIL-UL PENTRU VALIDARE"
                    autoComplete="email"
                    className="empire-register-custom-input"
                  />
                  <ErrorMessage name="email">
                    {msg => <div className="empire-register-error">{msg}</div>}
                  </ErrorMessage>
                </div>

                {/* Parola si Confirmare pe aceeasi linie */}
                <div className="empire-register-row-inputs">
                  <div className="empire-register-input-wrapper empire-register-half">
                    <div className="empire-register-input-icon"><Icons.Lock size={14} strokeWidth={2.5} className="empire-register-crisp-icon" /></div>
                    <FormikField
                      name="password"
                      type="password" 
                      placeholder="PAROLA"
                      autoComplete="new-password"
                      className="empire-register-custom-input"
                    />
                    <ErrorMessage name="password">
                      {msg => <div className="empire-register-error">{msg}</div>}
                    </ErrorMessage>
                  </div>
                  <div className="empire-register-input-wrapper empire-register-half">
                    <div className="empire-register-input-icon"><Icons.ShieldCheck size={14} strokeWidth={2.5} className="empire-register-crisp-icon" /></div>
                    <FormikField
                      name="passwordConfirm"
                      type="password" 
                      placeholder="CONFIRMARE PAROLA"
                      autoComplete="new-password"
                      className="empire-register-custom-input"
                    />
                    <ErrorMessage name="passwordConfirm">
                      {msg => <div className="empire-register-error">{msg}</div>}
                    </ErrorMessage>
                  </div>
                </div>

                {/* Cod Confirmare si Buton Trimite */}
                <div className="empire-register-input-wrapper empire-register-code-row">
                  <div className="empire-register-input-icon"><Icons.Send size={14} strokeWidth={2.5} className="empire-register-crisp-icon" /></div>
                  <FormikField
                    name="code"
                    type="text" 
                    placeholder="INTRODU CODUL DE PE EMAIL"
                    autoComplete="off"
                    className="empire-register-custom-input empire-register-code-input"
                  />
                  <button 
                    type="button" 
                    className={`empire-register-send-button ${isTimerActive ? 'empire-register-active' : ''}`}
                    disabled={isTimerActive}
                    onClick={async () => {
                      await formik.setTouched({ email: true });
                      await formik.validateField('email');
                      if (!formik.values.email || formik.errors.email) {
                        formik.setFieldError('email', formik.errors.email || 'Completati campul');
                        showNotice('error', 'Introdu o adresă de email validă!');
                        return;
                      }
                      rpc
                        .callServer('Auth-GetRegisterCode', trim(formik.values.email).toLowerCase())
                        .then(() => {
                           setIsTimerActive(true);
                           setTimeLeft(120);
                           showNotice('success', 'Codul de confirmare a fost trimis pe email!');
                        })
                        .catch(() => {
                           formik.setFieldError('email', 'E-mail deja folosit');
                           showNotice('error', 'Acest e-mail este deja folosit!');
                        });
                    }}
                  >
                    {isTimerActive ? `RETRIMITE (${formatTime(timeLeft)})` : 'TRIMITE'}
                  </button>
                  <ErrorMessage name="code">
                    {msg => <div className="empire-register-error">{msg}</div>}
                  </ErrorMessage>
                </div>

                <button type="submit" className="empire-register-login-button" disabled={formik.isSubmitting}>
                  INREGISTREAZA
                  <Icons.ChevronRight size={24} className="empire-register-chevron-icon" />
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <button 
          onClick={toLogin}
          className="empire-register-register-button"
        >
          <Icons.LogIn size={20} color="#f1c40f" />
          <span className="empire-register-register-text">Detin deja un cont</span>
        </button>

      </div>

      <style>{`
        /* Reset & Base */
        .empire-register-main-container * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .empire-register-main-container {
          width: 100vw;
          min-height: 100vh;
          background-color: black;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
          user-select: none;
          font-family: 'Inter', sans-serif;
        }

        /* Error Messages Formik */
        .empire-register-error {
          position: absolute;
          bottom: -1.8vh;
          left: 1vw;
          color: #ff3333;
          font-size: 0.55vw;
          font-style: italic;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* Notificări */
        .empire-register-notification-box {
          position: fixed;
          bottom: 5vh;
          right: 2.5vw;
          z-index: 100;
          width: 17vw;
          min-height: 9vh;
          padding: 1.8vh 1.1vw;
          border-radius: 0.6vw;
          box-shadow: 0 2.5vh 6vh rgba(0, 0, 0, 0.9);
          animation: empire-register-strong-tada 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .empire-register-notification-box.empire-register-success {
          background-color: #2ecc71;
          color: black;
          box-shadow: 0 1.5vh 4vh rgba(46, 204, 113, 0.6);
        }

        .empire-register-notification-box.empire-register-error {
          background-color: #ff1a1a;
          color: white;
          box-shadow: 0 1.5vh 4vh rgba(255, 26, 26, 0.6);
        }

        .empire-register-notification-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .empire-register-notification-title {
          display: block;
          width: 100%;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: 0.1vw;
          font-size: 0.7vw;
          line-height: 1.2;
        }

        .empire-register-notification-message {
          display: block;
          width: 100%;
          font-weight: 700;
          font-style: italic;
          text-transform: uppercase;
          opacity: 0.95;
          font-size: 0.7vw;
          margin-top: 0.5vh;
          word-wrap: break-word;
        }

        /* Fundal */
        .empire-register-background-image {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.5;
          background-size: cover;
          background-position: center;
          filter: brightness(0.7) contrast(110%);
        }

        .empire-register-background-overlay {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%, rgba(0,0,0,0.4));
        }

        /* Layout Central */
        .empire-register-login-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          width: 100%;
          max-width: 25vw;
          animation: empire-register-fade-zoom 0.7s ease-out;
        }

        .empire-register-header-section {
          text-align: center;
          margin-bottom: 5vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empire-register-main-title {
          font-size: 2vw;
          font-weight: 900;
          color: #f1c40f;
          font-style: italic;
          text-transform: uppercase;
          filter: drop-shadow(0 0.5vh 1.5vh rgba(0, 0, 0, 0.8));
        }

        .empire-register-subtitle-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8vw;
        }

        .empire-register-line { height: 2px; width: 2vw; background-color: #f1c40f; }

        .empire-register-subtitle-text {
          color: white;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 0.55vw;
        }

        /* Form Layout */
        .empire-register-login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empire-register-form-content {
          width: 85%;
          display: flex;
          flex-direction: column;
          gap: 2.5vh;
        }

        .empire-register-row-inputs {
          display: flex;
          gap: 1vw;
          width: 100%;
        }

        .empire-register-input-wrapper {
          position: relative;
          height: 5.5vh;
          width: 100%;
        }

        .empire-register-half { width: 50%; }

        .empire-register-input-icon {
          position: absolute;
          left: 1vw;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          color: #f1c40f;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empire-register-custom-input {
          width: 100% !important;
          height: 100% !important;
          background-color: rgba(0, 0, 0, 0.6) !important;
          border: 1px solid rgba(241, 196, 15, 0.4) !important;
          border-radius: 0.5vw !important;
          padding-left: 2.5vw !important;
          color: #f1c40f !important;
          font-weight: 700 !important;
          outline: none !important;
          font-style: italic !important;
          font-size: 0.75vw !important;
          box-shadow: 0 2vh 4vh rgba(0, 0, 0, 0.5) !important;
        }

        .empire-register-custom-input:-webkit-autofill,
        .empire-register-custom-input:-webkit-autofill:hover, 
        .empire-register-custom-input:-webkit-autofill:focus, 
        .empire-register-custom-input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s !important;
          -webkit-text-fill-color: #f1c40f !important;
        }

        .empire-register-custom-input::placeholder {
          color: rgba(241, 196, 15, 0.7);
        }

        .empire-register-custom-input:focus {
          border-color: #f1c40f;
          box-shadow: 0 0 2.5vh rgba(241, 196, 15, 0.2);
        }

        /* Code Row Special */
        .empire-register-code-row {
          display: flex;
        }

        .empire-register-code-input {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          flex-grow: 1;
        }

        .empire-register-send-button {
          height: 100%;
          background-color: #f1c40f;
          border: none;
          color: black;
          font-weight: 900;
          padding: 0 1vw;
          border-radius: 0 0.8vw 0.8vw 0;
          cursor: pointer;
          font-size: 0.7vw;
          text-transform: uppercase;
          transition: all 0.2s;
          white-space: nowrap;
          font-style: italic;
          box-shadow: 0 2vh 4vh rgba(0, 0, 0, 0.5);
        }

        .empire-register-send-button.empire-register-active { background-color: #333; color: #f1c40f; cursor: not-allowed; }
        .empire-register-send-button:not(.empire-register-active):hover { background-color: #ffcf1a; }

        /* Buttons */
        .empire-register-login-button {
          width: 100%;
          background-color: #f1c40f;
          color: black;
          font-weight: 900;
          padding: 1.8vh 0;
          border-radius: 0.5vw;
          font-size: 1.2vw;
          font-style: italic;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          margin-top: 1vh;
          box-shadow: 0 1.5vh 4vh rgba(241, 196, 15, 0.4);
        }
        
        .empire-register-login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .empire-register-chevron-icon { margin-left: 1.2vw; }

        .empire-register-login-button:hover:not(:disabled) { transform: scale(1.02); background-color: #ffcf1a; }
        .empire-register-login-button:active:not(:disabled) { transform: scale(0.98); }

        .empire-register-register-button {
          margin-top: 3.5vh;
          display: flex;
          align-items: center;
          gap: 1vw;
          padding: 1.5vh 2vw;
          background-color: rgba(0, 0, 0, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5vw;
          cursor: pointer;
          transition: all 0.2s;
        }

        .empire-register-register-text {
          font-weight: 900;
          font-style: italic;
          font-size: 0.7vw;
          color: white;
          text-transform: uppercase;
        }

        @keyframes empire-register-strong-tada {
          0% { opacity: 0; transform: scale(0.4) translateY(10vh); }
          30% { opacity: 1; transform: scale(1.2) translateY(-1.5vh) rotate(-8deg); }
          45% { transform: scale(1.1) rotate(8deg); }
          60% { transform: scale(1.1) rotate(-6deg); }
          75% { transform: scale(1.1) rotate(4deg); }
          90% { transform: scale(1.05) rotate(-2deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotate(0); }
        }

        @keyframes empire-register-fade-zoom {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        } 
      `}</style>
    </div>
  );
}

