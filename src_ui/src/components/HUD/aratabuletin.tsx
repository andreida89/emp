import React, { useState, useEffect } from 'react';

const buletinStyles = `
  .b-buletin-viewport {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent !important;
    pointer-events: none;
    z-index: 9999;
  }

  .b-buletin-container {
    width: 32vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    opacity: 0;
    transform: scale(0.85);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: none;
  }

  .b-buletin-container.active {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .b-buletin-image-wrapper {
    width: 100%;
    aspect-ratio: 1.58 / 1;
    border-radius: 0.8vw;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1vh 3vh rgba(0, 0, 0, 0.4);
  }

  .b-buletin-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .b-buletin-details-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
  }

  .b-buletin-details-box {
    position: absolute;
    top: 35%;
    left: 35%;
    display: flex;
    flex-direction: column;
    gap: 0.1vh;
    width: 55%;
  }

  .b-buletin-detail-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5vw;
    font-size: 0.8vw;
    color: #000000;
    font-weight: 900;
    letter-spacing: 0.02vw;
    text-transform: uppercase;
  }

  .b-buletin-detail-label {
    color: #000000;
    opacity: 0.8;
  }

  .b-buletin-detail-value {
    color: #000000;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
	font-weight: 900;
  }

  .b-buletin-progress-container {
    width: 100%;
    height: 0.4vh;
    background: rgba(255, 255, 255, 0.15);
    margin-top: 1.5vh;
    border-radius: 1vw;
    overflow: hidden;
    box-shadow: 0 0.2vh 0.5vh rgba(0, 0, 0, 0.2);
  }

  .b-buletin-progress-bar {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #38ef7d, #11998e);
    border-radius: 1vw;
    transform-origin: left center;
    transform: scaleX(0);
  }

  .b-buletin-container.active .b-buletin-progress-bar {
    animation: bLoadingBarRunBuletin 3s linear forwards;
  }

  @keyframes bLoadingBarRunBuletin {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(0); }
  }

  @media (max-width: 1024px) {
    .b-buletin-container { width: 28vw; }
    .b-buletin-detail-row { font-size: 0.8vw; }
  }

  @media (max-width: 480px) {
    .b-buletin-container { width: 45vw; }
    .b-buletin-detail-row { font-size: 1.2vw; }
  }
`;

interface PlayerData {
    firstName: string;
    lastName: string;
    gender: string;
    registerAt: string;
}

const PlayerBuletin: React.FC = () => {
  const [player, setPlayer] = useState<PlayerData | null>(null);

  useEffect(() => {
    (window as any).ShowBuletin = (data: PlayerData) => {
      setPlayer(data);
      setTimeout(() => {
        setPlayer(null);
      }, 3000);
    };

    return () => {
        delete (window as any).ShowBuletin;
    };
  }, []);

  if (!player) return null;

  return (
    <div className="b-buletin-viewport">
      <style>{buletinStyles}</style>
      <div className={`b-buletin-container active`}>
        <div className="b-buletin-image-wrapper">
          <img src="https://cdn.empirerp.ro/inventar/buletin.png" alt="Buletin" className="b-buletin-image" />
          <div className="b-buletin-details-overlay">
            <div className="b-buletin-details-box">
              <div className="b-buletin-detail-row">
                <span className="b-buletin-detail-label">Nume:</span>
                <span className="b-buletin-detail-value">{player.lastName}</span>
              </div>
              <div className="b-buletin-detail-row">
                <span className="b-buletin-detail-label">Prenume:</span>
                <span className="b-buletin-detail-value">{player.firstName}</span>
              </div>
              <div className="b-buletin-detail-row">
                <span className="b-buletin-detail-label">Sex:</span>
                <span className="b-buletin-detail-value">{player.gender}</span>
              </div>
              <div className="b-buletin-detail-row">
                <span className="b-buletin-detail-label">Data:</span>
                <span className="b-buletin-detail-value">{player.registerAt}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="b-buletin-progress-container">
          <div className="b-buletin-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default PlayerBuletin;
