import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';

type Props = {} & RouteComponentProps;

const Spawn = (props: Props) => {
  const [progress, setProgress] = useState(0);
  const [statusText] = useState('SINCRONIZARE DATE JUCATOR');

  const locationState = props.location.state as { jail?: boolean; exit?: boolean } | undefined;
  const jail = locationState?.jail || false;
  const exit = locationState?.exit !== undefined ? locationState.exit : true;

	useEffect(() => {
		const preventEsc = (e: KeyboardEvent) => {
			if (e.keyCode === 27) {
				e.preventDefault();
				e.stopPropagation();
			}
		};
		window.addEventListener('keydown', preventEsc, true);
		window.addEventListener('keyup', preventEsc, true);
		return () => {
			window.removeEventListener('keydown', preventEsc, true);
			window.removeEventListener('keyup', preventEsc, true);
		};
	}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        const diff = Math.random() * 5;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      if (!(jail && !exit)) {
        const to = setTimeout(() => {
           rpc.callServer('Spawn-SelectType', ['exit']);
        }, 500);
        return () => clearTimeout(to);
      }
    }
  }, [progress, jail, exit]);

  return (
    <div className="empire-spawn-main-container">
      {/* BACKGROUND IMAGE CU OVERLAY */}
      <div className="empire-spawn-bg-image" />
      <div className="empire-spawn-bg-overlay" />
      
      {/* ELEMENTE DECORATIVE - SCANLINE & VIGNETTE */}
      <div className="empire-spawn-decor-overlay" />

      {/* CENTER CONTENT */}
      <div className="empire-spawn-content-wrapper">
        
        <h1 className="empire-spawn-main-title">
            EMPIRE <span className="empire-spawn-text-white">ROMANIA</span>
        </h1>

        {/* SUBTITLU CU LINII */}
        <div className="empire-spawn-subtitle-container">
          <div className="empire-spawn-line-left" />
          <span className="empire-spawn-subtitle-text">
            A D V A N C E D &nbsp; R O L E P L A Y
          </span>
          <div className="empire-spawn-line-right" />
        </div>

        {/* LOADING BAR SECTION */}
        <div className="empire-spawn-loading-section">
          <div className="empire-spawn-loading-header">
            <span className="empire-spawn-status-text">
                {statusText}
            </span>
            <span className="empire-spawn-percent-text">
                {Math.round(progress)}<span className="empire-spawn-yellow-text">%</span>
            </span>
          </div>
          
          {/* MAIN BAR CONTAINER */}
          <div className="empire-spawn-bar-container">
            <div 
              className="empire-spawn-bar-fill"
              style={{ width: `${progress}%` }}
            >
                <div className="empire-spawn-bar-glow" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .empire-spawn-main-container * { box-sizing: border-box; padding: 0; margin: 0; }

        .empire-spawn-main-container {
          width: 100vw;
          height: 100vh;
          background-color: black;
          color: white;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          user-select: none;
          font-family: 'Inter', sans-serif;
        }

        .empire-spawn-bg-image {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url(https://empirerp.eu/bglogin.jpg);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: transform 10000ms;
          transform: scale(1.1);
          animation: empire-spawn-pulse-slow 15s infinite ease-in-out;
        }

        .empire-spawn-bg-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(to top, black, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.7));
        }

        .empire-spawn-decor-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0.2;
          pointer-events: none;
          background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), 
                      linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,118,0.06));
          background-size: 100% 0.2vh, 0.3vw 100%;
        }

        .empire-spawn-content-wrapper {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 5vw;
        }

        .empire-spawn-main-title {
          font-size: 6vw;
          font-weight: 900;
          font-style: italic;
          line-height: 1;
          letter-spacing: -0.15vw;
          color: #f1c40f;
          filter: drop-shadow(0 0.8vh 2vh rgba(0,0,0,0.8));
          margin: 0;
        }

        .empire-spawn-text-white {
          color: white;
        }

        .empire-spawn-subtitle-container {
          display: flex;
          align-items: center;
          gap: 0.8vw;
          margin-top: 1.5vh;
          margin-bottom: 3vh;
        }

        .empire-spawn-line-left, .empire-spawn-line-right {
          height: 0.15vh;
          width: 3vw;
          opacity: 0.7;
        }

        .empire-spawn-line-left {
          background: linear-gradient(to right, transparent, #f1c40f);
        }

        .empire-spawn-line-right {
          background: linear-gradient(to left, transparent, #f1c40f);
        }

        .empire-spawn-subtitle-text {
          font-size: 0.9vw;
          font-weight: 900;
          font-style: italic;
          letter-spacing: 0.4vw;
          color: rgba(255,255,255,0.9);
        }

        .empire-spawn-loading-section {
          width: 40vw;
          margin-top: 3vh;
        }

        .empire-spawn-loading-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1vh;
        }

        .empire-spawn-status-text {
          font-size: 0.8vw;
          font-weight: 900;
          font-style: italic;
          letter-spacing: 0.2vw;
          color: #f1c40f;
          text-transform: uppercase;
          animation: empire-spawn-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .empire-spawn-percent-text {
          font-size: 1.8vw;
          font-weight: 900;
          font-style: italic;
          color: white;
          line-height: 1;
        }

        .empire-spawn-yellow-text {
          color: #f1c40f;
        }

        .empire-spawn-bar-container {
          height: 2.2vh;
          width: 100%;
          background-color: rgba(255,255,255,0.05);
          border-radius: 5vh;
          border: 0.1vw solid rgba(255,255,255,0.1);
          padding: 0.4vh;
          overflow: hidden;
          backdrop-filter: blur(0.4vw);
          box-shadow: 0 1.5vh 4vh rgba(0,0,0,0.5);
        }

        .empire-spawn-bar-fill {
          height: 100%;
          background-color: #f1c40f;
          border-radius: 5vh;
          transition: all 300ms ease-out;
          position: relative;
        }

        .empire-spawn-bar-glow {
          position: absolute;
          inset: 0;
          box-shadow: 0 0 2vw rgba(241,196,15,0.6);
        }

        @keyframes empire-spawn-pulse-slow {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }

        @keyframes empire-spawn-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Spawn;
