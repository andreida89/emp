import React, { useEffect, useState } from 'react';
import notificationSound from 'assets/audio/notificarepolitie.mp3';

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

      const audio = new Audio(notificationSound);
      audio.volume = 0.2;
      audio.play().catch(() => {});

      setMessages([{ id, position: { x, y, z } }]);
    };
  }, []);

  const handleAccept = () => {
    if (!messages.length) return;

    const pos = messages[0].position;
    mp.events.call('client:alertaSindicatAccept', pos.x, pos.y, pos.z);

    setMessages([]);
  };

  const handleRefuse = () => {
    setMessages([]);
  };

  return (
    <div id="sindicat-notif-container">
      {messages.map((msg) => (
        <div className="sindicat-notification" key={msg.id}>
          <h1>ATENTIE</h1>
          <p>ACEASTA ESTE O ALERTA SINDICAT!</p>
          <h4>PREZENTA ESTE OBLIGATORIE CU SAU FARA ARMAMENT</h4>
          <div className="button-row">
            <button className="accept" onClick={handleAccept}>
              ACCEPTA
            </button>
            <button className="refuse" onClick={handleRefuse}>
              REFUZA
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SindicatNotifications;
