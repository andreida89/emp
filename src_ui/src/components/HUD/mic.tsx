import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { StoreState } from 'store';
import rpc from 'utils/rpc';

const MicrophoneFilled = ({ size, color }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

const WalkieTalkieFilled = ({ size }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M18 6h-3V2h-2v4H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 19V8h6v11H9zm3-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

export default function Mic({ bind }: { bind?: string }) {
  const [volumeLevel, setVolumeLevel] = useState(2);
  const [isTalking, setIsTalking] = useState(false);
  const hasStatie = useSelector((state: StoreState) => state.player.hasStatie);

  const activeGreen = '#3dfc03';
  const inactiveGray = '#e5e7eb';

  useEffect(() => {
    const talkKey = bind ? bind.toLowerCase() : 'n';

    const handleKeyDown = (e: any) => {
      // Allow local cycle just in case
      if (e.key.toLowerCase() === 'z') {
        setVolumeLevel((prev) => (prev >= 3 ? 1 : prev + 1));
      }
      if (e.key.toLowerCase() === talkKey) {
        setIsTalking(true);
      }
    };

    const handleKeyUp = (e: any) => {
      if (e.key.toLowerCase() === talkKey) {
        setIsTalking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Sync from RageMP Client events
    const updateVoiceLevel = (level: number) => setVolumeLevel(level);
    const updateMicStatus = (status: boolean) => setIsTalking(status);

    rpc.register('HUD-SetVoiceLevel', updateVoiceLevel);
    rpc.register('HUD-SetMicStatus', updateMicStatus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      rpc.unregister('HUD-SetVoiceLevel');
      rpc.unregister('HUD-SetMicStatus');
    };
  }, [bind]);

  return (
    <>
      <style>{`
        .mic-v2-controls-wrapper {
          position: absolute;
          bottom: 0.5vw;
          left: 130.5%;
          display: flex;
          flex-direction: column;
          gap: 0.8vw;
          width: fit-content;
          z-index: 998;
        }
        .mic-v2-group-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15vw;
          width: 100%;
        }
        .mic-v2-icon-glow {
          filter: drop-shadow(0 0 0.15vw rgba(0,0,0,0.8));
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .mic-v2-btn-base {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          height: 0.9vw;
          width: 1.6vw;
          border-radius: 0.15vw;
          box-shadow: 0 0.1vw 0.2vw rgba(0,0,0,0.4);
          cursor: default;
          box-sizing: border-box;
          padding: 0;
        }
        .mic-v2-btn-off {
          background-color: #FF3B30;
          color: white;
        }
        .mic-v2-btn-on {
          background-color: #f1c40f;
          color: black;
        }
        .mic-v2-btn-text {
          font-size: 0.45vw;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -0.02ch;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
          height: 100%;
        }
        .mic-v2-volume-bar-container {
          display: flex;
          gap: 0.1vw;
          width: 1.6vw;
          height: 0.2vw;
        }
        .mic-v2-volume-bar {
          flex: 1;
          border-radius: 0.1vw;
        }
      `}</style>

      <div className="mic-v2-controls-wrapper">
        {hasStatie && (
          <div className="mic-v2-group-container">
            <div className="mic-v2-icon-glow">
              <WalkieTalkieFilled size="1vw" />
            </div>
            <div className="mic-v2-btn-base mic-v2-btn-off">
              <span className="mic-v2-btn-text">OFF</span>
            </div>
          </div>
        )}
        <div className="mic-v2-group-container">
          <div className="mic-v2-icon-glow">
            <MicrophoneFilled size="1vw" color={isTalking ? activeGreen : 'white'} />
          </div>
          <div className="mic-v2-volume-bar-container">
            {[1, 2, 3].map((level) => (
              <div 
                key={level}
                className="mic-v2-volume-bar"
                style={{
                  backgroundColor: level <= volumeLevel ? activeGreen : inactiveGray
                }}
              />
            ))}
          </div>
          <div className="mic-v2-btn-base mic-v2-btn-on">
            <span className="mic-v2-btn-text">ON</span>
          </div>
        </div>
      </div>
    </>
  );
}
