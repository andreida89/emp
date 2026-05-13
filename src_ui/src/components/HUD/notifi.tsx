import React, { useEffect, useState } from 'react';

// Extended types with color support
export type NotificationType = 'albastru' | 'rosu' | 'verde' | 'galben' | 'roz' | 'mov' | 'info' | 'success' | 'danger';

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
    (window as any).NotifyAnnouncement2 = (message: string, type: NotificationType, title?: string) => {
      const id = counter++;

      let mappedType = type;
      if (type === 'success') mappedType = 'verde';
      if (type === 'danger') mappedType = 'rosu';
      if (type === 'info') mappedType = 'galben';

      let finalTitle = title || 'NOTIFICARE';
      if (!title) {
        if (mappedType === 'verde') finalTitle = 'SUCCES';
        else if (mappedType === 'rosu') finalTitle = 'EROARE';
        else if (mappedType === 'galben') finalTitle = 'ATENTIE';
      }

      setMessages((prev) => [...prev, {
        id,
        title: finalTitle,
        message,
        type: mappedType,
      }].slice(-5)); // Limit to 5 notifications

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 5000);
    };
  }, []);

  const getIcon = (type: NotificationType) => {
    // Map colors to types for icon selection
    let iconType = 'WARNING';
    if (type === 'verde') iconType = 'SUCCESS';
    if (type === 'rosu') iconType = 'DANGER';

    switch (iconType) {
      case 'SUCCESS':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2vw', height: '1.2vw' }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case 'DANGER':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2vw', height: '1.2vw' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'WARNING':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2vw', height: '1.2vw' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
    }
  };

  const getColor = (type: NotificationType) => {
    switch (type) {
      case 'albastru': return '#3498db';
      case 'rosu': return '#ff3030';
      case 'verde': return '#2ecc71';
      case 'galben': return '#f1c40f';
      case 'roz': return '#fd79a8';
      case 'mov': return '#9b59b6';
      default: return '#f1c40f';
    }
  };

  return (
    <div className="new-notif-wrapper">
      {messages.map((msg) => (
        <div key={msg.id} className="new-notif-item animate-in-new" style={{ borderLeft: `0.4vw solid ${getColor(msg.type)}` }}>
          <div className="new-notif-icon" style={{ color: getColor(msg.type) }}>
            {getIcon(msg.type)}
          </div>
          <div className="new-notif-content">
            <div className="new-notif-title" style={{ color: getColor(msg.type) }}>{msg.title}</div>
            <div className="new-notif-message">{msg.message}</div>
          </div>
          
          <div className="new-notif-progress-bg">
              <div 
                className="new-notif-progress-bar" 
                style={{ backgroundColor: getColor(msg.type) }}
              ></div>
          </div>
        </div>
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap');

        .new-notif-wrapper {
          position: fixed;
          left: 2vw;
          top: 50vh;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 1.5vh;
          pointer-events: none;
          z-index: 100000;
        }

        .new-notif-item {
          pointer-events: auto;
          width: 18vw;
          background: rgba(20, 20, 20, 0.85);
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          border-radius: 0.6vw;
          display: flex;
          align-items: center;
          padding: 1vw 1vw 1.2vw 0.7vw;
          position: relative;
          box-shadow: 0 1vw 3vw rgba(0,0,0,0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .new-notif-icon {
          flex-shrink: 0;
          margin-right: 0.5vw;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .new-notif-icon svg {
          width: 1.0vw !important;
          height: 1.0vw !important;
        }

        .new-notif-content {
          flex-grow: 1;
          word-break: break-word;
        }

        .new-notif-title {
          font-size: 1.0vw;
          font-weight: 900;
          font-style: italic;
          letter-spacing: -0.02vw;
          line-height: 1;
          margin-bottom: 0.3vh;
          text-transform: uppercase;
        }

        .new-notif-message {
          font-size: 0.7vw;
          color: white;
          font-weight: 700;
          line-height: 1.3;
          text-transform: uppercase;
        }

        .new-notif-progress-bg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0.3vw;
          background: rgba(255, 255, 255, 0.05);
        }

        .new-notif-progress-bar {
          height: 100%;
          width: 100%;
          transform-origin: left;
          animation: progressRunNew 5s linear forwards;
        }

        @keyframes progressRunNew {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }

        .animate-in-new {
          animation: slideInNew 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards, 
                     tadaSubtleNew 0.8s 0.3s ease-in-out forwards;
        }

        @keyframes slideInNew {
          from {
            opacity: 0;
            transform: translateX(-5vw) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes tadaSubtleNew {
          0% { transform: scale(1); }
          15% { transform: scale(0.98) rotate(-1deg); }
          30% { transform: scale(1.01) rotate(1deg); }
          45% { transform: scale(1.01) rotate(-1deg); }
          60% { transform: scale(1.01) rotate(1deg); }
          75% { transform: scale(1.01) rotate(-1deg); }
          100% { transform: scale(1) rotate(0); }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
