import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import jobs from './data';

type Props = {} & RouteComponentProps;
type State = {
	name: string;
	level: number;
	progress: number;
	isWorking: boolean;
	selectedLevel: number;
};

// Pictograme SVG integrate
const Icons = {
  ChevronLeft: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  ChevronRight: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  )
};

export default function Job(props: Props) {
  const [state, setState] = useState<State>({
    name: 'waterfront',
    level: 0,
    progress: 0,
    selectedLevel: 0,
    isWorking: false
  });

  useEffect(() => {
    if (props.location.state) {
      const newState = props.location.state as State;
      setState({ ...newState, selectedLevel: newState.level });
    }
  }, [props.location.state]);

  // Blocează tasta ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const jobKey = state.name.toLowerCase();
  const jobData = jobs[jobKey] || { title: 'Unknown', description: '', requirements: '' };
  
  const displayProgress = state.selectedLevel < state.level ? 100 : (state.selectedLevel === state.level ? state.progress : 0);

  const nextLevel = () => {
    if (state.selectedLevel < 2) {
      setState(prev => ({ ...prev, selectedLevel: prev.selectedLevel + 1 }));
    }
  };

  const prevLevel = () => {
    if (state.selectedLevel > 0) {
      setState(prev => ({ ...prev, selectedLevel: prev.selectedLevel - 1 }));
    }
  };

  const startWork = async () => {
    try {
      await rpc.callServer('Jobs-StartWork', [state.name, state.selectedLevel]);
      closeMenu();
    } catch (err: any) {
      if (err.msg) showNotification('error', err.msg);
    }
  };

  const finishWork = () => {
    rpc.callClient('Job-FinishWork').then(closeMenu);
  };

  const closeMenu = () => {
    rpc.callClient('Browser-HidePage');
  };

  // Calcul pentru cercul de progres
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayProgress / 100) * circumference;

  return (
    <div className="ujob-app-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,900;1,400;1,900&display=swap');
        
        .ujob-app-wrapper { 
          width: 100vw; 
          height: 100vh; 
          background: radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.85) 0%, rgba(5, 5, 5, 0.95) 100%); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #fff; 
          font-family: 'Inter', sans-serif;
        }
        
        .ujob-interface-container { 
          width: 75vw; 
          max-width: 1100px; 
          height: auto; 
          display: flex; 
          flex-direction: column; 
          background: #050505; 
          padding: 2vw; 
          border-radius: 0.5vw; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.8); 
          animation: ujob-fadeIn 0.4s ease-out; 
        }
        
        .ujob-header { 
          display: flex; 
          align-items: baseline; 
          gap: 2vw; 
          margin-bottom: 1.2vw; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
          padding-bottom: 0.6vw; 
        }
        
        .ujob-header-title { 
          font-size: 3.5vw; 
          font-weight: 900; 
          color: #f1c40f; 
          font-style: italic; 
          letter-spacing: -0.2vw; 
          line-height: 0.8; 
          margin: 0; 
          text-transform: uppercase; 
        }
        
        .ujob-header-subtitle { 
          font-size: 1.6vw; 
          font-weight: 400; 
          color: #fff; 
          font-style: italic; 
          opacity: 0.5; 
          letter-spacing: 0.4vw; 
          text-transform: uppercase; 
        }
        
        .ujob-job-container { 
          display: flex; 
          gap: 2.2vw; 
          align-items: stretch; 
          min-height: 330px; 
          padding-bottom: 1.2vw; 
        }
        
        .ujob-job-left-panel { 
          width: 20vw; 
          background: #0d0d0d; 
          border: 1px solid rgba(255,255,255,0.05); 
          border-right: 0.4vw solid #f1c40f; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          position: relative; 
          border-radius: 0.4vw 0 0 0.4vw; 
        }
        
        .ujob-job-label-top { 
          position: absolute; 
          top: 1vw; 
          left: 1.2vw; 
          font-size: 0.65vw; 
          font-weight: 900; 
          color: #fff; 
          opacity: 0.7; 
          font-style: italic; 
          text-transform: uppercase;
        }
        
        .ujob-nav-arrow { 
          position: absolute; 
          top: 50%; 
          transform: translateY(-50%); 
          background: none; 
          border: none; 
          color: #f1c40f; 
          cursor: pointer; 
          transition: 0.2s; 
          padding: 0.6vw; 
          z-index: 10; 
        }
        
        .ujob-nav-arrow:hover { 
          color: #fff; 
          transform: translateY(-50%) scale(1.2); 
        }
        
        .ujob-nav-arrow.left { left: 0.3vw; }
        .ujob-nav-arrow.right { right: 0.3vw; }
        
        .ujob-circle-container { 
          position: relative; 
          width: 10vw; 
          height: 10vw; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        }
        
        .ujob-circle-svg { 
          transform: rotate(-90deg); 
          width: 100%; 
          height: 100%; 
        }
        
        .ujob-circle-bg { 
          fill: none; 
          stroke: rgba(255,255,255,0.05); 
          stroke-width: 10; 
        }
        
        .ujob-circle-bar { 
          fill: none; 
          stroke: #f1c40f; 
          stroke-width: 10; 
          stroke-dasharray: ${circumference}; 
          stroke-dashoffset: ${offset}; 
          stroke-linecap: round; 
          transition: 0.5s; 
        }
        
        .ujob-circle-content { 
          position: absolute; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
        }
        
        .ujob-level-num { 
          font-size: 3.5vw; 
          font-weight: 900; 
          line-height: 1; 
          font-style: italic; 
        }
        
        .ujob-level-text { 
          font-size: 0.9vw; 
          font-weight: 900; 
          color: #f1c40f; 
          text-transform: uppercase; 
          margin-top: -0.3vw; 
          font-style: italic; 
        }
        
        .ujob-job-right-panel { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          padding: 0.6vw 0; 
        }
        
        .ujob-section-title { 
          color: #f1c40f; 
          font-size: 0.85vw; 
          font-weight: 900; 
          font-style: italic; 
          letter-spacing: 0.2vw; 
          margin-bottom: 0.3vw; 
          text-transform: uppercase; 
        }
        
        .ujob-cerinta-valoare { 
          font-size: 1.4vw; 
          font-weight: 700; 
          color: #fff; 
          margin-bottom: 1vw; 
          font-style: italic; 
        }
        
        .ujob-descriere-container { 
          flex: 1; 
          overflow-y: auto; 
          padding-right: 1.2vw; 
        }
        
        .ujob-descriere-text { 
          font-size: 1.25vw; 
          font-weight: 400; 
          color: rgba(255,255,255,0.8); 
          line-height: 1.5; 
          font-style: italic; 
          white-space: pre-line; 
        }
        
        .ujob-actions-row { 
          display: flex; 
          justify-content: center; 
          gap: 1.5vw; 
          margin-top: 1.2vw; 
        }
        
        .ujob-btn-gta { 
          padding: 0.6vw 2.5vw; 
          border: none; 
          font-weight: 900; 
          font-size: 1.2vw; 
          font-style: italic; 
          text-transform: uppercase; 
          cursor: pointer; 
          transition: 0.2s; 
          border-radius: 0.3vw; 
        }
        
        .ujob-btn-primary { background: #f1c40f; color: #000; }
        .ujob-btn-secondary { background: #ff3030; color: #fff; }
        
        .ujob-btn-gta:hover { 
          transform: scale(1.05); 
          filter: brightness(1.1); 
        }
        
        .ujob-descriere-container::-webkit-scrollbar { width: 0.2vw; }
        .ujob-descriere-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .ujob-descriere-container::-webkit-scrollbar-thumb { background: #f1c40f; border-radius: 1vw; }
        
        @keyframes ujob-fadeIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
      `}</style>

      <div className="ujob-interface-container">
        <div className="ujob-header">
          <h1 className="ujob-header-title">JOB</h1>
          <h2 className="ujob-header-subtitle">INFORMATII</h2>
        </div>

        <div className="ujob-job-container">
          <div className="ujob-job-left-panel">
            <div className="ujob-job-label-top">{jobData.title}</div>
            
            <button className="ujob-nav-arrow left" onClick={prevLevel}>
              <Icons.ChevronLeft size={34} />
            </button>
            
            <div className="ujob-circle-container">
              <svg className="ujob-circle-svg" viewBox="0 0 160 160">
                <circle className="ujob-circle-bg" cx="80" cy="80" r="70" />
                <circle className="ujob-circle-bar" cx="80" cy="80" r="70" />
              </svg>
              <div className="ujob-circle-content">
                <span className="ujob-level-num">{state.selectedLevel + 1}</span>
                <span className="ujob-level-text">Nivel</span>
              </div>
            </div>

            <button className="ujob-nav-arrow right" onClick={nextLevel}>
              <Icons.ChevronRight size={34} />
            </button>
          </div>

          <div className="ujob-job-right-panel">
            <div className="ujob-section-title">CERINTE</div>
            <div className="ujob-cerinta-valoare">{jobData.requirements}</div>

            <div className="ujob-descriere-container">
              <div className="ujob-descriere-text">
                {jobData.description}
              </div>
            </div>
 
            <div className="ujob-actions-row">
              <button className="ujob-btn-gta ujob-btn-secondary" onClick={closeMenu}>INCHIDE</button>
              <button 
                className="ujob-btn-gta ujob-btn-primary" 
                disabled={state.selectedLevel > state.level}
                onClick={() => (state.isWorking ? finishWork() : startWork())}
              > 
                {state.isWorking ? 'DEMISIONEAZA' : (state.selectedLevel > state.level ? 'NIVEL BLOCAT' : 'ANGAJEAZA-TE')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
