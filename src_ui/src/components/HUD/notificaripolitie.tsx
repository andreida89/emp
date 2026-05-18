import React, { useEffect, useState } from 'react';
import notificationSound from 'assets/audio/notificarepolitie.mp3';

interface AlertaPolitie {
  id: number;
  message: string;
}

let counter = 0;

const PolitieNotifications: React.FC = () => {
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
    <div id="politie-notif-container">
      {messages.map((msg) => (
        <div key={msg.id} className="politie-notification">
          <div
            className="politie-notification-icon"
            style={{ backgroundImage: `url('https://empirerp.eu/pol1.gif')` }}
          ></div>
          <div className="politie-notif-message">{msg.message}</div>
        </div>
      ))}
    </div>
  );
};

export default PolitieNotifications;
