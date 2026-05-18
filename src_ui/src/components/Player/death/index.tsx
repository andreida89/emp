import React, { useState, useEffect, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';

type Props = RouteComponentProps<{}, {}, { duration?: number; medics?: number }>;

const Death = (props: Props) => {
  const totalDeathTime = 1800; // 30 minutes
  const waitBeforeButton = 180; // 3 minutes
  
  const initialDuration = props.location.state?.duration;
  // If duration is passed (e.g. from server on reconnect), it's in ms remaining
  const initialRemaining = initialDuration !== undefined ? Math.floor(initialDuration / 1000) : totalDeathTime;
  const initialElapsed = Math.max(0, totalDeathTime - initialRemaining);
  const initialWait = Math.max(0, waitBeforeButton - initialElapsed);

  const [timeLeft, setTimeLeft] = useState(initialRemaining); 
  const [respawnTime, setRespawnTime] = useState(initialWait);
  const [showNotification, setShowNotification] = useState(false);

  const die = useCallback(() => {
    (window as any).isPlayerDead = false;
    rpc.callClient('Player-ClientDie');
  }, []);

  const sendHelpSignal = useCallback(() => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, []);

  useEffect(() => {
    rpc.register('Death-KeyEvent', (key: string) => {
      if (key === 'g') {
        sendHelpSignal();
      }
      if (key === 'e') {
        // We check respawnTime inside the listener or use a ref
        setRespawnTime(prev => {
          if (prev === 0) die();
          return prev;
        });
      }
    });

    return () => {
      rpc.unregister('Death-KeyEvent');
    };
  }, [die, sendHelpSignal]);

  useEffect(() => {
    (window as any).isPlayerDead = true;
    return () => {
      (window as any).isPlayerDead = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const keyCode = e.keyCode;
      
      // FORBIDDEN KEYS: ESC (27), F12 (123), F10 (121), F6 (117), T (84)
      if (keyCode === 27 || keyCode === 123 || keyCode === 121 || keyCode === 117 || keyCode === 84) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // ALLOW specific keys
      if (key === 'e' || key === 'g' || key === 'delete' || keyCode === 46) {
        if (key === 'g') sendHelpSignal();
        if (key === 'e' && respawnTime === 0) die();
        return;
      }

      // BLOCK everything else aggressively (Capture Phase)
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyDown, true);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          die(); // Auto respawn
          return 0;
        }
        return prev - 1;
      });
      setRespawnTime(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyDown, true);
    };
  }, [respawnTime, die, sendHelpSignal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pulsePath = "M0,30 L120,30 L130,10 L145,50 L160,5 L175,55 L185,30 L220,30 L230,20 L240,40 L250,30 L400,30";

  return (
    <div className="nd-death-screen">
      <div className="nd-background-overlay"></div>

      <div className="nd-main-content">
        <div className="nd-status-container-lesin">
          ESTI IN STARE DE LESIN
        </div>

        {/* Cronometru principal cu PANA LA DECES cu litere mari */}
        <div className="nd-timer-text">
          <span className="nd-timer-digits">{formatTime(timeLeft)}</span>
          <span className="nd-minute-label"> MINUTE PANA LA</span>
          <span className="nd-timer-label"> DECES</span>
        </div>

        <div className="nd-pulse-wrapper">
          <svg viewBox="0 0 400 60" className="nd-cardiogram-svg">
            <defs>
              <filter id="nd-strongGlow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <linearGradient id="nd-trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF3131" stopOpacity="0" />
                <stop offset="100%" stopColor="#FF3131" stopOpacity="1" />
              </linearGradient>
            </defs>

            <path 
              d={pulsePath}
              fill="none" 
              stroke="rgba(255, 215, 0, 0.15)" 
              strokeWidth="1.2"
            />

            <path 
              d={pulsePath}
              fill="none" 
              stroke="url(#nd-trailGradient)" 
              strokeWidth="3.5"
              pathLength="100"
              className="nd-pulse-trail-only"
              filter="url(#nd-strongGlow)"
            />
          </svg>
        </div>

        <div className="nd-button-group">
          <div 
            className={`nd-action-button nd-death-btn ${respawnTime > 0 ? 'nd-is-disabled' : 'nd-red-theme'}`}
            onClick={() => respawnTime === 0 && die()}
          >
            <div className="nd-key-cap">E</div>
            <div className="nd-label">
              ALEG MOARTEA {respawnTime > 0 && <span className="nd-countdown-white-text">{formatTime(respawnTime)}</span>}
            </div>
          </div>

          <div className="nd-action-button nd-yellow-theme nd-help-btn" onClick={sendHelpSignal}>
            <div className="nd-key-cap">G</div>
            <div className="nd-label">TRIMITE SEMNAL DE AJUTOR</div>
          </div>
        </div>
      </div>

      {showNotification && (
        <div className="nd-notification-toast">
          <div className="nd-toast-icon">!</div>
          <div className="nd-toast-text">Semnalul de ajutor a fost trimis</div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Montserrat:ital,wght@0,300;0,600;0,800;0,900;1,900&display=swap');

        .nd-death-screen {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
          color: white;
          user-select: none;
        }

        .nd-background-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
        }

        .nd-main-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .nd-status-container-lesin {
          font-family: 'Montserrat', sans-serif;
          font-size: 5.5vh;
          font-weight: 900;
          font-style: italic;
          color: #FFD700;
          margin-bottom: 1.5vh;
          text-shadow: 0 0 2vh rgba(255, 215, 0, 0.4);
          letter-spacing: 0.1vw;
          text-transform: uppercase;
        }

        .nd-timer-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 2.5vh;
          font-weight: 900;
          font-style: italic;
          margin-bottom: 3vh;
        }
        .nd-minute-label {
          color: #ffffff;
          text-transform: uppercase; /* Asigura litere mari */
        }

        .nd-timer-label {
          color: #FF3131;
          text-transform: uppercase; /* Asigura litere mari */
        }

        .nd-timer-digits {
          color: #FF3131;
        }

        .nd-pulse-wrapper {
          width: 16vw;
          height: 6vh;
          margin-bottom: 5vh;
        }

        .nd-cardiogram-svg {
          width: 100%;
          height: 100%;
        }

        .nd-pulse-trail-only {
          stroke-dasharray: 20, 100;
          stroke-dashoffset: 20;
          animation: nd-trailOnlyMove 3s linear infinite;
        }

        @keyframes nd-trailOnlyMove {
          0% { stroke-dashoffset: 20; }
          100% { stroke-dashoffset: -80; }
        }

        .nd-button-group {
          display: flex;
          flex-direction: row;
          gap: 1vw;
          align-items: center;
        }

        .nd-action-button {
          height: 6vh;
          min-width: 11vw;
          display: flex;
          align-items: center;
          padding: 0 0.8vw;
          border-radius: 0.5vh;
          border: 0.1vh solid rgba(255, 255, 255, 0.05);
          background: linear-gradient(180deg, rgba(20, 20, 20, 0.85) 0%, rgba(10, 10, 10, 0.95) 100%);
          cursor: pointer;
          box-shadow: none !important;
          outline: none !important;
        }

        .nd-key-cap {
          width: 3.2vh;
          height: 3.2vh;
          background: rgba(255, 255, 255, 0.03);
          border: 0.1vh solid rgba(255, 255, 255, 0.1);
          border-radius: 0.4vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 1.4vh;
          margin-right: 0.8vw;
        }

        .nd-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2vh;
          font-weight: 700;
          white-space: nowrap;
        }

        .nd-countdown-white-text {
          color: #FFFFFF;
          margin-left: 0.4vw;
        }

        .nd-death-btn .nd-label {
          color: #FF3131; /* Aceeasi culoare ca PANA LA DECES */
        }

        .nd-help-btn .nd-label {
          color: #FFD700; 
        }

        .nd-yellow-theme {
          background: linear-gradient(180deg, rgba(50, 40, 0, 0.8) 0%, rgba(25, 20, 0, 0.9) 100%);
          border-color: rgba(255, 215, 0, 0.3);
          box-shadow: none;
        }

        .nd-yellow-theme .nd-key-cap {
          color: #FFD700;
          border-color: rgba(255, 215, 0, 0.4);
        }

        .nd-red-theme {
          background: linear-gradient(180deg, rgba(60, 0, 0, 0.85) 0%, rgba(30, 0, 0, 0.95) 100%);
          border-color: rgba(255, 49, 49, 0.5);
          box-shadow: none !important;
        }

        .nd-red-theme .nd-key-cap {
          color: #FF3131;
          border-color: rgba(255, 49, 49, 0.5);
        }

        /* Opacitate crescuta pentru vizibilitate mai buna cand e dezactivat */
        .nd-death-btn.nd-is-disabled {
          border-color: rgba(255, 49, 49, 0.6);
          background: rgba(20, 0, 0, 0.4);
          cursor: default;
          box-shadow: none !important;
          outline: none !important;
        }

        .nd-death-btn.nd-is-disabled .nd-key-cap {
          color: #FF3131;
          border-color: rgba(255, 49, 49, 0.4);
        }

        .nd-notification-toast {
          position: absolute;
          bottom: 4vh;
          right: 2vw;
          background: rgba(10, 10, 10, 0.9);
          border-left: 0.4vh solid #FFD700;
          padding: 1.5vh 1.5vw;
          display: flex;
          align-items: center;
          gap: 1vw;
          z-index: 100;
          animation: nd-slideIn 0.3s ease-out;
        }

        .nd-toast-icon {
          background: #FFD700;
          color: black;
          width: 2.2vh;
          height: 2.2vh;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.4vh;
          font-family: 'Orbitron', sans-serif;
        }

        .nd-toast-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.3vh;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
        }

        @keyframes nd-slideIn {
          from { transform: translateX(120%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 1024px) {
          .nd-button-group { gap: 1.5vw; }
          .nd-action-button { min-width: 15vw; }
        }
      `}</style>
    </div>
  );
};

export default Death;
