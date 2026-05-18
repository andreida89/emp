import React, { useState, useEffect } from 'react';

const styles = `
  .p-license-viewport {
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

  .p-license-container {
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

  .p-license-container.active {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .p-license-image-wrapper {
    width: 100%;
    aspect-ratio: 1.58 / 1;
    border-radius: 0.8vw;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1vh 3vh rgba(0, 0, 0, 0.4);
  }

  .p-license-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .p-license-details-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
  }

  .p-license-details-box {
    position: absolute;
    top: 35%;
    left: 35%;
    display: flex;
    flex-direction: column;
    gap: 0.1vh;
    width: 55%;
  }

  .p-license-detail-row {
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

  .p-license-detail-label {
    color: #d8d8d8af;
    opacity: 0.8;
  }

  .p-license-detail-value {
    color: #d8d8d8af;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p-license-progress-container {
    width: 100%;
    height: 0.4vh;
    background: rgba(255, 255, 255, 0.15);
    margin-top: 1.5vh;
    border-radius: 1vw;
    overflow: hidden;
    box-shadow: 0 0.2vh 0.5vh rgba(0, 0, 0, 0.2);
  }

  .p-license-progress-bar {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #38ef7d, #11998e);
    border-radius: 1vw;
    transform-origin: left center;
    transform: scaleX(0);
  }

  .p-license-container.active .p-license-progress-bar {
    animation: pLoadingBarRun 3s linear forwards;
  }

  @keyframes pLoadingBarRun {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(0); }
  }

  @media (max-width: 1024px) {
    .p-license-container { width: 28vw; }
    .p-license-detail-row { font-size: 0.8vw; }
  }

  @media (max-width: 480px) {
    .p-license-container { width: 45vw; }
    .p-license-detail-row { font-size: 1.2vw; }
  }
`;

interface LicenseData {
    nume: string;
    prenume: string;
    sex: string;
    data: string;
    categories: {
        a: boolean;
        b: boolean;
        c: boolean;
    }
}

const PlayerPermis: React.FC = () => {
  const [player, setPlayer] = useState<LicenseData | null>(null);

  useEffect(() => {
    (window as any).ShowPermis = (data: LicenseData) => {
      setPlayer(data);
      setTimeout(() => {
        setPlayer(null);
      }, 3000);
    };

    return () => {
        delete (window as any).ShowPermis;
    };
  }, []);

  if (!player) return null;

  const getLicenseImage = () => {
    const { a, b, c } = player.categories;
    if (a && b && c) return "https://cdn.empirerp.ro/inventar/permisabc.png";
    if (a && b) return "https://cdn.empirerp.ro/inventar/permiab.png";
    if (a && c) return "https://cdn.empirerp.ro/inventar/permisac.png";
    if (b && c) return "https://cdn.empirerp.ro/inventar/permisbc.png";
    if (a) return "https://cdn.empirerp.ro/inventar/permisa.png";
    if (b) return "https://cdn.empirerp.ro/inventar/permisb.png";
    if (c) return "https://cdn.empirerp.ro/inventar/permisc.png";
    return "https://cdn.empirerp.ro/inventar/permisb.png"; // Default
  };

  return (
    <div className="p-license-viewport">
      <style>{styles}</style>
      <div className={`p-license-container active`}>
        <div className="p-license-image-wrapper">
          <img src={getLicenseImage()} alt="Permis" className="p-license-image" />
          <div className="p-license-details-overlay">
            <div className="p-license-details-box">
              <div className="p-license-detail-row">
                <span className="p-license-detail-label">Nume:</span>
                <span className="p-license-detail-value">{player.nume}</span>
              </div>
              <div className="p-license-detail-row">
                <span className="p-license-detail-label">Prenume:</span>
                <span className="p-license-detail-value">{player.prenume}</span>
              </div>
              <div className="p-license-detail-row">
                <span className="p-license-detail-label">Sex:</span>
                <span className="p-license-detail-value">{player.sex}</span>
              </div>
              <div className="p-license-detail-row">
                <span className="p-license-detail-label">Data:</span>
                <span className="p-license-detail-value">{player.data}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-license-progress-container">
          <div className="p-license-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default PlayerPermis;
