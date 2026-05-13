import React, { useState, useMemo, useEffect } from 'react';
import rpc from 'utils/rpc';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import sounds from 'utils/sounds';

type Props = RouteComponentProps;

const FUEL_TYPES = [
	{ key: 'diesel', label: 'DIESEL', price: 15 },
	{ key: 'benzina', label: 'BENZINA', price: 18 }
];
const MAX_LITRES = 50;

const getJerrycanPrice = (type: string) => {
	switch (type) {
		case 'diesel':
			return 200;
		case 'benzina':
			return 250;
		case 'kerosen':
			return 300;
		default:
			return 0; // electricitate sau necunoscut
	}
};

function GasStation(props: Props) {
	const { location } = props;
	const state = (location.state as any) || {};

	const {
		fuelLevel = 50,
		vehicleModel = 'Necunoscut',
		vehicleClass = 'Necunoscut',
		fuelType = 'Necunoscut',
		prices = {}
	} = state;

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

	const currentPrices = useMemo(() => {
		const out = {} as Record<string, number>;
		FUEL_TYPES.forEach(ft => {
			out[ft.key] = prices[ft.key] ?? ft.price;
		});
		return out;
	}, [prices]);

	const initialFuelKey = useMemo(() => {
		const found = FUEL_TYPES.find(ft => ft.label.toUpperCase() === fuelType.toUpperCase() || ft.key.toUpperCase() === fuelType.toUpperCase());
		return found ? found.key : 'benzina';
	}, [fuelType]);

	const [selectedFuelType, setSelectedFuelType] = useState(initialFuelKey);
	
	const [selectedAmount, setSelectedAmount] = useState(0); 
	const [status, setStatus] = useState('idle');
	const [errorMessage, setErrorMessage] = useState('');

	const litresNeeded = useMemo(() => {
		return Math.round((selectedAmount / 100) * MAX_LITRES);
	}, [selectedAmount]);

	const activePrice = currentPrices[selectedFuelType] ?? 0;
	const totalPrice = litresNeeded * activePrice;

    const jerrycanPrice = getJerrycanPrice(selectedFuelType);

	const handleAction = async (paymentMethod: 'cash' | 'bank') => {
		setStatus('processing');
		
		const basket = {
			diesel: 0,
			benzina: 0,
			electricitate: 0,
			kerosen: 0,
			jerrycan: 0
		};

		if (selectedFuelType && basket[selectedFuelType as keyof typeof basket] !== undefined) {
			basket[selectedFuelType as keyof typeof basket] = litresNeeded;
		}

        try {
            sounds.playPayment(paymentMethod);
            const response = await rpc.callServer('Gas-Buy', [basket, paymentMethod]);
            
            if (typeof response === 'string') {
            	setErrorMessage(response);
            	setStatus('error');
	            setTimeout(() => {
	                setStatus('idle');
	                setSelectedAmount(0);
	            }, 3000);
            	return;
            }

            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setSelectedAmount(0);
            }, 2000);
        } catch (err) {
            setStatus('idle');
        }
	};

    const handleJerrycan = async (paymentMethod: 'cash' | 'bank') => {
        setStatus('processing');
        try {
            sounds.playPayment(paymentMethod);
            const response = await rpc.callServer('Gas-FillJerrycan', [selectedFuelType, paymentMethod]);
            
            if (typeof response === 'string') {
            	setErrorMessage(response);
            	setStatus('error');
	            setTimeout(() => {
	                setStatus('idle');
	            }, 3000);
            	return;
            }

            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setSelectedAmount(0);
            }, 2000);
        } catch (err) {
            setStatus('idle');
        }
    };

	const handleClose = () => {
		rpc.callClient('Gas-CloseMenu');
	};

  return (
    <div className="gas-ui-main-wrapper">
      <div className="gas-ui-container">
        
        {/* PARTEA STANGA */}
        <div className="gas-ui-sidebar">
          <div className="gas-ui-top-accent"></div>
          <h2 className="gas-ui-main-title">BENZINARIE</h2>
          
          <div className="gas-ui-info-list">
            <div className="gas-ui-info-item">
              <i className="fas fa-car" style={{ fontSize: '1vw', color: '#6b7280' }}></i>
              <p>Vehicul: <span>{vehicleModel}</span></p>
            </div>
            <div className="gas-ui-info-item">
              <i className="fas fa-id-card" style={{ fontSize: '1vw', color: '#6b7280' }}></i>
              <p>Clasa Masina: <span className="gas-ui-uppercase">{vehicleClass}</span></p>
            </div>
            <div className="gas-ui-info-item">
              <i className="fas fa-gas-pump" style={{ fontSize: '1vw', color: '#6b7280' }}></i>
              <p>Combustibil: <span className="gas-ui-highlight-text">{fuelType}</span></p>
            </div>
          </div>

          <div className="gas-ui-icon-center">
            <div className="gas-ui-animate-tada">
               <i className="fas fa-gas-pump gas-ui-glow-drop" style={{ fontSize: '12vw', color: '#f1c40f' }}></i>
            </div>
          </div>

          <div className="gas-ui-progress-section">
            <div className="gas-ui-progress-header">
              <i className="fas fa-tachometer-alt" style={{ fontSize: '1.2vw', color: '#f1c40f' }}></i>
              <span className="gas-ui-percent-text">{Math.round(fuelLevel)}%</span>
            </div>
            <div className="gas-ui-progress-bar-bg">
              <div 
                className="gas-ui-progress-bar-fill"
                style={{ width: `${fuelLevel}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* PARTEA DREAPTA */}
        <div className="gas-ui-content-area">
          <h3 className="gas-ui-section-title">ALEGE TIPUL DE COMBUSTIBIL</h3>
          
          <div className="gas-ui-fuel-grid">
            {FUEL_TYPES.map((ft) => (
              <div 
                key={ft.key}
                onClick={() => setSelectedFuelType(ft.key)}
                className={`gas-ui-fuel-card ${selectedFuelType === ft.key ? 'gas-ui-active' : ''}`}
              >
                <div className="gas-ui-card-content">
                  <div>
                    <h4 className="gas-ui-fuel-name">{ft.label}</h4>
                    <p className="gas-ui-fuel-price">{currentPrices[ft.key]} RON / LITRU</p>
                  </div>
                  {selectedFuelType === ft.key && <i className="fas fa-wind" style={{ color: '#f1c40f', fontSize: '1.5vw' }}></i>}
                </div>
              </div>
            ))}
          </div>

          <div className="gas-ui-slider-section">
            <div className="gas-ui-slider-header">
              <span className="gas-ui-label">Cantitate Alimentata</span>
              <span className="gas-ui-value">{selectedAmount}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={100 - fuelLevel} 
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(parseInt(e.target.value))}
              className="gas-ui-custom-range"
            />
            <div className="gas-ui-slider-footer">
              <span>REZERVOR: {Math.round(fuelLevel)}%</span>
              <span className="gas-ui-white-text">+ {litresNeeded} LITRI</span>
              <span>PLIN COMPLET</span>
            </div>
          </div>

          <div className="gas-ui-summary-section">
            <div className="gas-ui-total-box">
              <span className="gas-ui-label">Cost Total Estimativ</span>
              <div className="gas-ui-price-display">
                <span className="gas-ui-big-price">{totalPrice}</span>
                <span className="gas-ui-currency">RON</span>
              </div>
            </div>
            <div className="gas-ui-unit-price">
               <span className="gas-ui-label">Tarif per Litru</span>
               <p className="gas-ui-white-text">{activePrice} RON / L</p>
            </div>
          </div>

          <div className="gas-ui-actions-grid">
            <h4 style={{fontSize: '0.8vw', color: '#6b7280', marginBottom: '-0.5vh', textTransform: 'uppercase', fontStyle: 'italic', fontWeight: 900}}>OPȚIUNI CANISTRĂ {jerrycanPrice > 0 ? `(+ ${jerrycanPrice} RON)` : ''}</h4>
            <div className="gas-ui-single-row-buttons">
              <button 
                onClick={() => handleJerrycan('cash')}
                disabled={jerrycanPrice === 0 || status !== 'idle'}
                className={`gas-ui-btn gas-ui-btn-primary ${jerrycanPrice > 0 ? '' : 'gas-ui-disabled'}`}
              >
                <i className="fas fa-money-bill-wave" style={{ fontSize: '1.4vw' }}></i>
                <span>CANISTRĂ CASH</span>
              </button>

              <button 
                onClick={() => handleJerrycan('bank')}
                disabled={jerrycanPrice === 0 || status !== 'idle'}
                className={`gas-ui-btn gas-ui-btn-primary ${jerrycanPrice > 0 ? '' : 'gas-ui-disabled'}`}
              >
                <i className="fas fa-credit-card" style={{ fontSize: '1.4vw' }}></i>
                <span>CANISTRĂ CARD</span>
              </button>
            </div>

            <h4 style={{fontSize: '0.8vw', color: '#6b7280', marginBottom: '-0.5vh', textTransform: 'uppercase', fontStyle: 'italic', fontWeight: 900, marginTop: '0.5vh'}}>ALIMENTARE REZERVOR / ANULARE</h4>
            <div className="gas-ui-single-row-buttons">
              <button 
                onClick={() => handleAction('cash')}
                disabled={selectedAmount <= 0 || status !== 'idle'}
                className={`gas-ui-btn gas-ui-btn-primary ${selectedAmount > 0 ? '' : 'gas-ui-disabled'}`}
              >
                <i className="fas fa-money-bill-wave" style={{ fontSize: '1.4vw' }}></i>
                <span>PLATA CASH</span>
              </button>

              <button 
                onClick={() => handleAction('bank')}
                disabled={selectedAmount <= 0 || status !== 'idle'}
                className={`gas-ui-btn gas-ui-btn-primary ${selectedAmount > 0 ? '' : 'gas-ui-disabled'}`}
              >
                <i className="fas fa-credit-card" style={{ fontSize: '1.4vw' }}></i>
                <span>PLATA CARD</span>
              </button>

              <button className="gas-ui-btn gas-ui-btn-danger" onClick={handleClose}>
                <i className="fas fa-times" style={{ fontSize: '1.4vw' }}></i>
                <span>ANULEAZA</span>
              </button>
            </div>
          </div>

          {status !== 'idle' && (
            <div className="gas-ui-overlay">
               {status === 'processing' ? (
                 <>
                    <div className="gas-ui-spinner" />
                    <p className="gas-ui-loading-text">AUTORIZARE POMPA...</p>
                 </>
               ) : status === 'success' ? (
                 <>
                    <i className="fas fa-check-circle gas-ui-bounce" style={{ fontSize: '5vw', color: '#2ecc71' }}></i>
                    <p className="gas-ui-success-text">TRANZACTIE FINALIZATA!</p>
                    <p className="gas-ui-sub-text">Procesarea s-a realizat cu succes</p>
                 </>
               ) : (
                 <>
                    <i className="fas fa-times-circle gas-ui-bounce" style={{ fontSize: '5vw', color: '#e74c3c' }}></i>
                    <p className="gas-ui-success-text" style={{ color: '#e74c3c' }}>EROARE TRANZACTIE!</p>
                    <p className="gas-ui-sub-text">{errorMessage}</p>
                 </>
               )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        .gas-ui-main-wrapper * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .gas-ui-main-wrapper {
          width: 100vw;
          height: 100vh;
          background: rgba(10, 10, 10, 0.95);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2vw;
          user-select: none;
          font-family: 'Inter', sans-serif;
        }

        .gas-ui-container {
          width: 75vw;
          height: 78vh;
          display: flex;
          gap: 2vw;
        }

        .gas-ui-sidebar {
          width: 25vw;
          background: #141414;
          border-radius: 1.5vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 2vw;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2vw 5vw rgba(0, 0, 0, 0.5);
        }

        .gas-ui-top-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 0.4vh;
          background: #f1c40f;
        }

        .gas-ui-main-title {
          font-size: 2.5vw;
          font-weight: 900;
          font-style: italic;
          letter-spacing: -0.1vw;
          color: #f1c40f;
          line-height: 1;
          margin-bottom: 1.5vh;
        }

        .gas-ui-info-list {
          display: flex;
          flex-direction: column;
          gap: 0.8vh;
          margin-bottom: 4vh;
        }

        .gas-ui-info-item {
          display: flex;
          align-items: center;
          gap: 0.5vw;
        }

        .gas-ui-info-item p {
          font-size: 0.9vw;
          font-weight: 700;
          color: #9ca3af;
        }

        .gas-ui-info-item span {
          color: white;
        }

        .gas-ui-highlight-text {
          color: #f1c40f !important;
          text-transform: uppercase;
          font-weight: 900;
        }

        .gas-ui-uppercase { text-transform: uppercase; }

        .gas-ui-icon-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gas-ui-glow-drop {
          filter: drop-shadow(0 0 2vw rgba(241, 196, 15, 0.4));
        }

        .gas-ui-progress-section {
          margin-top: auto;
        }

        .gas-ui-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 0.5vh;
        }

        .gas-ui-percent-text {
          font-weight: 900;
          font-style: italic;
          font-size: 1.2vw;
        }

        .gas-ui-progress-bar-bg {
          width: 100%;
          height: 1vh;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 5vw;
          overflow: hidden;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
        }

        .gas-ui-progress-bar-fill {
          height: 100%;
          background: linear-gradient(to right, #f1c40f, #d4ac0d);
          transition: all 1s ease;
        }

        /* DREAPTA */
        .gas-ui-content-area {
          flex: 1;
          background: #141414;
          border-radius: 1.5vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 2.5vw;
          position: relative;
          box-shadow: 0 2vw 5vw rgba(0, 0, 0, 0.5);
        }

        .gas-ui-section-title {
          font-size: 1.8vw;
          font-weight: 900;
          font-style: italic;
          margin-bottom: 3vh;
        }

        .gas-ui-fuel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5vw;
          margin-bottom: 2vh;
        }

        .gas-ui-fuel-card {
          position: relative;
          padding: 1.5vw;
          border-radius: 1vw;
          border: 0.2vw solid rgba(255, 255, 255, 0.05);
          background: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gas-ui-fuel-card.gas-ui-active {
          border-color: #f1c40f;
          background: rgba(255, 255, 255, 0.05);
        }

        .gas-ui-fuel-card:hover { background: rgba(255, 255, 255, 0.05); }
        .gas-ui-fuel-card:active { transform: scale(0.95); }

        .gas-ui-card-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .gas-ui-fuel-name {
          font-weight: 900;
          font-style: italic;
          font-size: 1.5vw;
          line-height: 1;
          text-transform: uppercase;
        }

        .gas-ui-fuel-card:not(.gas-ui-active) .gas-ui-fuel-name { color: #6b7280; }

        .gas-ui-fuel-price {
          font-weight: 700;
          font-size: 1vw;
          margin-top: 0.5vh;
          text-transform: uppercase;
        }

        .gas-ui-active .gas-ui-fuel-price { color: #f1c40f; }
        .gas-ui-fuel-card:not(.gas-ui-active) .gas-ui-fuel-price { color: #4b5563; }

        .gas-ui-slider-section {
          margin-bottom: 2vh;
        }

        .gas-ui-slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5vh;
        }

        .gas-ui-label {
          color: #6b7280;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          font-size: 0.8vw;
          letter-spacing: 0.1vw;
        }

        .gas-ui-value {
          color: #f1c40f;
          font-weight: 900;
          font-size: 1.2vw;
          font-style: italic;
        }

        .gas-ui-custom-range {
          width: 100%;
          height: 0.6vh;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5vw;
          appearance: none;
          cursor: pointer;
        }

        .gas-ui-custom-range::-webkit-slider-thumb {
          appearance: none;
          height: 1.5vw;
          width: 1.5vw;
          border-radius: 50%;
          background: #f1c40f;
          border: 0.3vw solid #141414;
          box-shadow: 0 0 1vw rgba(241, 196, 15, 0.4);
        }

        .gas-ui-slider-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.7vw;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          margin-top: 1vh;
        }

        .gas-ui-white-text { color: white; }

        .gas-ui-summary-section {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 0.1vw solid rgba(255, 255, 255, 0.05);
          padding-top: 2vh;
          margin-bottom: 2vh;
        }

        .gas-ui-price-display {
          display: flex;
          align-items: baseline;
          gap: 0.5vw;
        }

        .gas-ui-big-price {
          font-size: 2.5vw;
          font-weight: 900;
          font-style: italic;
          color: #f1c40f;
          line-height: 1;
          filter: drop-shadow(0 0 1vw rgba(241, 196, 15, 0.3));
        }

        .gas-ui-currency {
          font-size: 1.2vw;
          font-weight: 900;
          font-style: italic;
          color: #f1c40f;
        }

        .gas-ui-unit-price { text-align: right; }

        .gas-ui-actions-grid {
          display: flex;
          flex-direction: column;
          gap: 1vw;
        }

        .gas-ui-single-row-buttons {
          display: flex;
          gap: 1vw;
        }

        .gas-ui-btn {
          border: none;
          border-radius: 1vw;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8vw;
          transition: all 0.2s ease;
          cursor: pointer;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          padding: 1.2vw;
          flex: 1;
        }

        .gas-ui-btn-primary {
          background: #f1c40f;
          color: black;
          box-shadow: 0 1vw 3vw rgba(241, 196, 15, 0.2);
          font-size: 1vw;
        }

        .gas-ui-btn-primary:not(.gas-ui-disabled):hover { transform: scale(1.02); }
        .gas-ui-btn-primary.gas-ui-disabled { background: rgba(255, 255, 255, 0.05); color: #6b7280; cursor: not-allowed; box-shadow: none; }

        .gas-ui-btn-danger {
          background: #e74c3c;
          color: white;
          font-size: 1vw;
        }

        .gas-ui-btn-danger:hover { background: #c0392b; transform: scale(1.02); }
        .gas-ui-btn:active { transform: scale(0.95); }

        /* OVERLAY */
        .gas-ui-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(0.5vw);
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 1.5vw;
        }

        .gas-ui-spinner {
          width: 4vw;
          height: 4vw;
          border: 0.4vw solid rgba(241, 196, 15, 0.2);
          border-top-color: #f1c40f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.5vw;
        }

        .gas-ui-loading-text {
          font-weight: 900;
          font-style: italic;
          color: #f1c40f;
          font-size: 1.5vw;
          text-transform: uppercase;
          letter-spacing: 0.2vw;
          animation: pulse 1.5s ease infinite;
        }

        .gas-ui-success-text {
          font-weight: 900;
          font-style: italic;
          color: #2ecc71;
          font-size: 2vw;
          text-transform: uppercase;
          letter-spacing: 0.1vw;
        }

        .gas-ui-sub-text {
          color: #6b7280;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.9vw;
        }

        /* ANIMATII */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1vw); } }
        
        .gas-ui-bounce { animation: bounce 0.5s ease infinite; }

        @keyframes tada {
          0% { transform: scale(1); }
          5%, 10% { transform: scale(0.9) rotate(-3deg); }
          15%, 25%, 35%, 45% { transform: scale(1.1) rotate(3deg); }
          20%, 30%, 40% { transform: scale(1.1) rotate(-3deg); }
          50% { transform: scale(1) rotate(0); }
          100% { transform: scale(1) rotate(0); }
        }
        .gas-ui-animate-tada { animation: tada 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default withRouter(GasStation);

