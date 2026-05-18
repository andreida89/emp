import React, { useState, useEffect, useCallback } from 'react';
import { isEqual } from 'lodash';
import classNames from 'classnames';
import rpc from 'utils/rpc';
import prettify from 'utils/prettify';
import Point from 'components/Common/point';
import withRotation from 'components/Common/with-rotation';
import vehicles from 'data/vehicles.json';

const Icons = {
  Gauge: ({ size = "1.2vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
  ),
  Zap: ({ size = "1.2vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Disc: ({ size = "1.2vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Activity: ({ size = "1.2vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  ChevronLeft: ({ size = "2.8vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  ChevronRight: ({ size = "2.8vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  Package: ({ size = "1.2vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
  ),
  Droplet: ({ size = "1.2vw", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
  ),
  MouseRotate: ({ size = "32px", color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="8" y="7" width="8" height="11" rx="2.5" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="7" x2="12" y2="12" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.5" />
      <path d="M10.5 7H10C9.17157 7 8.5 7.67157 8.5 8.5V12H12V7H10.5Z" fill={color} />
      <path d="M12 3.5L10 5.5H14L12 3.5Z" fill={color} />
      <path d="M12 21.5L14 19.5H10L12 21.5Z" fill={color} />
      <path d="M4 12.5L6 10.5V14.5L4 12.5Z" fill={color} />
      <path d="M20 12.5L18 14.5V10.5L20 12.5Z" fill={color} />
    </svg>
  )
};

const STAT_ITEMS: { [name: string]: { label: string, icon: React.ReactNode } } = {
  speed: { label: 'VITEZA', icon: <Icons.Gauge /> },
  acceleration: { label: 'ACCELERATIE', icon: <Icons.Zap /> },
  brakes: { label: 'FRANARE', icon: <Icons.Disc /> },
  clutch: { label: 'MANEVRABILITATE', icon: <Icons.Activity /> }
};

const colors = [
	[25, 67, 214],
	[109, 207, 246],
	[255, 255, 255],
	[0, 0, 0],
	[60, 184, 120],
	[237, 28, 36],
	[0, 33, 87],
	[135, 129, 189],
	[252, 230, 56],
	[255, 0, 130],
	[210, 87, 214],
	[149, 149, 149]
];

type SpecState = {
  speed: number;
  acceleration: number;
  brakes: number;
  clutch: number;
};

type InfoState = {
  tank: number;
  trunk: {
    cells: number;
    slots: number;
  };
};

function VehicleShop(props: any) {
  const locState = props.location?.state || {};
  
  const [type, setType] = useState(locState.type || 'vehicle_shop');
  const [prices, setPrices] = useState<Record<string, number>>(locState.prices || {});
  
  const [selectedVeh, setSelectedVeh] = useState(() => {
    const keys = Object.keys(locState.prices || {});
    return keys.length > 0 ? keys[0] : '';
  });
  
  const [color, setColor] = useState([255, 255, 255]);
  const [notification, setNotification] = useState<{text: string, type: string} | null>(null);

  const [specState, setSpecState] = useState<SpecState>({ speed: 0, acceleration: 0, brakes: 0, clutch: 0 });
  const [infoState, setInfoState] = useState<InfoState>({ tank: 0, trunk: { cells: 0, slots: 0 } });

  useEffect(() => {
    const newType = locState.type || 'vehicle_shop';
    const newPrices = locState.prices || {};
    
    setType(newType);
    setPrices(newPrices);
    
    const keys = Object.keys(newPrices);
    if (keys.length > 0 && !keys.includes(selectedVeh)) {
      setSelectedVeh(keys[0]);
    }
  }, [locState]);

  useEffect(() => {
    if (!selectedVeh) return;
    rpc.callClient('Vehicle-GetSpec', selectedVeh).then((data: SpecState) => {
      if (data) setSpecState(data);
    }).catch(() => {});
    
    rpc.callServer('Vehicle-GetInfo', selectedVeh).then((data: InfoState) => {
      if (data) setInfoState(data);
    }).catch(() => {});
  }, [selectedVeh]);

  const showNotify = (text: string, notifType = 'success') => {
    setNotification({ text, type: notifType });
    setTimeout(() => setNotification(null), 4000);
  };

  const close = useCallback(() => {
    rpc.callClient('VehicleShop-Exit');
  }, []);

  const selectVehicle = (name: string) => {
    setSelectedVeh(name);
  };

  const selectColor = (newColor: number[]) => {
    setColor(newColor);
    rpc.callClient('VehicleShop-ChangeColor', [newColor]);
  };

  useEffect(() => {
    if (selectedVeh) {
       rpc.callClient('VehicleShop-SetVehicle', selectedVeh);
       
       const timer = setTimeout(() => {
         rpc.callClient('VehicleShop-ChangeColor', [color]);
       }, 500);
       
       return () => clearTimeout(timer);
    }
  }, [selectedVeh]);

  const buy = (paymentType: string) => {
    rpc.callServer('VehicleShop-Buy', [type, selectedVeh, color, paymentType])
      .then(() => {
        showNotify('ACHIZITIE REUSITA! FELICITARI PENTRU NOUL VEHICUL!', 'success');
      })
      .catch((err: any) => {
        const msg = typeof err === 'string' ? err : (err && err.message ? err.message : 'Erore la achizitie!');
        showNotify(msg, 'error');
      });
  };

  const startTestDrive = () => {
    rpc.callClient('VehicleShop-TestDrive', selectedVeh);
    showNotify('TEST DRIVE PORNIT!', 'success');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft' || e.key === 'A' || e.key === 'a') {
        const keys = Object.keys(prices);
        if (keys.length === 0) return;
        const index = keys.indexOf(selectedVeh);
        const prev = index <= 0 ? keys[keys.length - 1] : keys[index - 1];
        selectVehicle(prev);
      }
      if (e.key === 'ArrowRight' || e.key === 'D' || e.key === 'd') {
        const keys = Object.keys(prices);
        if (keys.length === 0) return;
        const index = keys.indexOf(selectedVeh);
        const next = index === keys.length - 1 ? keys[0] : keys[index + 1];
        selectVehicle(next);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prices, selectedVeh, close]);

  return (
    <div className="vshop-wrapper">
      <style>{`
        .vshop-wrapper { 
          width: 100vw; height: 100vh; 
          background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%); 
          position: absolute; 
          top: 0; left: 0; z-index: 9999; pointer-events: none;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 3vw;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif; color: #fff;
        }
        .vshop-wrapper > * { pointer-events: auto; }

        /* TOP SECTION */
        .vshop-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .vshop-logo-area { display: flex; flex-direction: column; }
        .vshop-logo-area h1 { margin: 0; font-size: 3vw; font-weight: 900; font-style: italic; color: #f1c40f; line-height: 0.9; text-transform: uppercase; }
        .vshop-logo-area span { font-size: 0.9vw; font-weight: 900; color: rgba(255,255,255,0.5); letter-spacing: 0.3vw; margin-top: 0.3vw; }

        .vshop-close-btn {
          background: #ff3030; color: #fff; width: 2.5vw; height: 2.5vw;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 1vw; border-radius: 0.6vw;
          cursor: pointer; border: 0.1vw solid rgba(255, 255, 255, 0.2);
          transition: transform 0.5s ease-in-out, background 0.2s, box-shadow 0.2s;
        }
        .vshop-close-btn:hover { 
          background: #ff1010; 
          transform: scale(1.1) rotate(360deg); 
          box-shadow: 0 0 2vw rgba(255, 48, 48, 0.4); 
        }

        /* RIGHT SECTION: COLORS - Fara background */
        .vshop-color-picker {
          position: absolute; right: 3vw; top: 45%; transform: translateY(-50%);
          background: transparent;
          padding: 1vw; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8vw;
        }
        .vshop-color-title { 
          grid-column: span 2; font-size: 0.7vw; font-weight: 900; color: #fff; 
          text-align: center; text-transform: uppercase; margin-bottom: 0.5vw;
          text-shadow: 0 0.1vw 0.5vw rgba(0,0,0,1), 0 0 0.2vw rgba(0,0,0,1);
        }
        .vshop-color-node { 
          width: 2.2vw; height: 2.2vw; border-radius: 0.5vw; cursor: pointer; transition: 0.2s; 
          border: 0.15vw solid rgba(255,255,255,0.4);
          box-shadow: 0 0.2vw 1vw rgba(0,0,0,0.5);
        }
        .vshop-color-node.active { border: 0.15vw solid #f1c40f; box-shadow: 0 0 1vw rgba(241, 196, 15, 0.8); }

        /* LEFT MIDDLE SIDE STATS */
        .vshop-side-left-stats {
          position: absolute; left: 3vw; top: 50%; transform: translateY(-50%);
          width: 22vw; display: flex; flex-direction: column; gap: 2.5vw;
        }
        .vshop-stats-grid { width: 100%; display: flex; flex-direction: column; gap: 1.2vw; }
        .vshop-stat-item { width: 100%; }
        .vshop-stat-info { display: flex; justify-content: space-between; margin-bottom: 0.4vw; align-items: center; }
        .vshop-stat-info span { font-size: 0.75vw; font-weight: 900; color: #fff; font-style: italic; display: flex; align-items: center; gap: 0.5vw; text-shadow: 0 0.2vw 0.5vw rgba(0,0,0,0.8); }
        .vshop-stat-info strong { font-size: 0.9vw; font-weight: 900; color: #f1c40f; text-shadow: 0 0.2vw 0.5vw rgba(0,0,0,0.8); }
        
        .vshop-bar-container { 
            height: 0.45vw; 
            background: rgba(255, 255, 255, 0.25); 
            border-radius: 1vw; 
            overflow: hidden;
            box-shadow: inset 0 0 0.5vw rgba(0,0,0,0.3);
            border: 0.05vw solid rgba(255,255,255,0.1);
        }
        .vshop-bar-fill { 
            height: 100%; 
            background: #f1c40f; 
            box-shadow: 0 0 1.2vw rgba(241, 196, 15, 0.7); 
            border-radius: 1vw;
        }

        /* CAPACITY CARDS */
        .vshop-capacity-row { display: flex; gap: 1vw; width: 100%; }
        .vshop-cap-card { 
          flex: 1; background: transparent; border: none; backdrop-filter: none;
          padding: 1vw 0; text-align: left;
          display: flex; flex-direction: column; align-items: flex-start; gap: 0.3vw;
        }
        .vshop-cap-card span { font-size: 0.65vw; font-weight: 800; color: #ddd; text-transform: uppercase; display: flex; align-items: center; gap: 0.3vw; }
        .vshop-cap-card strong { font-size: 1.2vw; font-weight: 900; color: #fff; font-style: italic; }

        /* BOTTOM UI */
        .vshop-bottom-ui { display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1vw; }
        .vshop-center-controls { display: flex; flex-direction: column; align-items: center; gap: 1.5vw; }
        
        .vshop-price-tag { 
          font-size: 2.2vw; font-weight: 900; font-style: italic; color: #f1c40f; 
          text-shadow: 0 0.5vw 2vw rgba(0,0,0,0.8);
          margin-bottom: -2vw;
          z-index: 2;
        }
        
        .vshop-selector-row { display: flex; align-items: center; gap: 2vw; }
        .vshop-nav-btn { 
          background: #f1c40f; color: #000; width: 2.8vw; height: 2.8vw; 
          border-radius: 0.8vw; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s; border: none;
        }
        .vshop-nav-btn:hover { transform: scale(1.1); box-shadow: 0 0 1.5vw rgba(241, 196, 15, 0.4); }
        .vshop-vehicle-name { font-size: 3.5vw; font-weight: 900; font-style: italic; color: #fff; text-transform: uppercase; letter-spacing: -0.1vw; }

        .vshop-action-buttons { display: flex; gap: 0.8vw; }
        .vshop-btn { 
          padding: 1vw 2vw; border-radius: 1vw; font-weight: 900; font-style: italic; font-size: 0.95vw; 
          cursor: pointer; transition: 0.3s; border: none; text-transform: uppercase; 
          display: flex; align-items: center; gap: 0.6vw; white-space: nowrap;
        }
        .vshop-btn-test { background: #3b82f6; color: #fff; }
        .vshop-btn-cash { background: #ff3030; color: #fff; }
        .vshop-btn-card { background: #f1c40f; color: #000; }
        .vshop-btn:hover { transform: translateY(-0.3vw); filter: brightness(1.1); }

        /* ROTIRE ELEMENT (DREAPTA JOS) */
        .vshop-rotation-helper {
          position: absolute; right: 3vw; bottom: 3vw;
          display: flex; align-items: center; gap: 0.8vw;
        }
        .vshop-rotation-icon {
          color: #f1c40f;
          filter: drop-shadow(0 0 0.5vw rgba(241, 196, 15, 0.5));
        }
        .vshop-rotation-text {
          display: flex; flex-direction: column;
          line-height: 1.1;
        }
        .vshop-rotation-text span {
          color: #f1c40f; font-weight: 900; font-style: italic;
          font-size: 1vw; text-transform: uppercase;
          text-shadow: 0 0.2vw 0.5vw rgba(0,0,0,0.8);
        }

        /* NOTIFICATIONS */
        .vshop-notif { 
          position: fixed; bottom: 2vw; left: 2vw; color: #fff; 
          padding: 1vw 2vw; border-radius: 1vw; font-weight: 900; font-style: italic; 
          display: flex; align-items: center; gap: 1vw; box-shadow: 0 1vw 3vw rgba(0,0,0,0.5); 
          animation: popIn 0.3s ease-out; border-left: 0.5vw solid rgba(255,255,255,0.3);
        }
        @keyframes popIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* HEADER */}
      <div className="vshop-header">
        <div className="vshop-logo-area">
          <h1>Showroom</h1>
          <span>VEHICLES</span>
        </div>
        <div className="vshop-close-btn" onClick={close}>X</div>
      </div>

      {/* STATS & CARDS (STANGA MIJLOC) */}
      <div className="vshop-side-left-stats">
        <div className="vshop-stats-grid">
          {Object.entries({
            speed: specState.speed,
            acceleration: specState.acceleration,
            brakes: specState.brakes,
            clutch: specState.clutch
          }).map(([name, value]) => {
            const item = STAT_ITEMS[name];
            if (!item) return null;
            return (
              <div className="vshop-stat-item" key={name}>
                <div className="vshop-stat-info">
                  <span>{item.icon} {item.label}</span>
                </div>
                <div className="vshop-bar-container">
                  <div className="vshop-bar-fill" style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="vshop-capacity-row">
          <div className="vshop-cap-card">
            <span><Icons.Package size={"1.2vw"} /> PORTBAGAJ</span>
            <strong>{infoState.trunk?.slots || 0} KG</strong>
          </div>
          <div className="vshop-cap-card">
            <span><Icons.Droplet size={"1.2vw"} /> REZERVOR</span>
            <strong>{infoState.tank || 0} L</strong>
          </div>
        </div>
      </div>

      {/* COLOR PICKER (DREAPTA) */}
      <div className="vshop-color-picker">
        <span className="vshop-color-title">Vopsitorie</span>
        {colors.map((item, index) => (
          <div
            key={index}
            className={classNames('vshop-color-node', {
              active: isEqual(item, color)
            })}
            style={{ background: `rgb(${item})` }}
            onClick={() => selectColor(item)}
          />
        ))}
      </div>

      {/* BOTTOM UI */}
      <div className="vshop-bottom-ui">
        <div className="vshop-center-controls">
          <div className="vshop-price-tag">
            {type === 'vip_shop' ? (
              <Point amount={prices[selectedVeh] || 0} />
            ) : (
              prettify.price(prices[selectedVeh] || 0)
            )}
          </div>
          
          <div className="vshop-selector-row">
            <button className="vshop-nav-btn" onClick={() => {
              const keys = Object.keys(prices);
              if (keys.length === 0) return;
              const index = keys.indexOf(selectedVeh);
              const prev = index <= 0 ? keys[keys.length - 1] : keys[index - 1];
              selectVehicle(prev);
            }}><Icons.ChevronLeft /></button>
            <div className="vshop-vehicle-name">
              {(vehicles as any)[selectedVeh]?.name || (vehicles as any)[selectedVeh] || selectedVeh}
            </div>
            <button className="vshop-nav-btn" onClick={() => {
              const keys = Object.keys(prices);
              if (keys.length === 0) return;
              const index = keys.indexOf(selectedVeh);
              const next = index === keys.length - 1 ? keys[0] : keys[index + 1];
              selectVehicle(next);
            }}><Icons.ChevronRight /></button>
          </div>

          <div className="vshop-action-buttons">
            <button className="vshop-btn vshop-btn-test" onClick={startTestDrive}>
              TEST DRIVE
            </button>
            <button className="vshop-btn vshop-btn-cash" onClick={() => buy('cash')}>
              PLATESTE CASH
            </button>
            <button className="vshop-btn vshop-btn-card" onClick={() => buy('bank')}>
              PLATESTE CARD
            </button>
          </div>
        </div>
      </div>

      {/* ROTIRE VEHICUL (DREAPTA JOS) */}
      <div className="vshop-rotation-helper">
        <div className="vshop-rotation-icon">
          <Icons.MouseRotate size={32} />
        </div>
        <div className="vshop-rotation-text">
          <span>Rotirea</span>
          <span>Vehiculului</span>
        </div>
      </div>

      {/* NOTIFICARE */}
      {notification && (
        <div className="vshop-notif" style={{ background: notification.type === 'error' ? '#ff3030' : '#22c55e' }}>
          <span>{notification.text}</span>
        </div>
      )}
    </div>
  );
}

export default withRotation(VehicleShop);
