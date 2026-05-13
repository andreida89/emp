import React, { useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';

const Icons = {
  Home: ({ size = 24, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  CheckCircle: ({ size = 24, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  AlertCircle: ({ size = 24, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
  Star: ({ size = 24, fill = "none", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  X: ({ size = 24, color = "currentColor", strokeWidth = 2 }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
};

function House(props: RouteComponentProps) {
  const state = (props.location.state as any) || {};
  
  const [locked, setLocked] = useState(state.locked || false);
  const [notification, setNotification] = useState<any>(null);
  const [owner, setOwner] = useState(state.owner || '');
  const [isOwner, setIsOwner] = useState(state.isOwner || false);

  const houseData = {
    id: state.index || 0,
    proprietar: owner || 'Niciunul',
    costZi: `${state.tax?.toLocaleString() || 0} RON`,
    pret: `${state.price?.toLocaleString() || 0} RON`,
    safe: `${state.inventory || 0} KG`,
    garaj: `${state.vehicles || 0} LOCURI`,
    tip: (state.type || 'low').toUpperCase(),
  };

  useEffect(() => {
    rpc.callClient('Browser-ToggleCursor', true);
    
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
        }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => {
        window.removeEventListener('keydown', handleEsc, true);
    };
  }, []);

  const playLockSound = () => {
    const audio = new Audio('https://empirerp.ro/doorlock.mp3');
    audio.play().catch(e => console.error("Eroare la redarea sunetului:", e));
  };

  const showNotify = (text: string, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleLock = async () => {
    try {
        const status: boolean = await rpc.callServer('House-ToggleLock');
        setLocked(status);
        playLockSound();
        showNotify(!status ? "CASA A FOST DESCHISA!" : "CASA A FOST INCHISA!", "success");
    } catch (err) {
        showNotify("ACCES INTERZIS!", "error");
    }
  };

  const trade = async () => {
    try {
        const isCurrentlyOwner = isOwner;
        await rpc.callServer('House-Trade');
        const newIsOwner = !isCurrentlyOwner;
        const newOwner = newIsOwner ? 'Tu (proprietar)' : '';
        setIsOwner(newIsOwner);
        setOwner(newOwner);

        showNotify(
            newIsOwner 
            ? 'FELICITARI PENTRU ACHIZITIE!' 
            : 'CASA A FOST VANDUTA CU SUCCES!', 
            'success'
        );
    } catch (err: any) {
        if (err.msg) showNotify(err.msg, 'error');
    }
  };

  const handleEnter = async () => {
    if (locked) {
      showNotify("CASA ESTE INCUIATA! TRAGE CHEIA PE INCUIETOARE PENTRU A O DESCHIDE", "error");
    } else {
      try {
          await rpc.callServer('House-ToEnter');
          rpc.callClient('Browser-HidePage');
      } catch (err) {
          showNotify("USA ESTE INCUIATA!", "error");
      }
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    toggleLock();
  };

  const renderStars = (tip: string) => {
    let starCount = 1;
    if (tip === 'PREMIUM') starCount = 3;
    else if (tip === 'MEDIUM' || tip === 'HIGH') starCount = 2;

    return (
      <div className="housepn-tier-stars">
        {[1, 2, 3].map((s) => (
          <Icons.Star 
            key={s} 
            size={12}
            fill={s <= starCount ? "#f1c40f" : "none"} 
            color={s <= starCount ? "#f1c40f" : "rgba(255,255,255,0.05)"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="housepn-wrapper">
      <style>{`
        .housepn-wrapper { width: 100vw !important; height: 100vh !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; background: radial-gradient(circle at 50% 50%, rgba(26, 26, 26, 0.9) 0%, rgba(5, 5, 5, 0.95) 100%) !important; position: relative !important; font-family: 'Inter', sans-serif !important; color: #fff !important; }
        
        .housepn-exit-btn {
          position: absolute !important;
          top: 1.5vw !important;
          right: 1.5vw !important;
          background-color: #ef4444 !important;
          color: white !important;
          border: none !important;
          padding: 0.4vw !important;
          border-radius: 0.5vw !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 1000 !important;
        }
        .housepn-exit-btn:hover {
          background-color: #dc2626 !important;
          transform: rotate(90deg) !important;
        }

        .housepn-house-container { display: flex !important; gap: 2vw !important; width: 75vw !important; perspective: 1000px !important; position: relative !important; margin-bottom: 3vw !important; }
        
        .housepn-house-panel { 
          flex: 1 !important; 
          background: #141414 !important; 
          border: 0.1vw solid rgba(255, 255, 255, 0.05) !important; 
          border-radius: 2vw !important; 
          overflow: hidden !important; 
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 1vw 4vw rgba(0,0,0,0.6) !important;
          position: relative !important;
        }
        
        .housepn-house-panel:hover { border-color: #f1c40f !important; transform: translateY(-0.5vw) !important; }

        .housepn-visual-area { position: relative !important; height: 20vw !important; overflow: hidden !important; background: #0a0a0a !important; display: flex !important; align-items: center !important; justify-content: center !important; }
        
        .housepn-visual-overlay { 
          position: absolute !important; inset: 0 !important; 
          background: linear-gradient(to top, #141414, transparent) !important; 
          display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; 
        }

        .housepn-keyhole-target {
          width: 15vw !important;
          height: 15vw !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          background: rgba(0,0,0,0.85) !important;
          border-radius: 50% !important;
          border: 0.4vw dashed ${locked ? '#ff3030' : '#22c55e'} !important;
          padding: 2vw !important;
          transition: 0.3s !important;
          box-shadow: 0 0 4vw rgba(0,0,0,1) !important;
        }
        .housepn-keyhole-target img {
          width: 100% !important;
          height: auto !important;
          filter: ${locked ? 'drop-shadow(0 0 15px #ff3030)' : 'drop-shadow(0 0 15px #22c55e)'} !important;
        }

        .housepn-stats-area { background: rgba(0,0,0,0.3) !important; border-top: 0.1vw solid rgba(255,255,255,0.03) !important; padding-bottom: 1.5vw !important; }
        .housepn-stats-row { display: flex !important; gap: 1vw !important; padding: 1.5vw 1.5vw 0.5vw 1.5vw !important; }
        .housepn-stat-box { flex: 1 !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 0.3vw !important; }
        .housepn-stat-box span { font-size: 0.6vw !important; font-weight: 900 !important; color: #666 !important; text-transform: uppercase !important; letter-spacing: 0.1vw !important; }
        .housepn-stat-box strong { font-size: 1.1vw !important; font-weight: 900 !important; color: #f1c40f !important; font-style: italic !important; }

        .housepn-tier-mini-badge {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          margin-top: 0.5vw !important;
        }
        .housepn-tier-mini-label { font-size: 0.5vw !important; font-weight: 900 !important; color: #333 !important; text-transform: uppercase !important; margin-bottom: 0.2vw !important; }
        .housepn-tier-stars { display: flex !important; flex-direction: row !important; gap: 0.4vw !important; align-items: center !important; justify-content: center !important; }

        .housepn-info-content { padding: 2.5vw !important; }
        .housepn-header-row { display: flex !important; justify-content: space-between !important; align-items: flex-start !important; margin-bottom: 2.5vw !important; }
        .housepn-header-row h2 { margin: 0 !important; font-size: 3.5vw !important; font-weight: 900 !important; font-style: italic !important; color: #f1c40f !important; line-height: 0.8 !important; }
        .housepn-sub-tag { font-size: 0.8vw !important; color: #666 !important; font-weight: 900 !important; display: block !important; margin-bottom: 0.5vw !important; }

        .housepn-info-row { display: flex !important; justify-content: space-between !important; padding: 0.8vw 0 !important; border-bottom: 0.1vw solid rgba(255,255,255,0.05) !important; }
        .housepn-info-label { color: #666 !important; font-weight: 900 !important; font-style: italic !important; font-size: 0.85vw !important; }
        .housepn-info-value { font-weight: 900 !important; font-style: italic !important; font-size: 1vw !important; color: #fff !important; }

        .housepn-actions { display: flex !important; gap: 1vw !important; margin-top: 2.5vw !important; }
        .housepn-btn { flex: 1 !important; padding: 1.2vw !important; border-radius: 1vw !important; font-weight: 900 !important; font-style: italic !important; font-size: 1.1vw !important; cursor: pointer !important; transition: 0.3s !important; border: none !important; text-transform: uppercase !important; }
        .housepn-btn-primary { background: #f1c40f !important; color: #000 !important; }
        .housepn-btn-secondary { background: #222 !important; color: #fff !important; }
        .housepn-btn-buy { background: #22c55e !important; color: #fff !important; }
        .housepn-btn:hover { transform: scale(1.05) !important; opacity: 0.9 !important; }

        .housepn-key-zone {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 0.5vw !important;
          position: relative !important;
        }
        .housepn-key-item {
          width: 16vw !important; 
          height: 12vw !important; 
          cursor: grab !important;
          transition: 0.2s !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .housepn-key-item img {
          width: 100% !important;
          height: auto !important;
          filter: drop-shadow(0 0 15px rgba(241, 196, 15, 0.6)) !important;
        }
        .housepn-key-item:active { cursor: grabbing !important; transform: scale(0.9) !important; }
        
        .housepn-key-hint { 
          font-size: 1.1vw !important; 
          font-weight: 900 !important; 
          font-style: italic !important; 
          color: #f1c40f !important; 
          text-transform: uppercase !important; 
          letter-spacing: 0.1vw !important;
          text-shadow: 0 0 10px rgba(0,0,0,0.5) !important;
        }

        .housepn-notif-container {
          position: fixed !important;
          bottom: 2vw !important;
          left: 2vw !important;
          z-index: 10000 !important;
        }

        .housepn-notif { 
          color: #fff !important; 
          padding: 1.2vw 2.5vw !important; 
          border-radius: 1.2vw !important; 
          font-weight: 900 !important; 
          font-style: italic !important; 
          display: flex !important; 
          align-items: center !important; 
          gap: 1.2vw !important; 
          box-shadow: 0 1.5vw 4vw rgba(0,0,0,0.6) !important; 
          animation: housepn-popIn 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55), housepn-tada 0.8s ease-in-out 0.3s !important;
          border-left: 0.6vw solid rgba(255,255,255,0.4) !important;
          font-size: 1vw !important;
        }
        .housepn-notif-success { background: #22c55e !important; }
        .housepn-notif-error { background: #ff3030 !important; }

        @keyframes housepn-popIn {
          0% { transform: scale(0) translateY(100px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes housepn-tada {
          0% { transform: scale(1); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
      `}</style>

      <button className="housepn-exit-btn" onClick={() => rpc.callClient('Browser-HidePage')}>
          <Icons.X size="1.2vw" strokeWidth={3} />
      </button>

      <div className="housepn-notif-container">
        {notification && (
          <div className={`housepn-notif ${notification.type === 'error' ? 'housepn-notif-error' : 'housepn-notif-success'}`}>
            {notification.type === 'error' ? <Icons.AlertCircle size={28} /> : <Icons.CheckCircle size={28} />}
            <span>{notification.text}</span>
          </div>
        )}
      </div>

      <div className="housepn-house-container">
        <div className="housepn-house-panel">
          <div className="housepn-visual-area">
            <div className="housepn-visual-overlay">
              <div 
                className="housepn-keyhole-target"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <img src="https://empirerp.ro/doorkeyhole.svg" alt="Incuietoare" />
              </div>
              <span style={{ 
                marginTop: '1.5vw', 
                fontWeight: 900, 
                fontSize: '1vw', 
                color: locked ? '#ff3030' : '#22c55e',
                textShadow: '0 0 15px rgba(0,0,0,0.9)',
                letterSpacing: '0.1vw'
              }}>
                {locked ? "CASA ESTE INCUIATA" : "CASA ESTE DESCHISA"}
              </span>
            </div>
          </div>
          
          <div className="housepn-stats-area">
            <div className="housepn-stats-row">
              <div className="housepn-stat-box">
                <span>DEPOZITARE</span>
                <strong>{houseData.safe}</strong>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }} />
              <div className="housepn-stat-box">
                <span>GARAJ</span>
                <strong>{houseData.garaj}</strong>
              </div>
            </div>
            
            <div className="housepn-tier-mini-badge">
              <span className="housepn-tier-mini-label">RATING</span>
              {renderStars(houseData.tip)}
            </div>
          </div>
        </div>

        <div className="housepn-house-panel">
          <div className="housepn-info-content">
            <div className="housepn-header-row">
              <div>
                <span className="housepn-sub-tag">ADMINISTRARE</span>
                <h2>CASA • {houseData.id}</h2>
              </div>
              <Icons.Home size={42} color="#f1c40f" style={{ opacity: 0.15 }} />
            </div>

            <div className="housepn-info-list">
              <div className="housepn-info-row">
                <span className="housepn-info-label">TIP</span>
                <span className="housepn-info-value" style={{ color: '#f1c40f' }}>{houseData.tip}</span>
              </div>
              <div className="housepn-info-row">
                <span className="housepn-info-label">PROPRIETAR</span>
                <span className="housepn-info-value">{houseData.proprietar.toUpperCase()}</span>
              </div>
              <div className="housepn-info-row">
                <span className="housepn-info-label">TAXA ZILNICA</span>
                <span className="housepn-info-value">{houseData.costZi}</span>
              </div>
              <div className="housepn-info-row" style={{ border: 'none' }}>
                <span className="housepn-info-label">PRET VANZARE</span>
                <span className="housepn-info-value" style={{ fontSize: '1.2vw', color: '#f1c40f' }}>{houseData.pret}</span>
              </div>
            </div>

            <div className="housepn-actions">
              <button className="housepn-btn housepn-btn-secondary" style={{ flex: 0.5 }} onClick={() => rpc.callClient('Browser-HidePage')}>IESI</button>
              <button className="housepn-btn housepn-btn-primary" onClick={handleEnter}>{state.entrance ? 'INTRA' : 'IESI'}</button>
              {isOwner ? (
                  <button className="housepn-btn housepn-btn-buy" onClick={trade}>VINDE</button>
              ) : (
                  <button 
                    className="housepn-btn housepn-btn-buy" 
                    disabled={!!owner} 
                    style={!!owner ? {opacity: 0.5, cursor: 'not-allowed'} : {}} 
                    onClick={trade}
                  >
                    CUMPARA
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="housepn-key-zone">
        <div 
          className="housepn-key-item"
          draggable="true"
          onDragStart={(e) => e.dataTransfer.setData("text", "key")}
        >
          <img src="https://empirerp.ro/cheie.png" alt="Cheie" />
        </div>
        <span className="housepn-key-hint">TRAGE CHEIA PENTRU ACCES</span>
      </div>
    </div>
  );
}

export default withRouter(House as any);

