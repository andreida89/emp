import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Chalet:wght=400;700&family=Montserrat:wght=300;400;600;700;800&display=swap');

.gta-rp-wrapper {
  width: 100vw;
  height: 100vh;
  background: transparent;
  font-family: 'Montserrat', sans-serif;
  color: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 0;
  box-sizing: border-box;
  z-index: 1000;
  pointer-events: none;
}

.gta-dialog-container {
  position: absolute;
  bottom: 5vh;
  left: 50%;
  transform: translateX(-50%);
  width: 45vw;
  height: 20vh;
  background: rgba(12, 12, 12, 0.95);
  border-radius: 0.8vw;
  border: 0.15vh solid rgba(30, 144, 255, 0.4);
  display: flex;
  overflow: visible;
  pointer-events: all;
  animation: slideIn 0.5s ease-out;
}

  @keyframes slideIn {
    0% { opacity: 0; transform: translate(-50%, 5vh) scale(0.95); }
    100% { opacity: 1; transform: translate(-50%, 0) scale(1.0); }
  }

  .officer-frame {
    width: 12%;
    position: relative;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border-right: 0.15vh solid rgba(255, 255, 255, 0.05);
    background: linear-gradient(360deg, rgba(30, 144, 255, 0.15) 0%, transparent 100%);
    border-top-left-radius: 0.8vw;
    border-bottom-left-radius: 0.8vw;
    overflow: visible;
  }

  .officer-image {
    height: 135%;
    width: auto;
    object-fit: contain;
    position: absolute;
    bottom: 0;
    left: -4vw;
    filter: drop-shadow(0 -0.5vh 1.5vh rgba(0, 0, 0, 0.6));
    animation: hoverOfficer 4s ease-in-out infinite alternate;
    pointer-events: none;
  }

  @keyframes hoverOfficer {
    0% { transform: translateY(0); }
    100% { transform: translateY(-0.5vh); }
  }

  .dialog-content-area {
    width: 88%;
    padding: 2vh 2.2vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    position: relative;
  }

  .dialog-main-text {
    font-size: 1.1vw;
    font-weight: 600;
    line-height: 1.4;
    color: #f1f3f5;
    margin-top: 1vh;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.1vh solid rgba(255, 255, 255, 0.08);
    padding-top: 1vh;
  }

  .dialog-buttons-wrapper {
    display: flex;
    gap: 0.8vw;
  }

  .dialog-action-btn {
    background: #e2b714;
    color: #0d1117;
    font-weight: 800;
    font-size: 0.8vw;
    padding: 0.8vh 1.5vw;
    border-radius: 0.3vw;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .dialog-action-btn:hover {
    background: #f0c51a;
    transform: translateY(-2px);
  }

  .enter-prompt-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5vw;
  }

  .enter-badge {
    background: #e2b714;
    color: #0d1117;
    font-weight: 800;
    font-size: 0.7vw;
    padding: 0.3vh 0.6vw;
    border-radius: 0.2vw;
    text-transform: uppercase;
    box-shadow: 0 0.2vh 0.6vh rgba(226, 183, 20, 0.3);
    animation: pulseKey 2s infinite;
  }

  @keyframes pulseKey {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); box-shadow: 0 0.2vh 1vh rgba(226, 183, 20, 0.5); }
    100% { transform: scale(1); }
  }

  .enter-text {
    font-size: 0.75vw;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.02vw;
  }
`;

const DmvDialog = () => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [buttons, setButtons] = useState<string[]>([]);

    useEffect(() => {
        (window as any).DmvDialog = (t: string, txt: string, btns: string[]) => {
            setTitle(t);
            setText(txt);
            setButtons(btns || []);
            setVisible(true);
        };

        return () => {
            delete (window as any).DmvDialog;
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (visible && e.key === 'Enter') {
                handleSelect(0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visible]);

    const handleSelect = (index: number) => {
        setVisible(false);
        rpc.callClient('DmvDialog-Selected', index);
    };

    if (!visible) return null;

    return (
        <div className="gta-rp-wrapper">
            <style>{styles}</style>
            <div className="gta-dialog-container">
                <div className="officer-frame"></div>
                <img 
                    src="https://empirerp.eu/resurse/dmv/politist.png" 
                    alt="Politist DMV" 
                    className="officer-image"
                />
                <div className="dialog-content-area">
                    <div className="dialog-main-text">
                        <span style={{ color: '#e2b714', fontWeight: 800 }}>{title}</span><br />
                        {text}
                    </div>
                    <div className="dialog-footer">
                        <div className="dialog-buttons-wrapper">
                            {/* Buttons removed as per request, using ENTER instead */}
                        </div>
                        <div className="enter-prompt-wrapper">
                            <span className="enter-badge">ENTER</span>
                            <span className="enter-text">pentru a continua</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DmvDialog;
