import React, { useState, useEffect, useMemo, useCallback } from 'react';
import rpc from 'utils/rpc';

export default function AdminTicketSystem() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null); 
    const [tickets, setTickets] = useState<any[]>([]);

    const fetchTickets = useCallback(async () => {
        try {
            const data = await rpc.callServer('Tickets-GetActive');
            setTickets(data);
        } catch (err) {
            console.error('[ATS-FETCH-ERROR]', err);
        }
    }, []);

    useEffect(() => {
        // @ts-ignore
        window.toggleAdminTickets = () => {
            if (!isOpen && (window as any).isPlayerDead) return;
            setIsOpen(prev => {
                const newState = !prev;
                if (newState) fetchTickets();
                if ((window as any).mp) (window as any).mp.trigger('client:adminMenuState', newState);
                return newState;
            });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedTicket) setSelectedTicket(null);
                else {
                    setIsOpen(false);
                    if ((window as any).mp) (window as any).mp.trigger('client:adminMenuState', false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedTicket, fetchTickets]);

    const visibleTickets = useMemo(() => {
        return tickets
            .filter(t => t.status === "OPEN")
            .sort((a, b) => {
                if (a.isVip === b.isVip) return 0;
                return a.isVip ? -1 : 1;
            });
    }, [tickets]);

    const handleClaim = async (id: string) => {
        try {
            const success = await rpc.callServer('Tickets-Claim', [id]);
            if (success) {
                setTickets(prev => prev.filter(t => t.id !== id));
                setSelectedTicket(null);
            } else {
                // If claim failed (e.g. already claimed), refresh list
                fetchTickets();
            }
        } catch (err) {
            console.error('[ATS-CLAIM-ERROR]', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const success = await rpc.callServer('Tickets-Delete', [id]);
            if (success) {
                setTickets(prev => prev.filter(t => t.id !== id));
                if (selectedTicket?.id === id) setSelectedTicket(null);
            }
        } catch (err) {
            console.error('[ATS-DELETE-ERROR]', err);
        }
    };

    if (!isOpen) return null;

    const StarIcon = () => (
        <svg style={{width:'1.2vw',height:'1.2vw'}} viewBox="0 0 24 24" fill="#f1c40f"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
    );

    const TrashIcon = () => (
        <svg style={{width:'1.2vw',height:'1.2vw'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/></svg>
    );

    return (
        <div className="ats-overlay">
            <style>{`
                .ats-overlay { position: fixed !important; inset: 0 !important; z-index: 9999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0,0,0,0.85) !important; backdrop-filter: blur(0.8vw) !important; font-family: 'Inter', sans-serif !important; user-select: none !important; animation: ats-fIn 0.3s ease-out !important; width: 100vw !important; height: 100vh !important; }
                .ats-modal { width: 75vw !important; max-height: 85vh !important; min-height: 45vh !important; background: #0a0a0a !important; padding: 2.5vw !important; border-radius: 1.5vw !important; border: 0.1vw solid rgba(255,255,255,0.03) !important; box-shadow: 0 0 10vw rgba(0,0,0,0.9) !important; animation: ats-sUp 0.5s cubic-bezier(0.16,1,0.3,1) !important; display: flex !important; flex-direction: column !important; position: relative !important; }
                .ats-header { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 1.5vw !important; }
                .ats-title-box { display: flex !important; flex-direction: column !important; }
                .ats-title { color: #f1c40f !important; font-size: 2.2vw !important; font-weight: 900 !important; font-style: italic !important; letter-spacing: -0.05vw !important; line-height: 1 !important; margin: 0 !important; }
                .ats-subtitle { color: white !important; font-size: 0.8vw !important; font-weight: 700 !important; text-transform: uppercase !important; margin-top: 0.4vw !important; }
                .ats-list-container { flex: 1 !important; overflow-y: auto !important; margin-top: 1vw !important; padding-right: 0.5vw !important; }
                .ats-list-container::-webkit-scrollbar { width: 0.3vw !important; }
                .ats-list-container::-webkit-scrollbar-thumb { background: #333 !important; border-radius: 1vw !important; }
                .ats-row { display: grid !important; grid-template-columns: 1.2fr 0.8fr 2.5fr 0.4fr 1.5fr !important; align-items: center !important; background: #111 !important; margin-bottom: 0.8vw !important; padding: 1.2vw !important; border-radius: 1vw !important; border: 0.1vw solid rgba(255,255,255,0.02) !important; transition: 0.2s !important; }
                .ats-row:hover { background: #141414 !important; border-color: rgba(241,196,15,0.2) !important; }
                .ats-row.is-vip { border-left: 0.3vw solid #f1c40f !important; background: linear-gradient(90deg, rgba(241,196,15,0.03) 0%, #111 20%) !important; }
                .ats-cell-player { display: flex !important; flex-direction: column !important; justify-content: center !important; }
                .ats-p-name { color: white !important; font-weight: 800 !important; font-size: 1vw !important; }
                .ats-cell-cat { display: flex !important; align-items: center !important; gap: 0.5vw !important; color: #ddd !important; font-weight: 700 !important; font-size: 0.8vw !important; }
                .ats-cat-tag { padding: 0.2vw 0.6vw !important; border-radius: 0.4vw !important; background: rgba(255,255,255,0.1) !important; font-size: 0.65vw !important; }
                .ats-cell-msg { color: #eee !important; font-size: 0.85vw !important; padding-right: 1.5vw !important; line-height: 1.3 !important; font-weight: 500 !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; overflow: hidden !important; }
                .ats-actions { display: flex !important; gap: 0.5vw !important; justify-content: flex-end !important; align-items: center !important; }
                .ats-action-icon-btn { width: 1.8vw !important; height: 1.8vw !important; border-radius: 0.6vw !important; border: none !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; transition: 0.2s !important; color: white !important; }
                .ats-action-icon-btn:hover { transform: scale(1.05) !important; }
                .ats-exit-btn { background-color: #ef4444 !important; color: white !important; border: none !important; padding: 0.5vw !important; border-radius: 0.6vw !important; cursor: pointer !important; transition: all 0.3s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; }
                .ats-exit-btn:hover { background-color: #dc2626 !important; transform: rotate(90deg) !important; }
                .ats-det-container { display: flex !important; flex-direction: column !important; gap: 1.2vw !important; animation: ats-fIn 0.3s ease !important; flex: 1 !important; }
                .ats-det-divider { height: 0.1vw !important; background: rgba(255,255,255,0.1) !important; margin: 0.5vw 0 1vw 0 !important; }
                .ats-det-row { display: flex !important; flex-direction: column !important; gap: 0.3vw !important; }
                .ats-det-label { color: #f1c40f !important; font-size: 0.7vw !important; font-weight: 800 !important; text-transform: uppercase !important; }
                .ats-det-text { color: white !important; font-size: 1.1vw !important; font-weight: 600 !important; }
                .ats-det-msg-box { background: #111 !important; padding: 1.5vw !important; border-radius: 1vw !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; color: #eee !important; font-size: 0.95vw !important; line-height: 1.6 !important; max-height: 18vw !important; overflow-y: auto !important; }
                .ats-empty-state { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; padding: 5vw !important; color: #666 !important; gap: 1vw !important; }
                .ats-empty-state svg { width: 4vw !important; height: 4vw !important; opacity: 0.4 !important; }
                @keyframes ats-fIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes ats-sUp { from { transform: translateY(2vw); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div className="ats-modal">
                <div className="ats-header">
                    <div className="ats-title-box">
                        <h2 className="ats-title">TICKETE v1</h2>
                        <span className="ats-subtitle">{selectedTicket ? "DETALII TICKET SELECTAT" : "GESTIONARE TICKETE ACTIVE"}</span>
                    </div>
                    <button onClick={() => { setIsOpen(false); if ((window as any).mp) (window as any).mp.trigger('client:adminMenuState', false); }} className="ats-exit-btn" title="Închide">
                        <svg style={{width:'1.2vw',height:'1.2vw'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                {!selectedTicket ? (
                    <div className="ats-list-container">
                        {visibleTickets.length > 0 ? (
                            visibleTickets.map((ticket) => (
                                <div key={ticket.id} className={`ats-row ${ticket.isVip ? 'is-vip' : ''}`}>
                                    <div className="ats-cell-player">
                                        <span className="ats-p-name">{ticket.player} ({ticket.playerId})</span>
                                    </div>
                                    <div className="ats-cell-cat">
                                        <span className="ats-cat-tag">{ticket.category}</span>
                                        {ticket.adminJail && <span className="ats-cat-tag" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '0.1vw solid rgba(239, 68, 68, 0.4)'}}>JAIL ({ticket.jailCheckpoints})</span>}
                                    </div>
                                    <div className="ats-cell-msg">{ticket.title}</div>
                                    <div className="ats-cell-priority">
                                        {ticket.isVip ? <StarIcon /> : <span style={{color:'#333', fontSize:'0.6vw'}}>—</span>}
                                    </div>
                                    <div className="ats-actions">
                                        <button 
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="ats-action-icon-btn" 
                                            style={{background: '#f1c40f', color: 'black'}}
                                            title="Detalii"
                                        >
                                            <svg style={{width:'1.2vw',height:'1.2vw'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        </button>
                                        <button onClick={() => handleClaim(ticket.id)} className="ats-action-icon-btn" style={{background: '#22c55e'}} title="Preluare">
                                            <svg style={{width:'1.2vw',height:'1.2vw'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M20 6L9 17l-5-5"/></svg>
                                        </button>
                                        <button onClick={() => handleDelete(ticket.id)} className="ats-action-icon-btn" style={{background: '#ef4444'}} title="Șterge">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="ats-empty-state">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                <p style={{fontWeight: 900, fontStyle: 'italic'}}>NU EXISTA TICKETE ACTIVE</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="ats-det-container">
                        <div className="ats-det-divider"></div>
                        
                        <div style={{display:'flex', gap:'4vw'}}>
                            <div className="ats-det-row">
                                <span className="ats-det-label">JUCĂTOR / ID</span>
                                <span className="ats-det-text">{selectedTicket.player} (ID: {selectedTicket.playerId})</span>
                            </div>
                            <div className="ats-det-row">
                                <span className="ats-det-label">CATEGORIE</span>
                                <span className="ats-det-text">{selectedTicket.category}</span>
                            </div>
                            {selectedTicket.adminJail && (
                                <div className="ats-det-row">
                                    <span className="ats-det-label" style={{color: '#ef4444'}}>JAIL STATUS</span>
                                    <span className="ats-det-text" style={{color: '#ef4444'}}>{selectedTicket.jailCheckpoints} CP rămase</span>
                                </div>
                            )}
                            {selectedTicket.isVip && <div style={{marginTop:'1.2vw'}}><StarIcon /></div>}
                        </div>

                        <div className="ats-det-row">
                            <span className="ats-det-label">SUBIECT</span>
                            <span className="ats-det-text" style={{color: '#f1c40f', fontStyle: 'italic'}}>{selectedTicket.title}</span>
                        </div>

                        <div className="ats-det-row">
                            <span className="ats-det-label">DESCRIERE COMPLETĂ</span>
                            <div className="ats-det-msg-box">{selectedTicket.message}</div>
                        </div>

                        <div style={{display:'flex', marginTop:'auto', justifyContent: 'space-between', paddingBottom: '0.5vw'}}>
                            <button 
                                onClick={() => setSelectedTicket(null)} 
                                className="ats-action-icon-btn" 
                                style={{background: '#4b5563'}} 
                                title="Înapoi"
                            >
                                <svg style={{width:'1.2vw',height:'1.2vw'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                            </button>

                            <div style={{display: 'flex', gap: '0.5vw'}}>
                                <button 
                                    onClick={() => handleClaim(selectedTicket.id)} 
                                    className="ats-action-icon-btn" 
                                    style={{background: '#22c55e'}}
                                    title="Preluare"
                                >
                                    <svg style={{width:'1.2vw',height:'1.2vw'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M20 6L9 17l-5-5"/></svg>
                                </button>
                                <button 
                                    onClick={() => handleDelete(selectedTicket.id)} 
                                    className="ats-action-icon-btn" 
                                    style={{background: '#ef4444'}}
                                    title="Șterge"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
