import React, { useState } from 'react';
import rpc from 'utils/rpc';

const Icons = {
    X: ({ size, color = "currentColor", strokeWidth = 2 }: any) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    ),
};

export default function TicketSystem() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const close = () => {
        rpc.callClient('Browser-HidePage');
    };

    const sendTicket = async () => {
        if (!selectedCategory || !title || !message) return;
        try {
            await rpc.callServer('Tickets-Create', [selectedCategory, title, message]);
            close();
        } catch (err) {
            // Error handled by server notifications
        }
    };

    const categories = [
        { 
            id: 'PLAYER', 
            label: 'RAPORTEAZA JUCATOR', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 
        },
        { 
            id: 'BUG', 
            label: 'RAPORTEAZA BUG', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg> 
        },
        { 
            id: 'QUESTION', 
            label: 'AM O INTREBARE', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> 
        },
    ];

    return (
        <div className="ticket-sys-overlay">
            <style>{`
                .ticket-sys-overlay { position: fixed !important; inset: 0 !important; z-index: 9999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background-color: rgba(0, 0, 0, 0.4) !important; font-family: 'Inter', sans-serif !important; user-select: none !important; width: 100vw !important; height: 100vh !important; }
                .ticket-sys-modal { width: 30vw !important; background: rgba(13, 13, 13, 0.9) !important; padding: 0 !important; border-radius: 1.5vw !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; box-shadow: 0 1vw 4vw rgba(0,0,0,0.5) !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; }
                .ts-header { width: 100% !important; padding: 0.8vw 1.2vw !important; border-bottom: 0.1vw solid rgba(255,255,255,0.05) !important; display: flex !important; align-items: center !important; justify-content: space-between !important; background-color: rgba(13, 13, 13, 1) !important; }
                .ts-title-box { display: flex !important; flex-direction: column !important; gap: 0 !important; }
                .ts-title { color: #f1c40f !important; font-size: 1.6vw !important; font-weight: 900 !important; font-style: italic !important; letter-spacing: -0.05vw !important; line-height: 0.7 !important; text-transform: uppercase !important; }
                .ts-bank-label { font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 0.7vw !important; color: #ffffff !important; letter-spacing: 0.3vw !important; margin-top: -0.2vw !important; line-height: 1 !important; }
                .ts-exit-btn { background-color: #ef4444 !important; color: white !important; border: none !important; padding: 0.4vw !important; border-radius: 0.5vw !important; cursor: pointer !important; transition: all 0.3s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; }
                .ts-exit-btn:hover { background-color: #dc2626 !important; transform: rotate(90deg) !important; }
                .ts-content { padding: 1.2vw 1.5vw !important; flex: 1 !important; display: flex !important; flex-direction: column !important; }
                .ts-cat-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 0.6vw !important; margin-bottom: 1.2vw !important; }
                .ts-cat-btn { position: relative !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 0.6vw !important; padding: 1vw !important; border-radius: 0.8vw !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; background: rgba(20, 20, 20, 0.8) !important; color: #555 !important; cursor: pointer !important; transition: 0.3s !important; overflow: hidden !important; }
                .ts-cat-btn svg { width: 1.6vw !important; height: 1.6vw !important; color: #f1c40f !important; transition: 0.3s !important; }
                .ts-cat-btn span { font-size: 0.55vw !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; text-align: center !important; line-height: 1.1 !important; }
                .ts-cat-btn:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(26, 26, 26, 0.9) !important; color: white !important; }
                .ts-cat-btn.active { background: #f1c40f !important; border-color: #f1c40f !important; color: black !important; transform: scale(1.02) !important; box-shadow: 0 0 2vw rgba(241,196,15,0.2) !important; }
                .ts-cat-btn.active svg { color: black !important; }
                .ts-input-section { transition: 0.5s ease !important; transform: translateY(1vw) !important; opacity: 0 !important; max-height: 0 !important; overflow: hidden !important; }
                .ts-input-section.visible { transform: translateY(0) !important; opacity: 1 !important; max-height: 35vw !important; }
                .ts-title-input { width: 100% !important; background: rgba(20, 20, 20, 0.8) !important; border: 0.1vw solid rgba(255,255,255,0.1) !important; border-radius: 0.8vw !important; padding: 0.8vw 1vw !important; color: white !important; font-weight: 900 !important; font-size: 0.75vw !important; outline: none !important; margin-bottom: 0.8vw !important; font-style: italic !important; text-transform: uppercase !important; }
                .ts-title-input:focus { border-color: #f1c40f !important; }
                .ts-area-box { position: relative !important; margin-bottom: 1.2vw !important; }
                .ts-area-input { width: 100% !important; height: 6vw !important; background: rgba(20, 20, 20, 0.8) !important; border: 0.1vw solid rgba(255,255,255,0.1) !important; border-radius: 0.8vw !important; padding: 1vw !important; color: white !important; font-weight: 700 !important; font-size: 0.75vw !important; outline: none !important; resize: none !important; box-sizing: border-box !important; }
                .ts-area-input:focus { border-color: #f1c40f !important; }
                .ts-action-btns { display: flex !important; gap: 0.6vw !important; }
                .ts-btn-cancel { flex: 1 !important; background: rgba(26, 26, 26, 0.8) !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; color: #aaa !important; font-weight: 900 !important; padding: 0.8vw !important; border-radius: 0.7vw !important; font-style: italic !important; text-transform: uppercase !important; font-size: 0.75vw !important; cursor: pointer !important; transition: 0.2s !important; }
                .ts-btn-send { flex: 2 !important; background: #f1c40f !important; color: black !important; font-weight: 900 !important; padding: 0.8vw !important; border-radius: 0.7vw !important; font-style: italic !important; text-transform: uppercase !important; font-size: 0.85vw !important; cursor: pointer !important; border: none !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 0.5vw !important; transition: 0.2s !important; }
                .ts-btn-send:hover { background: #ffdf1e !important; box-shadow: 0 0.8vw 2vw rgba(241,196,15,0.3) !important; }
                .ts-btn-send svg { width: 1vw !important; height: 1vw !important; }
                .ts-footer-hint { text-align: center !important; color: #444 !important; font-weight: 900 !important; font-style: italic !important; font-size: 0.55vw !important; animation: ts-pDot 2s infinite !important; margin: 0.6vw 0 !important; }
                @keyframes ts-pDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>

            <div className="ticket-sys-modal">
                <header className="ts-header">
                    <div className="ts-title-box">
                        <h2 className="ts-title">EMPIRE</h2>
                        <div className="ts-bank-label">TICKETS</div>
                    </div>
                    <button className="ts-exit-btn" onClick={close}>
                        <Icons.X size="1.2vw" strokeWidth={3} />
                    </button>
                </header>

                <div className="ts-content">
                    <div className="ts-cat-grid">
                        {categories.map((cat) => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`ts-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            >
                                {cat.icon}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className={`ts-input-section ${selectedCategory ? 'visible' : ''}`}>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value.toUpperCase())}
                            placeholder="TITLU TICKET..."
                            className="ts-title-input"
                        />
                        <div className="ts-area-box">
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Scrie aici mesajul tau..."
                                className="ts-area-input"
                            />
                        </div>

                        <div className="ts-action-btns">
                            <button onClick={() => setSelectedCategory(null)} className="ts-btn-cancel">RESET</button>
                            <button 
                                onClick={sendTicket}
                                className="ts-btn-send"
                            >
                                TRIMITE SOLICITARE 
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                            </button>
                        </div>
                    </div>

                    {!selectedCategory && <p className="ts-footer-hint">Selecteaza o categorie pentru a incepe completarea ticketului.</p>}
                </div>
            </div>
        </div>
    );
}

