import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';

const Icons = {
  Mail: ({ size = 24, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Lock: ({ size = 24, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
  ShieldCheck: ({ size = 24, className = "", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="M9 12l2 2 4-4"></path>
    </svg>
  ),
  ChevronRight: ({ size = 24, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Eye: ({ size = 24, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  EyeOff: ({ size = 24, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ),
  UserPlus: ({ size = 24, className = "", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
  ),
  Key: ({ size = 24, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
    </svg>
  )
};

type Props = {
	setEmail: (email: string) => void;
	openForm: (name: any) => void;
	email: string;
	password?: string;
};

export default function Login({ setEmail, openForm, email: initialEmail = '', password: initialPassword = '' }: Props) {
  const [email, setEmailState] = useState(initialEmail);
  const [password, setPasswordState] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!initialPassword);
  
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Folosim useEffect pentru a prelua valorile initiale cand ajung de la parinte
  useEffect(() => {
  	if (initialEmail) setEmailState(initialEmail);
  	if (initialPassword) {
  		setPasswordState(initialPassword);
  		setRememberMe(true);
  	}
  }, [initialEmail, initialPassword]);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email) {
      showNotice('error', 'Completati campul email!');
      return;
    }

    if (!password) {
      showNotice('error', 'Completati campul parola!');
      return;
    }

    setIsSubmitting(true);

    rpc.callClient('Auth-SaveCredentials', rememberMe ? {
        email: email,
        password: password
    } : null);

    rpc
        .callServer('Auth-SignIn', [email, password])
        .then(() => {
            rpc.callClient('Auth-SuccessLogin', email);
            setIsSubmitting(false);
        })
        .catch((err: any) => {
            if (err.confirm) {
                setEmail(email);
                openForm('confirm');
                setIsSubmitting(false);
                return;
            }
            showNotice('error', err.message || 'A apărut o eroare la autentificare');
            setIsSubmitting(false);
        });
  };

  return (
    <div className="empire-login-main-container">
      
      {/* Notificări */}
      {notification && (
        <div className={`empire-login-notification-box ${notification.type === 'success' ? 'empire-login-success' : 'empire-login-error'}`}>
          <div className="empire-login-notification-content">
            <span className="empire-login-notification-title">
              {notification.type === 'success' ? 'Succes' : 'Eroare'}
            </span>
            <span className="empire-login-notification-message">
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Imagine de Fundal */}
      <div 
        className="empire-login-background-image"
        style={{
          backgroundImage: `url('https://empirerp.eu/bglogin.jpg')`
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="empire-login-background-overlay" />

      {/* Container Central Login */}
      <div className="empire-login-wrapper">
        
        {/* LOGO / HEADER */}
        <div className="empire-login-header-section">
          <h1 className="empire-login-main-title">AUTENTIFICARE</h1>
          <div className="empire-login-subtitle-container">
            <div className="empire-login-line" />
            <span className="empire-login-subtitle-text">EMPIRE ROMANIA ROLEPLAY</span>
            <div className="empire-login-line" />
          </div>
        </div>

        {/* FORMULAR */}
        <form onSubmit={handleLogin} className="empire-login-form">
          <div className="empire-login-form-content">
            
            {/* Input Email */}
            <div className="empire-login-input-group">
              <div className="empire-login-input-wrapper">
                <div className="empire-login-input-icon">
                  <Icons.Mail 
                    size={14} 
                    strokeWidth={2.5} 
                    className="empire-login-crisp-icon" 
                  />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmailState(e.target.value)}
                  placeholder="INTRODU EMAIL-UL"
                  className="empire-login-custom-input"
                  required
                />
              </div>
            </div>

            {/* Input Parolă */}
            <div className="empire-login-input-group">
              <div className="empire-login-input-wrapper">
                <div className="empire-login-input-icon">
                  <Icons.Lock 
                    size={14} 
                    strokeWidth={2.5} 
                    className="empire-login-crisp-icon" 
                  />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPasswordState(e.target.value)}
                  placeholder="INTRODU PAROLA"
                  className="empire-login-custom-input empire-login-password-padding"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="empire-login-eye-button"
                >
                  {showPassword ? (
                    <Icons.EyeOff size={14} strokeWidth={2.5} className="empire-login-crisp-icon" />
                  ) : (
                    <Icons.Eye size={14} strokeWidth={2.5} className="empire-login-crisp-icon" />
                  )}
                </button>
              </div>
            </div>

            <div className="empire-login-form-actions">
              <label className="empire-login-remember-me" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`empire-login-checkbox ${rememberMe ? 'empire-login-checked' : ''}`}>
                  {rememberMe && <Icons.ShieldCheck size={14} color="black" />}
                </div>
                <span className="empire-login-action-text">Retine parola</span>
              </label>
              
              <button type="button" className="empire-login-recovery-button" onClick={() => openForm('forgot')}>
                <Icons.Key size={14} />
                Recuperare parola
              </button>
            </div>

            <button type="submit" className="empire-login-login-button" disabled={isSubmitting}>
              INTRA IN JOC
              <Icons.ChevronRight size={24} className="empire-login-chevron-icon" />
            </button>
          </div>
        </form>

        <button 
          onClick={() => openForm('register')}
          className="empire-login-register-button"
        >
          <Icons.UserPlus size={20} color="#f1c40f" />
          <span className="empire-login-register-text">Inregistrare cont nou</span>
        </button>

      </div>

      <style>{`
        /* Reset & Base */
        .empire-login-main-container * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .empire-login-main-container {
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

        /* Notificări */
        .empire-login-notification-box {
          position: fixed;
          bottom: 5vh;
          right: 2.5vw;
          z-index: 100;
          width: 17vw;
          min-height: 9vh;
          padding: 1.8vh 1.1vw;
          border-radius: 0.6vw;
          box-shadow: 0 2.5vh 6vh rgba(0, 0, 0, 0.9);
          animation: empire-login-strong-tada 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .empire-login-notification-box.empire-login-success {
          background-color: #2ecc71;
          color: black;
          box-shadow: 0 1.5vh 4vh rgba(46, 204, 113, 0.6);
        }

        .empire-login-notification-box.empire-login-error {
          background-color: #ff1a1a;
          color: white;
          box-shadow: 0 1.5vh 4vh rgba(255, 26, 26, 0.6);
        }

        .empire-login-notification-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .empire-login-notification-title {
          display: block;
          width: 100%;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: 0.1vw;
          font-size: 0.7vw;
          line-height: 1.2;
        }

        .empire-login-notification-message {
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
        .empire-login-background-image {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.5;
          background-size: cover;
          background-position: center;
          filter: brightness(0.7) contrast(110%);
        }

        .empire-login-background-overlay {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%, rgba(0,0,0,0.4));
        }

        /* Layout Central */
        .empire-login-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          width: 100%;
          max-width: 25vw;
          animation: empire-login-fade-zoom 0.7s ease-out;
        }

        @keyframes empire-login-fade-zoom {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .empire-login-header-section {
          text-align: center;
          margin-bottom: 5vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empire-login-main-title {
          font-size: 2vw;
          font-weight: 900;
          color: #f1c40f;
          font-style: italic;
          text-transform: uppercase;
          filter: drop-shadow(0 0.5vh 1.5vh rgba(0, 0, 0, 0.8));
        }

        .empire-login-subtitle-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8vw;
        }

        .empire-login-line {
          height: 2px;
          width: 2vw;
          background-color: #f1c40f;
        }

        .empire-login-subtitle-text {
          color: white;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 0.55vw;
        }

        /* Formular */
        .empire-login-form {
          width: 100%;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empire-login-form-content {
          width: 85%;
          display: flex;
          flex-direction: column;
          gap: 2vh;
        }

        .empire-login-input-group {
          display: flex;
          flex-direction: column;
          gap: 1vh;
        }

        .empire-login-input-wrapper {
          position: relative;
          height: 5.5vh;
          width: 100%;
        }

        .empire-login-input-icon {
          position: absolute;
          left: 1vw;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          color: #f1c40f;
          display: flex;
          align-items: center;
        }

        .empire-login-custom-input {
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

        .empire-login-custom-input:-webkit-autofill,
        .empire-login-custom-input:-webkit-autofill:hover, 
        .empire-login-custom-input:-webkit-autofill:focus, 
        .empire-login-custom-input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s !important;
          -webkit-text-fill-color: #f1c40f !important;
        }

        .empire-login-custom-input::placeholder {
          color: rgba(241, 196, 15, 0.7);
        }

        .empire-login-custom-input:focus {
          border-color: #f1c40f;
          box-shadow: 0 0 2.5vh rgba(241, 196, 15, 0.2);
        }

        .empire-login-password-padding {
          padding-right: 2.5vw;
        }

        .empire-login-eye-button {
          position: absolute;
          right: 1vw;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          color: #f1c40f;
          opacity: 0.8;
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empire-login-eye-button:hover { opacity: 1; }

        /* Actiuni Formular */
        .empire-login-form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 0.5vw;
          width: 100%;
          gap: 2vw;
        }

        .empire-login-remember-me {
          display: flex;
          align-items: center;
          gap: 0.8vw;
          cursor: pointer;
          white-space: nowrap;
        }

        .empire-login-checkbox {
          width: 1vw;
          height: 1vw;
          border-radius: 0.2vw;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .empire-login-checkbox.empire-login-checked {
          background-color: #f1c40f;
          border-color: #f1c40f;
        }

        .empire-login-remember-me:hover .empire-login-checkbox {
          border-color: #f1c40f;
        }

        .empire-login-action-text {
          font-size: 0.75vw;
          font-weight: 900;
          font-style: italic;
          color: white;
          text-transform: uppercase;
          transition: color 0.2s;
          filter: drop-shadow(0 0.5vh 1vh rgba(0,0,0,0.5));
        }

        .empire-login-remember-me:hover .empire-login-action-text {
          color: #f1c40f;
        }

        .empire-login-recovery-button {
          background: none;
          border: none;
          color: #f1c40f;
          font-size: 0.75vw;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.3vw;
          cursor: pointer;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .empire-login-recovery-button:hover { color: white; }

        /* Butoane principale */
        .empire-login-login-button {
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
        
        .empire-login-login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .empire-login-chevron-icon { margin-left: 1.2vw; }

        .empire-login-login-button:hover:not(:disabled) { transform: scale(1.02); background-color: #ffcf1a; }

        .empire-login-login-button:active:not(:disabled) { transform: scale(0.98); }

        .empire-login-register-button {
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

        .empire-login-register-text {
          font-weight: 900;
          font-style: italic;
          font-size: 0.7vw;
          color: white;
          text-transform: uppercase;
        }

        /* Utilitare */
        .empire-login-crisp-icon {
          image-rendering: crisp-edges;
          shape-rendering: geometricPrecision;
        }

        @keyframes empire-login-strong-tada {
          0% { opacity: 0; transform: scale(0.4) translateY(10vh); }
          30% { opacity: 1; transform: scale(1.2) translateY(-1.5vh) rotate(-8deg); }
          45% { transform: scale(1.1) rotate(8deg); }
          60% { transform: scale(1.1) rotate(-6deg); }
          75% { transform: scale(1.1) rotate(4deg); }
          90% { transform: scale(1.05) rotate(-2deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotate(0); }
        }
      `}</style>
    </div>
  );
}
