import React, { useEffect, useState, useCallback } from 'react';
// import notificationSound from 'assets/audio/notificarepolitie.mp3';

interface AlertaSindicat {
  id: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

let counter = 0;

const SindicatNotifications: React.FC = () => {
  const [messages, setMessages] = useState<AlertaSindicat[]>([]);

  useEffect(() => {
    (window as any).AlertaSindicat = (x: number, y: number, z: number) => {
      const id = counter++;

      // const audio = new Audio(notificationSound);
      // audio.volume = 0.2;
      // audio.play().catch(() => {});

      setMessages([{ id, position: { x, y, z } }]);
    };
  }, []);

  const handleAccept = useCallback(() => {
    if (!messages.length) return;

    const pos = messages[0].position;
    mp.events.call('client:alertaSindicatAccept', pos.x, pos.y, pos.z);

    setMessages([]);
    mp.events.call('client:alertaSindicatClosed');
  }, [messages]);

  const handleRefuse = useCallback(() => {
    setMessages([]);
    mp.events.call('client:alertaSindicatClosed');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignoram input-urile in chat, etc.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (messages.length === 0) return;

      const key = e.key.toLowerCase();
      if (key === 'y') {
        handleAccept();
      } else if (key === 'x') {
        handleRefuse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messages, handleAccept, handleRefuse]);

  return (
    <div id="sindicat-notif-container">
      {messages.map((msg) => (
        <div className="sindicat-notification" key={msg.id}>
          <h1>ATENTIE</h1>
          <p>ACEASTA ESTE O ALERTA SINDICAT!</p>
          <h4>PREZENTA ESTE OBLIGATORIE CU SAU FARA ARMAMENT</h4>
          <div className="button-row">
            <button className="accept" onClick={handleAccept}>
              [Y] ACCEPTA
            </button>
            <button className="refuse" onClick={handleRefuse}>
              [X] REFUZA
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SindicatNotifications;
