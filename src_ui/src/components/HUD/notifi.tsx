import React, { useEffect, useState } from 'react';
import notificationSound from 'assets/audio/notificare.mp3';

// Extended types with color support
export type NotificationType = 'albastru' | 'rosu' | 'verde' | 'galben' | 'roz' | 'mov';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
}

let counter = 0;

const Notifications: React.FC = () => {
  const [messages, setMessages] = useState<Notification[]>([]);

  useEffect(() => {
(window as any).NotifyAnnouncement2 = (message: string, type: NotificationType) => {
  const id = counter++;

  const audio = new Audio(notificationSound);
  audio.volume = 0.5;
  audio.play().catch(() => {});

  setMessages((prev) => [...prev, {
    id,
    title: 'ATENTIE',
    message,
    type,
  }]);

  setTimeout(() => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, 5000);
};

  }, []);

  return (
    <div id="notif-container">
      {messages.map((msg) => (
        <div key={msg.id} className={`notification ${msg.type}`}>
          <div className="notif-banner">
            <span className="notif-title">{msg.title}</span>
          </div>
          <div className="notif-message">{msg.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
