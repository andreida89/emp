import React, { useEffect, useState } from 'react';
import notificationSound from 'assets/audio/notificarepolitie.mp3';

interface AlertaPolitie {
  id: number;
  message: string;
}

let counter = 0;

const PoliceNotifications: React.FC = () => {
  const [messages, setMessages] = useState<AlertaPolitie[]>([]);

  useEffect(() => {
    (window as any).AlertaPolitie = (message: string) => {
      const id = counter++;

      const audio = new Audio(notificationSound);
      audio.volume = 0.2;
      audio.play().catch(() => {});

      setMessages((prev) => [
        ...prev,
        {
          id,
          message,
        },
      ]);

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 5000);
    };
  }, []);

  return (
    <div id="police-notif-container">
      {messages.map((msg) => (
        <div key={msg.id} className="police-notification">
          <div
            className="police-notification-icon"
            style={{ backgroundImage: `url('https://empirerp.eu/pol1.gif')` }}
          ></div>
          <div className="police-notif-message">{msg.message}</div>
        </div>
      ))}
    </div>
  );
};

export default PoliceNotifications;
