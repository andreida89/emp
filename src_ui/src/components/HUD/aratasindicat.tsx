import React, { useState, useEffect } from 'react';

const styles = `
  .s-sindicat-viewport {
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

  .s-sindicat-container {
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

  .s-sindicat-container.active {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .s-sindicat-image-wrapper {
    width: 100%;
    aspect-ratio: 1.58 / 1;
    border-radius: 0.8vw;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1vh 3vh rgba(0, 0, 0, 0.4);
  }

  .s-sindicat-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .s-sindicat-details-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
  }

  .s-sindicat-details-box {
    position: absolute;
    top: 35%;
    left: 35%;
    display: flex;
    flex-direction: column;
    gap: 0.1vh;
    width: 55%;
  }

  .s-sindicat-detail-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5vw;
    font-size: 0.8vw;
    color: #d8d8d8af;
    font-weight: 700;
    letter-spacing: 0.02vw;
    text-transform: uppercase;
  }

  .s-sindicat-detail-label {
    color: #d8d8d8af;
    opacity: 0.8;
  }

  .s-sindicat-detail-value {
    color: #d8d8d8af;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .s-sindicat-progress-container {
    width: 100%;
    height: 0.4vh;
    background: rgba(255, 255, 255, 0.15);
    margin-top: 1.5vh;
    border-radius: 1vw;
    overflow: hidden;
    box-shadow: 0 0.2vh 0.5vh rgba(0, 0, 0, 0.2);
  }

  .s-sindicat-progress-bar {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #38ef7d, #11998e);
    border-radius: 1vw;
    transform-origin: left center;
    transform: scaleX(0);
  }

  .s-sindicat-container.active .s-sindicat-progress-bar {
    animation: sLoadingBarRun 3s linear forwards;
  }

  @keyframes sLoadingBarRun {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(0); }
  }

  @media (max-width: 1024px) {
    .s-sindicat-container { width: 28vw; }
    .s-sindicat-detail-row { font-size: 0.8vw; }
  }

  @media (max-width: 480px) {
    .s-sindicat-container { width: 45vw; }
    .s-sindicat-detail-row { font-size: 1.2vw; }
  }
`;

interface SyndicateData {
    nume: string;
    prenume: string;
    sex: string;
    data: string;
}

const PlayerSindicat: React.FC = () => {
  const [player, setPlayer] = useState<SyndicateData | null>(null);

  useEffect(() => {
    (window as any).ShowSindicat = (data: SyndicateData) => {
      setPlayer(data);
      setTimeout(() => {
        setPlayer(null);
      }, 3000);
    };

    return () => {
        delete (window as any).ShowSindicat;
    };
  }, []);

  if (!player) return null;

  return (
    <div className="s-sindicat-viewport">
      <style>{styles}</style>
      <div className={`s-sindicat-container active`}>
        <div className="s-sindicat-image-wrapper">
          <img src="https://cdn.empirerp.ro/inventar/sindicat.png" alt="Sindicat" className="s-sindicat-image" />
          <div className="s-sindicat-details-overlay">
            <div className="s-sindicat-details-box">
              <div className="s-sindicat-detail-row">
                <span className="s-sindicat-detail-label">Nume:</span>
                <span className="s-sindicat-detail-value">{player.nume}</span>
              </div>
              <div className="s-sindicat-detail-row">
                <span className="s-sindicat-detail-label">Prenume:</span>
                <span className="s-sindicat-detail-value">{player.prenume}</span>
              </div>
              <div className="s-sindicat-detail-row">
                <span className="s-sindicat-detail-label">Sex:</span>
                <span className="s-sindicat-detail-value">{player.sex}</span>
              </div>
              <div className="s-sindicat-detail-row">
                <span className="s-sindicat-detail-label">Data:</span>
                <span className="s-sindicat-detail-value">{player.data}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="s-sindicat-progress-container">
          <div className="s-sindicat-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default PlayerSindicat;
