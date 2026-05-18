import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';

const Icons = {
  Star: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  User: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Zap: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Shield: ({ size = 24, color = "currentColor", style }: any) => (
    <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Compass: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
  ),
  Wallet: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
  ),
  Landmark: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/></svg>
  ),
  ChevronRight: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
  ChevronLeft: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  LogOut: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  ShoppingBag: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  ),
  CheckCircle: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Clock: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Users: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Search: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  Briefcase: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  Ticket: ({ size = 24, color = "currentColor", style }: any) => (
    <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><line x1="13" y1="5" x2="13" y2="21"/><line x1="9" y1="9" x2="9" y2="10"/><line x1="9" y1="14" x2="9" y2="15"/><line x1="17" y1="9" x2="17" y2="10"/><line x1="17" y1="14" x2="17" y2="15"/></svg>
  ),
  AlertTriangle: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  AlertCircle: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
  FileText: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><path d="M10 9H9h1"/></svg>
  ),
  Plus: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Car: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
  ),
  X: ({ size = 24, color = "currentColor", strokeWidth = 2 }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  )
};

const EscMenu = () => {
  const [activeTab, setActiveTab] = useState('PRINCIPAL');
  const [empCoins, setEmpCoins] = useState(2000);
  const [notifications, setNotifications] = useState([]);
  const [modal, setModal] = useState({ active: false, type: '', data: null });
  const [userData, setUserData] = useState<any>({
    id: 1, nume: 'Se incarca...', oreJucate: 0, job: 'Se incarca...', factiune: 'Se incarca...',
    rank: '', cash: '0', bank: '0', donate: 0,
    varsta: 0, telefon: '...', level: 1,
    vehicles: []
  });

  useEffect(() => {
    // Show cursor manually just in case
    if ((window as any).mp) {
      (window as any).mp.trigger('client:EscMenuCursor', true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        rpc.callClient('Browser-HidePage');
        if ((window as any).mp) (window as any).mp.trigger('client:EscMenuCursor', false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    rpc.callServer('EscMenu-GetUserData').then((data: any) => {
       if (data) {
           setUserData(data);
           setEmpCoins(data.donate || 0);
       }
    }).catch(err => {
       console.error("EscMenu-GetUserData Error", err);
       setUserData((prev: any) => ({...prev, nume: 'Error Loading Data'}));
    });
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = (text: string, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }] as any);
    setTimeout(() => {
      setNotifications(prev => prev.filter((n: any) => n.id !== id));
    }, 4000);
  };

  const closeModals = () => setModal({ active: false, type: '', data: null });

  const handlePurchaseAttempt = (item: any) => {
    if (item.p === 'DESCHIDE SHOP') return;
    const cost = parseInt(item.p.replace(' EMP', ''));
    
    if (empCoins < cost) {
      addNotification("NU AI DESTUI EMP COINS PENTRU ACEASTA ACHIZITIE!", "error");
      return;
    }

    if (item.s === 'PHONE' || item.s === 'LOW ID') {
      setModal({ active: true, type: item.s, data: item });
    } else if (item.s === 'PLATES') {
      setModal({ active: true, type: 'VEHICLE_SELECT', data: item });
    } else {
      setModal({ active: true, type: 'CONFIRM', data: item });
    }
  };

  const completePurchase = (item: any, extraInfo = '') => {
    const cost = parseInt(item.p.replace(' EMP', ''));
    setEmpCoins(prev => prev - cost);
    addNotification(`ACHIZITIE REUSITA: ${item.t} ${extraInfo ? '(' + extraInfo + ')' : ''}`, "success");
    closeModals();
  };

  const topMenuItems = [
    { id: 'PRINCIPAL', label: 'PRINCIPAL', icon: <Icons.Star size={18} /> },
    { id: 'CHARACTER', label: 'CARACTER', icon: <Icons.User size={18} /> },
    { id: 'HUDSETTINGS', label: 'SETARI HUD', icon: <Icons.Zap size={18} /> },
    { id: 'FACTION', label: 'FACTIUNE', icon: <Icons.Shield size={18} /> },
    { id: 'PLAYERS', label: 'JUCATORI', icon: <Icons.Compass size={18} /> },
    { id: 'REGULAMENT', label: 'REGULAMENT', icon: <Icons.FileText size={18} /> },
  ];

  const principalItems = [
    { id: 'SHOP', title: 'SHOP', bg: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=600' },
    { id: 'MISSIONS', title: 'MISSIONS', isNew: true, bg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600' },
    { id: 'JOBS', title: 'JOBS', bg: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=600' },
    { id: 'TICKET', title: 'TICKET', bg: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600' },
    { id: 'HARTA', title: 'HARTA', bg: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=600' },
    { id: 'SETARI', title: 'SETARI', bg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600' },
  ];

  const currentDateStr = new Date().toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' |');
  
  const handleNavigation = (id: string) => {
      if (id === 'HARTA') {
          rpc.callClient('Browser-HidePage');
          rpc.callClient('EscMenu-OpenMap');
      } else if (id === 'SETARI') {
          rpc.callClient('Browser-HidePage');
          rpc.callClient('EscMenu-OpenSettings');
      } else if (id === 'TICKET') {
          rpc.callClient('Browser-HidePage');
          rpc.callClient('EscMenu-OpenTickets');
      } else {
          setActiveTab(id);
      }
  };

  const handleQuit = () => {
      rpc.callClient('Browser-HidePage');
      rpc.callServer('EscMenu-QuitGame');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'PRINCIPAL':
        return (
          <div className="esc-menu-main-grid">
            {principalItems.map((item, idx) => (
              <div key={idx} onClick={() => handleNavigation(item.id)} className="esc-menu-card-item">
                <div className="esc-menu-card-bg">
                  <img src={item.bg} alt={item.title} />
                  <div className="esc-menu-card-overlay" />
                </div>
                <div className="esc-menu-card-content">
                  <div className="esc-menu-card-header">
                    {/* initial letters removed */}
                    {item.isNew && <div className="esc-menu-badge-new">NEW</div>}
                  </div>
                  <div className="esc-menu-card-title-container">
                    <h2 className="esc-menu-card-title">{item.title}</h2>
                  </div>
                  <div className="esc-menu-card-footer-icon">
                    <div className="esc-menu-icon-circle"><Icons.ChevronRight size={24} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'CHARACTER': return <CharacterPage user={userData} />;
      case 'HUDSETTINGS': return <HudSettingsPage />;
      case 'FACTION': return <FactionPage user={userData} />;
      case 'PLAYERS': return <PlayersPage players={userData.players} />;
      case 'REGULAMENT': return <RegulamentPage />;
      case 'SHOP': return <ShopPage onPurchase={handlePurchaseAttempt} />;
      case 'MISSIONS': return <MissionsPage />;
      case 'JOBS': return <JobsPage />;
      case 'TICKET': return <TicketPage />;
      default: return null;
    }
  };

  return (
    <div className="esc-menu-wrapper">
      <style>{`body{margin:0;background:#000;overflow:hidden;font-family:'Inter',sans-serif}.esc-menu-wrapper{width:100vw;height:100vh;background:radial-gradient(circle at 50% 50%,#1a1a1a 0%,#050505 100%);padding:2vw;box-sizing:border-box;display:flex;flex-direction:column;color:#fff;user-select:none}.esc-menu-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:2vw}.esc-menu-header-title{font-size:6vw;font-weight:900;color:#f1c40f;font-style:italic;letter-spacing:-0.2vw;line-height:0.8;margin:0}.esc-menu-stats-container{display:flex;gap:1.5vw;align-items:center}.esc-menu-stat-box{background:#141414;padding:0.8vw 1.5vw;border-radius:1vw;border:0.1vw solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:1vw;min-width:12vw}.esc-menu-stat-icon{color:#f1c40f;background:rgba(255,255,255,0.05);padding:0.6vw;border-radius:0.8vw;display:flex}.esc-menu-stat-info{display:flex;flex-direction:column;line-height:1.1}.esc-menu-stat-label{font-size:0.7vw;color:#666;font-weight:900;text-transform:uppercase}.esc-menu-stat-label-clear{font-size:0.85vw;color:#fff;font-weight:900;font-style:italic;letter-spacing:0.05vw}.esc-menu-stat-value{font-size:1.5vw;font-weight:900;color:#f1c40f}.esc-menu-coins-box{background:#f1c40f;padding:0.8vw 1.5vw;border-radius:1vw;display:flex;align-items:center;gap:1.2vw;box-shadow:0 0 3vw rgba(241,196,15,0.2)}.esc-menu-coins-label{color:#000;font-weight:900;font-size:0.8vw;display:flex;flex-direction:column;line-height:1;font-style:italic;text-transform:uppercase}.esc-menu-coins-value{color:#000;font-weight:900;font-size:2vw}.esc-menu-top-menu{display:flex;gap:0.5vw;margin-bottom:1.5vw}.esc-menu-top-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:0.8vw;padding:1vw;border-radius:1vw;border:0.1vw solid rgba(255,255,255,0.05);background:#141414;color:#666;cursor:pointer;transition:0.3s;font-style:italic;font-weight:900;font-size:0.9vw;text-transform:uppercase}.esc-menu-top-btn.esc-menu-active{background:#f1c40f;border-color:#f1c40f;color:#000}.esc-menu-top-btn:hover:not(.esc-menu-active){background:#1a1a1a;color:#fff}.esc-menu-content-area{flex:1;overflow-y:auto;padding-right:0.5vw}.esc-menu-main-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5vw;padding-bottom:2vw}.esc-menu-card-item{position:relative;height:12vw;border-radius:1.5vw;background:#141414;border:0.1vw solid rgba(255,255,255,0.05);overflow:hidden;cursor:pointer;transition:0.3s}.esc-menu-card-bg{position:absolute;inset:0;z-index:0}.esc-menu-card-bg img{width:100%;height:100%;object-fit:cover;opacity:0.2;filter:grayscale(100%);transition:0.5s}.esc-menu-card-item:hover img{opacity:0.3}.esc-menu-card-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.6) 0%,transparent 100%)}.esc-menu-card-content{position:relative;z-index:1;padding:2vw;height:100%;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box}.esc-menu-card-header{display:flex;justify-content:space-between;align-items:flex-start}.esc-menu-card-id{width:2.5vw;height:2.5vw;background:rgba(0,0,0,0.8);border-radius:0.5vw;border:0.1vw solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:#f1c40f;font-weight:900;font-size:1.2vw}.esc-menu-badge-new{background:#f1c40f;color:#000;font-size:0.7vw;font-weight:900;padding:0.3vw 0.8vw;border-radius:0.2vw;font-style:italic;animation:pulse 1.5s infinite}.esc-menu-card-title{font-size:4.5vw;font-weight:900;font-style:italic;color:#f1c40f;margin:0;transform:rotate(-12deg);text-shadow:0 0.5vw 1.5vw rgba(0,0,0,0.8);transition:0.3s;text-align:center}.esc-menu-card-item:hover .esc-menu-card-title{transform:rotate(-12deg) scale(1.1)}.esc-menu-icon-circle{width:3vw;height:3vw;border-radius:50%;background:rgba(0,0,0,0.4);border:0.1vw solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;align-self:flex-end;transition:0.3s}.esc-menu-card-item:hover .esc-menu-icon-circle{background:#f1c40f;color:#000}.esc-menu-footer{margin-top:1.5vw;display:flex;justify-content:space-between;align-items:stretch;gap:1vw}.esc-menu-footer-stats{display:flex;gap:0.8vw;flex:1}.esc-menu-footer-card{background:#141414;border:0.1vw solid rgba(255,255,255,0.05);border-radius:1vw;padding:0.8vw 1.5vw;display:flex;flex-direction:column;justify-content:center;min-width:8vw;transition:0.3s}.esc-menu-footer-card:hover{transform:translateY(-0.3vw)}.esc-menu-footer-card-label{font-size:0.65vw;color:#666;font-weight:900;text-transform:uppercase}.esc-menu-footer-card-value{font-size:1.3vw;font-weight:900;font-style:italic}.esc-menu-logout-btn{background:#ff3030;border:none;padding:1vw 3vw;border-radius:1vw;display:flex;align-items:center;gap:1.2vw;cursor:pointer;transition:0.3s;box-shadow:0 0.8vw 2vw rgba(255,48,48,0.25)}.esc-menu-logout-btn:hover{background:#ff1010}.esc-menu-logout-text{color:#fff;font-weight:900;font-size:1.8vw;font-style:italic;text-transform:uppercase;letter-spacing:-0.05vw}.esc-menu-exit-btn{background-color:#ef4444!important;color:#fff!important;border:none!important;padding:0.4vw!important;border-radius:0.5vw!important;cursor:pointer!important;transition:all 0.3s ease!important;display:flex!important;align-items:center!important;justify-content:center!important}.esc-menu-exit-btn:hover{background-color:#dc2626!important;transform:rotate(90deg)!important}.esc-menu-data-box{background:#141414;border:0.1vw solid rgba(255,255,255,0.05);border-radius:1vw;padding:0 2vw;display:flex;align-items:center;font-weight:900;font-size:1.2vw;color:#f1c40f;letter-spacing:0.2vw}.esc-menu-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:2vw}.esc-menu-info-panel{background:#141414;border-radius:1.5vw;padding:2vw;border:0.1vw solid rgba(255,255,255,0.05)}.esc-menu-info-panel h3{color:#f1c40f;font-size:2.5vw;font-weight:900;font-style:italic;margin-top:0;margin-bottom:2vw}.esc-menu-info-row{display:flex;justify-content:space-between;border-bottom:0.1vw solid rgba(255,255,255,0.05);padding-bottom:0.5vw;margin-bottom:1vw}.esc-menu-info-row-label{color:#666;font-weight:900;font-style:italic;font-size:0.8vw}.esc-menu-info-row-value{font-weight:900;font-style:italic;font-size:1vw}.esc-menu-profile-circle{width:15vw;height:15vw;background:#f1c40f;border-radius:50%;display:flex;align-items:center;justify-content:center;border:0.5vw solid #000;box-shadow:0 1vw 3vw rgba(0,0,0,0.5);position:relative;z-index:2}.esc-menu-players-list-panel{background:#141414;border-radius:1.5vw;border:0.1vw solid rgba(255,255,255,0.05);display:flex;flex-direction:column;min-height:35vw;overflow:hidden}.esc-menu-players-header{padding:1.5vw;background:rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center}.esc-menu-players-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.8vw;padding:1vw;flex:1;align-content:flex-start}.esc-menu-player-card{background:rgba(255,255,255,0.05);padding:1vw;border-radius:0.8vw;display:flex;justify-content:space-between;align-items:center;border:0.1vw solid rgba(255,255,255,0.05)}.esc-menu-pagination{padding:1vw;border-top:0.1vw solid rgba(255,255,255,0.05);display:flex;justify-content:center;align-items:center;gap:2vw}.esc-menu-page-btn{width:3vw;height:3vw;border-radius:0.8vw;background:transparent;border:0.1vw solid rgba(255,255,255,0.05);color:#f1c40f;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.3s}.esc-menu-page-btn:hover:not(:disabled){background:#f1c40f;color:#000}.esc-menu-page-btn:disabled{opacity:0.2;cursor:not-allowed}.esc-menu-ticket-form{max-width:50vw;margin:0 auto;background:#141414;padding:3vw;border-radius:2vw;border:0.1vw solid rgba(255,255,255,0.05);text-align:center}.esc-menu-ticket-area{width:100%!important;height:10vw!important;background:rgba(0,0,0,0.4)!important;border:0.1vw solid rgba(255,255,255,0.05)!important;border-radius:1vw!important;padding:1vw!important;color:#fff!important;font-weight:700!important;outline:none!important;margin-bottom:1.5vw!important;box-sizing:border-box!important}.esc-menu-ticket-btn{width:100%;background:#f1c40f;border:none;padding:1vw;border-radius:1vw;font-size:1.2vw;font-weight:900;font-style:italic;cursor:pointer;transition:0.3s;color:#000}.esc-menu-ticket-btn:hover{transform:scale(1.02)}.esc-menu-notif-container{position:fixed;bottom:2vw;right:2vw;display:flex;flex-direction:column;gap:1vw;z-index:9999}.esc-menu-notification{padding:1vw 2vw;border-radius:0.8vw;font-weight:900;font-style:italic;font-size:1vw;display:flex;align-items:center;gap:1vw;box-shadow:0 1vw 3vw rgba(0,0,0,0.5);animation:tada 1s ease-in-out}.esc-menu-notif-error{background:#ff3030;color:#fff;border-left:0.4vw solid #900}.esc-menu-notif-success{background:#22c55e;color:#fff;border-left:0.4vw solid #060}.esc-menu-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(0.5vw);display:flex;align-items:center;justify-content:center;z-index:9000}.esc-menu-modal-content{background:#141414;border:0.1vw solid rgba(255,255,255,0.05);padding:3vw;border-radius:2vw;width:35vw;text-align:center;box-shadow:0 2vw 6vw rgba(0,0,0,0.8)}.esc-menu-modal-title{color:#f1c40f;font-size:2vw;font-weight:900;font-style:italic;margin-bottom:1.5vw}.esc-menu-modal-input{width:100%!important;background:rgba(0,0,0,0.4)!important;border:0.1vw solid rgba(255,255,255,0.1)!important;padding:1vw!important;border-radius:0.8vw!important;color:#fff!important;font-size:1.5vw!important;font-weight:900!important;text-align:center!important;margin:1vw 0!important;outline:none!important}.esc-menu-modal-input:focus{border-color:#f1c40f!important}.esc-menu-modal-buttons{display:flex;gap:1vw;margin-top:2vw}.esc-menu-modal-btn{flex:1;padding:1vw;border-radius:1vw;font-weight:900;font-style:italic;cursor:pointer;transition:0.3s;border:none}.esc-menu-btn-confirm{background:#f1c40f;color:#000}.esc-menu-btn-cancel{background:#333;color:#fff}.esc-menu-vehicle-list{display:flex;flex-direction:column;gap:0.5vw;max-height:15vw;overflow-y:auto;margin-top:1vw}.esc-menu-vehicle-item{background:rgba(255,255,255,0.05);padding:1vw;border-radius:0.8vw;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:0.2s}.esc-menu-vehicle-item:hover{background:rgba(241,196,15,0.1);border-color:#f1c40f}.esc-menu-vehicle-item.esc-menu-selected{background:#f1c40f;color:#000}@keyframes tada{0%{transform:scale(1)}10%,20%{transform:scale(0.9) rotate(-3deg)}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg)}40%,60%,80%{transform:scale(1.1) rotate(-3deg)}100%{transform:scale(1) rotate(0)}}@keyframes pulse{0%{opacity:1}50%{opacity:0.6}100%{opacity:1}}.esc-menu-scrollbar-hide::-webkit-scrollbar{display:none}
.reg-main-layout{flex:1;display:flex;gap:2vw;overflow:hidden;height:35vw}
.reg-sidebar{width:22vw;display:flex;flex-direction:column;gap:1vw}
.reg-search-box{background:#141414;border:0.1vw solid rgba(255,255,255,0.05);border-radius:1vw;padding:1vw;display:flex;align-items:center;gap:0.8vw}
.reg-search-box input{background:transparent;border:none;color:#fff;font-size:0.9vw;font-weight:700;outline:none;width:100%}
.reg-chapters-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0.5vw;padding-right:0.5vw}
.reg-chapter-card{background:#141414;border:0.1vw solid rgba(255,255,255,0.05);border-radius:1vw;padding:1.2vw;cursor:pointer;transition:0.3s;display:flex;align-items:center;justify-content:space-between}
.reg-chapter-card.active{border-color:#f1c40f;background:rgba(241,196,15,0.05)}
.reg-chapter-card:hover:not(.active){background:#1a1a1a}
.reg-chapter-info{display:flex;flex-direction:column}
.reg-chapter-title{font-size:1vw;font-weight:900;font-style:italic;color:#fff}
.reg-chapter-count{font-size:0.7vw;color:#666;font-weight:800}
.reg-chapter-card.active .reg-chapter-title{color:#f1c40f}
.reg-content-panel{flex:1;background:#141414;border:0.1vw solid rgba(255,255,255,0.05);border-radius:2vw;overflow:hidden;display:flex;flex-direction:column}
.reg-content-header{padding:2vw;background:rgba(255,255,255,0.02);border-bottom:0.1vw solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center}
.reg-content-header h2{margin:0;font-size:2.5vw;font-weight:900;font-style:italic;color:#f1c40f}
.reg-scroll-area{flex:1;overflow-y:auto;padding:2vw;scroll-behavior:smooth}
.reg-rule-block{margin-bottom:3vw;animation:regFadeIn 0.5s ease-out}
.reg-rule-header{display:flex;align-items:center;gap:1vw;margin-bottom:1vw}
.reg-rule-number{background:#f1c40f;color:#000;font-weight:900;padding:0.3vw 0.8vw;border-radius:0.4vw;font-size:1vw}
.reg-rule-name{font-size:1.8vw;font-weight:900;font-style:italic;color:#fff}
.reg-rule-text{font-size:1.1vw;color:#aaa;line-height:1.6;font-weight:500;white-space:pre-wrap;background:rgba(255,255,255,0.02);padding:1.5vw;border-radius:1vw;border:0.1vw solid rgba(255,255,255,0.03)}
@keyframes regFadeIn {from{opacity:0;transform:translateY(1vw)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* NOTIFICATIONS */}
      <div className="esc-menu-notif-container">
        {notifications.map((n: any) => (
          <div key={n.id} className={`esc-menu-notification ${n.type === 'error' ? 'esc-menu-notif-error' : 'esc-menu-notif-success'}`}>
            {n.type === 'error' ? <Icons.AlertTriangle size={24} /> : <Icons.CheckCircle size={24} />}
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {modal.active && (
        <div className="esc-menu-modal-overlay">
          <div className="esc-menu-modal-content">
            <ModalRenderer 
              type={modal.type} 
              data={modal.data} 
              onClose={closeModals} 
              onConfirm={completePurchase} 
              onError={addNotification}
              userVehicles={userData.vehicles}
            />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="esc-menu-header">
        <h1 className="esc-menu-header-title">MENIU</h1>
        <div className="esc-menu-stats-container">
          <div className="esc-menu-stat-box">
            <div className="esc-menu-stat-icon"><Icons.Wallet size={24} /></div>
            <div className="esc-menu-stat-info">
              <span className="esc-menu-stat-label">CARD</span>
              <span className="esc-menu-stat-value">{userData.cash} RON</span>
            </div>
          </div>
          <div className="esc-menu-stat-box">
            <div className="esc-menu-stat-icon"><Icons.Landmark size={24} /></div>
            <div className="esc-menu-stat-info">
              <span className="esc-menu-stat-label">BANK</span>
              <span className="esc-menu-stat-value">{userData.bank} RON</span>
            </div>
          </div>
          <div className="esc-menu-coins-box">
            <div className="esc-menu-coins-label"><span>EMP</span><span>COINS</span></div>
            <span className="esc-menu-coins-value">{empCoins}</span>
          </div>
          <button className="esc-menu-exit-btn" onClick={() => rpc.callClient('Browser-HidePage')}>
            <Icons.X size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="esc-menu-top-menu">
        {topMenuItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`esc-menu-top-btn ${activeTab === item.id || (activeTab === 'SHOP' && item.id === 'PRINCIPAL') ? 'esc-menu-active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="esc-menu-content-area esc-menu-scrollbar-hide">
        {renderContent()}
      </div>

      <div className="esc-menu-footer">
        <div className="esc-menu-footer-stats">
          <FooterCard label="ID" value={userData.id} color="#f1c40f" />
          <FooterCard label="NUME" value={userData.nume} />
          <FooterCard label="ORE JUCATE" value={userData.oreJucate} />
          <FooterCard label="JOB" value={userData.job} />
          <FooterCard label="FACȚIUNE" value={userData.factiune} />
        </div>
        <div style={{ display: 'flex', gap: '1vw' }}>
          <div className="esc-menu-data-box">{currentDateStr}</div>
        </div>
      </div>
    </div>
  );
};

/* --- COMPONENTE MODAL --- */

const ModalRenderer = ({ type, data, onClose, onConfirm, onError, userVehicles }: any) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [step, setStep] = useState(type === 'VEHICLE_SELECT' ? 'SELECT' : 'INPUT');

  const takenData = ['123456', '000000', '666666', '1'];

  const handleNext = () => {
    if (type === 'PHONE' || type === 'LOW ID') {
      if (type === 'PHONE' && inputValue.length !== 6) {
        onError("NUMARUL DE TELEFON TREBUIE SA AIBA 6 CIFRE!", "error");
        return;
      }
      if (inputValue === '') {
        onError("TE RUGAM SA INTRODUCI O VALOARE!", "error");
        return;
      }
      if (takenData.includes(inputValue)) {
        onError("ACEASTA VALOARE ESTE DEJA LUATA!", "error");
        return;
      }
      setStep('CONFIRM');
    }

    if (type === 'VEHICLE_SELECT') {
      if (step === 'SELECT') {
        if (!selectedVehicle) {
          onError("TE RUGAM SA ALEGI UN VEHICUL!", "error");
          return;
        }
        setStep('INPUT_PLATE');
      } else if (step === 'INPUT_PLATE') {
        const plateRegex = /^LS \d{2} [A-Z]{3}$/;
        if (!plateRegex.test(inputValue.toUpperCase())) {
          onError("FORMAT PLACUTA INVALID! (Ex: LS 01 DAN)", "error");
          return;
        }
        setStep('CONFIRM');
      }
    }
  };

  if (step === 'CONFIRM' || type === 'CONFIRM') {
    return (
      <>
        <div className="esc-menu-modal-title">CONFIRMARE ACHIZITIE</div>
        <p style={{ fontSize: '1.2vw', color: '#ccc' }}>
          ESTI SIGUR CA VREI SA ACHIZITIONEZI <span style={{ color: '#f1c40f', fontWeight: 900 }}>{data.t}</span>?
          {inputValue && <><br /><span style={{ fontSize: '0.9vw', opacity: 0.7 }}>VALOARE: {inputValue.toUpperCase()}</span></>}
          {selectedVehicle && <><br /><span style={{ fontSize: '0.9vw', opacity: 0.7 }}>VEHICUL: {selectedVehicle.model}</span></>}
        </p>
        <div className="esc-menu-modal-buttons">
          <button className="esc-menu-modal-btn esc-menu-btn-cancel" onClick={onClose}>ANULEAZA</button>
          <button className="esc-menu-modal-btn esc-menu-btn-confirm" onClick={() => onConfirm(data, inputValue)}>CONFIRMA</button>
        </div>
      </>
    );
  }

  if (type === 'PHONE' || type === 'LOW ID') {
    return (
      <>
        <div className="esc-menu-modal-title">ALEGE {type === 'PHONE' ? 'NUMAR TELEFON' : 'ID'}</div>
        <p style={{ color: '#666' }}>{type === 'PHONE' ? 'Introdu un numar de 6 cifre.' : 'Introdu ID-ul dorit.'}</p>
        <input 
          className="esc-menu-modal-input" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, '').slice(0, type === 'PHONE' ? 6 : 4))}
          placeholder={type === 'PHONE' ? "123456" : "7"}
          autoFocus
        />
        <div className="esc-menu-modal-buttons">
          <button className="esc-menu-modal-btn esc-menu-btn-cancel" onClick={onClose}>ANULEAZA</button>
          <button className="esc-menu-modal-btn esc-menu-btn-confirm" onClick={handleNext}>VERIFICA</button>
        </div>
      </>
    );
  }

  if (type === 'VEHICLE_SELECT') {
    if (step === 'SELECT') {
      return (
        <>
          <div className="esc-menu-modal-title">ALEGE VEHICULUL</div>
          <div className="esc-menu-vehicle-list esc-menu-scrollbar-hide">
            {userVehicles.map((v: any) => (
              <div 
                key={v.id} 
                className={`esc-menu-vehicle-item ${selectedVehicle?.id === v.id ? 'esc-menu-selected' : ''}`}
                onClick={() => setSelectedVehicle(v)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
                  <Icons.Car size={18} />
                  <span>{v.model}</span>
                </div>
                <span style={{ fontSize: '0.8vw', opacity: 0.6 }}>{v.plate}</span>
              </div>
            ))}
          </div>
          <div className="esc-menu-modal-buttons">
            <button className="esc-menu-modal-btn esc-menu-btn-cancel" onClick={onClose}>ANULEAZA</button>
            <button className="esc-menu-modal-btn esc-menu-btn-confirm" onClick={handleNext}>CONTINUA</button>
          </div>
        </>
      );
    }
    if (step === 'INPUT_PLATE') {
      return (
        <>
          <div className="esc-menu-modal-title">ALEGE NUMARUL</div>
          <p style={{ color: '#666' }}>FORMAT: LS XX XXX (ex: LS 01 DAN)</p>
          <input 
            className="esc-menu-modal-input" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value.toUpperCase().slice(0, 9))}
            placeholder="LS 01 DAN"
            autoFocus
          />
          <div className="esc-menu-modal-buttons">
            <button className="esc-menu-modal-btn esc-menu-btn-cancel" onClick={() => setStep('SELECT')}>INAPOI</button>
            <button className="esc-menu-modal-btn esc-menu-btn-confirm" onClick={handleNext}>CONFIRMA</button>
          </div>
        </>
      );
    }
  }

  return null;
};

/* --- PAGINI --- */

const FooterCard = ({ label, value, color, onJobClick }: any) => (
  <div className="esc-menu-footer-card">
    <span className="esc-menu-footer-card-label">{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
      <span className="esc-menu-footer-card-value" style={{ color: color || '#fff' }}>{value}</span>
      {onJobClick && (
        <button 
          onClick={onJobClick}
          title="Pune waypoint la locație"
          style={{ background: 'rgba(241,196,15,0.1)', border: '0.1vw solid #f1c40f', color: '#f1c40f', borderRadius: '0.3vw', padding: '0.2vw 0.5vw', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icons.Compass size={14} />
        </button>
      )}
    </div>
  </div>
);

const CharacterPage = ({ user }: any) => (
  <div className="esc-menu-info-grid">
    <div className="esc-menu-info-panel">
      <h3>INFORMATII PERSONALE</h3>
      <InfoRow label="NUME COMPLET" value={user.nume} />
      <InfoRow label="VARSTA" value={`${user.varsta} ANI`} />
      <InfoRow label="NUMAR TELEFON" value={user.telefon} />
      <InfoRow label="LEVEL" value={user.level} />
      <InfoRow label="ORE JUCATE" value={`${user.oreJucate} ORE`} />
      <InfoRow label="JOB" value={user.job} />
    </div>
    <div className="esc-menu-info-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', right: '-1vw', bottom: '-1vw', fontSize: '15vw', fontWeight: 900, fontStyle: 'italic', opacity: 0.05, transform: 'rotate(12deg)' }}>{user.nume}</div>
      <div className="esc-menu-profile-circle"><Icons.User size={120} /></div>
      <div style={{ marginTop: '2vw', textAlign: 'center' }}>
        <p style={{ color: '#f1c40f', fontWeight: 900, fontSize: '2vw', fontStyle: 'italic', margin: 0 }}>{user.nume}</p>
        <p style={{ color: '#666', fontWeight: 700, fontSize: '0.8vw', letterSpacing: '0.3vw', margin: 0 }}>CETATEAN MODEL</p>
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value, onClick }: any) => (
  <div className="esc-menu-info-row">
    <span className="esc-menu-info-row-label">{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
      <span className="esc-menu-info-row-value">{value}</span>
      {onClick && (
        <button 
          onClick={onClick}
          title="Pune waypoint la locație"
          style={{ background: 'rgba(241,196,15,0.1)', border: '0.1vw solid #f1c40f', color: '#f1c40f', borderRadius: '0.3vw', padding: '0.2vw 0.5vw', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icons.Compass size={14} />
        </button>
      )}
    </div>
  </div>
);

const HudSettingsPage = () => {
  const [settings, setSettings] = useState(() => {
    let baseVisibility = {
      showLogo: true, showIdUsers: true, showMoneyCash: true, showMissions: true,
      showSpeedometer: true, showHealthArmor: true, showFoodWater: true,
      showStamina: true, showMic: true, showLocation: true, showMinimap: true,
      showChat: true, showBinds: true
    };
    try {
      if ((window as any).lastHudSettingsVisibility) {
        const parsed = JSON.parse((window as any).lastHudSettingsVisibility);
        const incoming = parsed.visibility ? parsed.visibility : parsed;
        // Merge only keys that exist in baseVisibility
        Object.keys(baseVisibility).forEach(k => {
          if (incoming[k] !== undefined) {
            (baseVisibility as any)[k] = incoming[k];
          }
        });
      }
    } catch(e) {}
    return baseVisibility;
  });

  const labels: { [key: string]: string } = {
    showLogo: "ARATA LOGO", showIdUsers: "ARATA ID & USERI", showMoneyCash: "ARATA BANI CASH",
    showMissions: "ARATA MISIUNI", showSpeedometer: "ARATA VITEZOMETRU", showHealthArmor: "ARATA VIATA & ARMURA",
    showFoodWater: "ARATA MANCARE & APA", showStamina: "ARATA STAMINA", showMic: "ARATA MICROFON",
    showLocation: "ARATA LOCATIA", showMinimap: "ARATA MINIMAP", showChat: "ARATA CHAT", showBinds: "ARATA COMENZI/BINDS"
  };

  const toggle = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings as any);
    try {
      if ((window as any).mp) {
        (window as any).mp.trigger('client:updateHudVisibility', JSON.stringify(newSettings));
        (window as any).mp.trigger('client:saveHudSettings', JSON.stringify({ visibility: newSettings }));
      }
    } catch(e) {}
  };

  return (
    <div className="esc-menu-info-grid" style={{ gap: '1vw', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {Object.entries(settings).map(([key, val]) => (
        <div key={key} className="esc-menu-info-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1vw 1.5vw' }}>
          <span style={{ fontSize: '0.8vw', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}>{labels[key] || key}</span>
          <div onClick={() => toggle(key)} style={{ width: '3vw', height: '1.5vw', borderRadius: '1vw', background: val ? '#f1c40f' : '#333', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}>
            <div style={{ width: '1.1vw', height: '1.1vw', background: '#fff', borderRadius: '50%', position: 'absolute', top: '0.2vw', left: val ? '1.7vw' : '0.2vw', transition: '0.3s' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const FactionPage = ({ user }: any) => (
  <div className="esc-menu-info-panel" style={{ width: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3vw' }}>
      <div>
        <h3 style={{ fontSize: '3vw', marginBottom: '0.5vw' }}>{user.factiune}</h3>
      </div>
    </div>
    <div className="esc-menu-info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1vw' }}>
      <div className="esc-menu-stat-box" style={{ justifyContent: 'center', padding: '2vw', flexDirection: 'column' }}>
        <span className="esc-menu-stat-label">MEMBRI ONLINE</span>
        <span className="esc-menu-stat-value" style={{ color: '#fff' }}>{user.factionMembersOnline}</span>
      </div>
      <div className="esc-menu-stat-box" style={{ justifyContent: 'center', padding: '2vw', flexDirection: 'column' }}>
        <span className="esc-menu-stat-label">RANK-UL TAU</span>
        <span className="esc-menu-stat-value" style={{ color: '#fff' }}>{user.rank}</span>
      </div>
    </div>
  </div>
);

const PlayersPage = ({ players = [] }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const filtered = players.filter((p: any) => 
     p.name.toLowerCase().includes(search.toLowerCase()) || 
     p.id.toString().includes(search)
  ).sort((a: any, b: any) => a.id - b.id);
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPlayers = filtered.slice((currentPage - 1) * 12, currentPage * 12);

  return (
    <div className="esc-menu-players-list-panel">
      <div className="esc-menu-players-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', color: '#f1c40f' }}>
          <Icons.Users size={24} />
          <span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '1.2vw' }}>LISTA JUCATORI ONLINE ({players.length})</span>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.5vw 1vw', borderRadius: '0.8vw', display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <Icons.Search size={16} color="#666" />
          <input 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="CAUTA..." 
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8vw', outline: 'none', width: '12vw', fontWeight: 700 }} 
          />
        </div>
      </div>
      <div className="esc-menu-players-grid">
        {currentPlayers.map((p: any) => (
          <div key={p.id} className="esc-menu-player-card">
            <span style={{ fontWeight: 900, fontStyle: 'italic', color: '#f1c40f' }}>ID {p.id}</span>
            <span style={{ color: '#aaa', fontWeight: 700, fontSize: '0.7vw' }}>{p.name}</span>
          </div>
        ))}
      </div>
      <div className="esc-menu-pagination">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="esc-menu-page-btn"><Icons.ChevronLeft /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <span style={{ color: '#666', fontWeight: 900, fontStyle: 'italic' }}>PAGINA</span>
          <span style={{ background: '#f1c40f', color: '#000', padding: '0.3vw 1vw', borderRadius: '0.5vw', fontWeight: 900 }}>{currentPage}</span>
          <span style={{ color: '#666', fontWeight: 900, fontStyle: 'italic' }}>DIN {totalPages}</span>
        </div>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="esc-menu-page-btn"><Icons.ChevronRight /></button>
      </div>
    </div>
  );
};

const ShopPage = ({ onPurchase }: any) => {
  const shopItems = [
    { t: 'VIP Rookie', s: 'ROOKIE', p: '100 EMP', img: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=400' },
    { t: 'VIP Hustler', s: 'HUSTLER', p: '250 EMP', img: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=400' },
    { t: 'VIP Shoota', s: 'SHOOTA', p: '500 EMP', img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400' },
    { t: 'VIP O.G.', s: 'O.G.', p: '750 EMP', img: 'https://images.unsplash.com/photo-1605146764387-6d76d342240a?auto=format&fit=crop&q=80&w=400' },
    { t: 'VIP Kingpin', s: 'KINGPIN', p: '1000 EMP', img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&q=80&w=400' },
    { t: 'Numar de telefon preferential', s: 'PHONE', p: '300 EMP', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400' },
    { t: 'Numar de inmatriculare', s: 'PLATES', p: '200 EMP', img: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=400' },
    { t: 'ID Jucator mic', s: 'LOW ID', p: '1500 EMP', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400' },
    { t: 'Masini', s: 'MASINI', p: 'DESCHIDE SHOP', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400' },
    { t: 'Haine', s: 'HAINE', p: 'DESCHIDE SHOP', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="esc-menu-main-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1vw' }}>
      {shopItems.map((item, i) => (
        <div key={i} className="esc-menu-card-item" style={{ height: '18vw' }}>
          <div className="esc-menu-card-bg">
            <img src={item.img} alt={item.t} />
            <div className="esc-menu-card-overlay" />
          </div>
          <div className="esc-menu-card-content" style={{ padding: '1vw', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '100%', textAlign: 'left' }}>
              <span className="esc-menu-stat-label-clear">{item.t.toUpperCase()}</span>
            </div>
            <h2 className="esc-menu-card-title" style={{ fontSize: i >= 8 ? '2.2vw' : '2.5vw', margin: '1vw 0' }}>{item.s}</h2>
            <button className="esc-menu-ticket-btn" onClick={() => onPurchase(item)} style={{ fontSize: '1.05vw', padding: '0.8vw' }}>{item.p}</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const MissionsPage = () => (
  <div className="esc-menu-info-panel">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2vw' }}>
      <h3 style={{ margin: 0 }}>BATTLEPASS - SEZON 1</h3>
      <span style={{ color: '#666', fontWeight: 900, fontStyle: 'italic' }}>LEVEL 12 / 50</span>
    </div>
    <div style={{ width: '100%', height: '1vw', background: 'rgba(255,255,255,0.05)', borderRadius: '1vw', overflow: 'hidden', marginBottom: '3vw' }}>
      <div style={{ width: '24%', height: '100%', background: '#f1c40f' }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw' }}>
      <MissionRow label="Realizeaza 5 curse la Job-ul de Curier" prog="2/5" />
      <MissionRow label="Vinde un vehicul in Marketplace" prog="0/1" />
      <MissionRow label="Petrece 3 ore pe server" prog="3/3" done />
    </div>
  </div>
);

const MissionRow = ({ label, prog, done }: any) => (
  <div style={{ padding: '1vw', borderRadius: '1vw', background: done ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.2)', border: '0.1vw solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
      {done ? <Icons.CheckCircle color="#22c55e" size={20} /> : <Icons.Clock color="#f1c40f" size={20} />}
      <span style={{ fontWeight: 900, fontStyle: 'italic', color: done ? '#22c55e' : '#fff', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1 }}>{label}</span>
    </div>
    <span style={{ fontWeight: 900, fontStyle: 'italic', color: '#f1c40f' }}>{prog}</span>
  </div>
);

const JobsPage = () => (
  <div className="esc-menu-info-grid">
    {['Curier', 'Miner', 'Pescar', 'Taietor Lemne'].map((job, i) => (
      <div key={i} className="esc-menu-info-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw' }}>
          <div style={{ width: '4vw', height: '4vw', background: '#f1c40f', borderRadius: '1vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Briefcase color="black" size={32} /></div>
          <div>
            <p style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '1.5vw', margin: 0 }}>{job}</p>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.8vw', letterSpacing: '0.1vw', margin: 0 }}>PLATA: $250 / TASK</p>
          </div>
        </div>
        <button style={{ background: 'transparent', border: '0.1vw solid #f1c40f', color: '#f1c40f', padding: '0.8vw 1.5vw', borderRadius: '0.5vw', fontWeight: 900, fontStyle: 'italic', cursor: 'pointer' }}>GPS</button>
      </div>
    ))}
  </div>
);

const RegulamentPage = () => {
  const [activeChapter, setActiveChapter] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const regulamentData = [
    { title: "CAP. 1: Sancțiuni Aplicabile", rules: [
      { id: "01", name: "Sancțiuni Aplicabile", content: "Fiecare regulă stabilită în prezentul regulament are rolul de a asigura un mediu de joc autentic, echilibrat și respectuos în cadrul comunității EmpireRP. Abaterile de la aceste norme, indiferent de natura sau gravitatea lor, sunt considerate acțiuni care perturbă experiența de joc și compromit buna desfășurare a interacțiunilor între jucători.\n\nÎn funcție de specificul fiecărei încălcări, sancțiunile aplicabile pot include, dar nu se limitează la:\n* Avertismente — acordate jucătorilor pentru încălcări minore, în scopul de a corecta comportamentul neconform.\n* Interdicții temporare (ban provizoriu) — aplicate pentru abateri moderate, cu sau fără posibilitatea de reintrare pe server prin achitarea unei taxe, conform politicii sancțiunilor serverului.\n* Interdicții permanente (ban permanent) — utilizate pentru abateri grave sau pentru comportamente repetate care încalcă principiile și regulile serverului, inclusiv fără drept de plată pentru acces ulterior.\n* Excluderea completă din anumite activități sau interacțiuni ale serverului, cum ar fi restricții pentru accesul la organizații sau interacțiunile speciale, în cazurile de abateri severe.\n\nAceste măsuri disciplinare sunt stabilite la discreția echipei de administrare a serverului, în funcție de gravitatea fiecărei abateri și de contextul în care a avut loc încălcarea. Astfel, fiecare jucător este responsabil de respectarea integrală a regulamentului și de menținerea unui comportament care susține calitatea și autenticitatea experienței de joc în comunitatea EmpireRP." },
      { id: "02", name: "Acumularea de Avertismente (4 WARNURI)", content: "Conform regulamentului serverului EmpireRP, acumularea a patru avertismente (denumite în continuare „warn-uri”) atrage după sine aplicarea automată a sancțiunii de suspendare (ban) a contului utilizatorului respectiv. Avertismentele sunt emise de către administrația serverului pentru încălcarea regulilor stabilite, în funcție de gravitatea și frecvența abaterilor, și sunt înregistrate conform deciziei discreționare a administratorilor.\n\nPrin acceptarea acestor termeni, utilizatorul este de acord cu consecințele acumulării de avertismente și cu suspendarea automată a contului său la atingerea limitei de patru avertismente, fără a fi necesară o notificare suplimentară din partea echipei de administrare." },
      { id: "03", name: "Sancțiuni Acumulate", content: "Pentru a menține standardele de conduită și a descuraja recidiva comportamentală, în cadrul comunității EmpireRP se aplică următoarea politică de sancțiuni progresive și cumulative:\n\n* În cazul în care un utilizator acumulează 5 (cinci) suspendări temporare („ban-uri provizorii”) în decursul activității sale, contul acestuia va fi suspendat permanent, cu posibilitatea reactivării condiționate de plata unei taxe stabilite de administrație.\n* În situația în care un utilizator a primit 2 (două) suspendări permanente („ban-uri permanente”), aplicate succesiv ca urmare a suspendărilor temporare, acesta va fi supus unei suspendări permanente („ban-uri permanente”) definitive și irevocabile, fără drept de plată.\n* La calculul suspendărilor permanente consecutive, dacă de la data aplicării ultimei suspendări permanente au trecut 6 (șase) luni, aceasta nu va mai fi contorizată în aplicarea regulii de suspendare permanentă fără drept de plată. Aceasta implică faptul că, în lipsa unor sancțiuni repetate în perioada de șase luni, utilizatorul beneficiază de o excepție de la regula suspendării permanente fără drept de plată.\n* Această politică de sancțiuni este implementată cu scopul de a asigura un cadru de joc adecvat și de a încuraja comportamentul responsabil în cadrul comunității." },
      { id: "04", name: "BAN Provizoriu Fără Drept de Plată", content: "Această prevedere a fost introdusă pentru a preveni abuzurile legate de opțiunea de revocare a interdicțiilor temporare prin plată. În cadrul Comunității EmpireRP, pentru următoarele abateri se va aplica una de suspendare temporară a accesului fără drept de plată:\n\n* Deconectare intenționată în timpul unei acțiuni Roleplay — Suspendare ( BAN ) de 14 zile fără posibilitate de a primi dreptul de plată.\n* Metagaming / Mixing — Suspendare ( BAN ) de 7 zile fără posibilitate de a primi dreptul de plată.\n* No-Fear — Suspendare ( BAN ) de 7 zile fără posibilitate de a primi dreptul de plată.\n* Reacții ( PLÂNS ) nejustificate — Suspendare ( BAN ) de 1 zi fără posibilitate de a primi dreptul de plată; aplicabil jucătorilor care manifestă comportamente exagerate sau reacții disproporționate în situații roleplay sau față de deciziile luate de administrație." }
    ]},
    { title: "CAP. 2: Regulament Roleplay", rules: [
      { id: "01", name: "Despre Roleplay (RP)", content: "Termenul „Roleplay” (abreviat „RP”) în cadrul comunității EmpireRP face referire la simularea unei vieți reale în mediul virtual oferit de server. Roleplay-ul implică angajarea jucătorilor într-o experiență de joc caracterizată de interpretarea unui personaj fictiv care interacționează într-un oraș virtual, precum Los Santos, reflectând norme, comportamente și interacțiuni sociale similare celor din viața reală." },
      { id: "02", name: "In-Character (IC)", content: "Termenul „In-Character” (abreviat „IC”) se referă exclusiv la acțiunile, informațiile și interacțiunile realizate în cadrul jocului, conform rolului jucat de fiecare participant și în acord cu lumea virtuală a serverului." },
      { id: "03", name: "Out of Character (OOC)", content: "Termenul „Out of Character” (abreviat „OOC”) desemnează acele acțiuni, informațiile și comunicări care aparțin realității și vieții personale ale jucătorilor, separate de contextul și rolul jucat pe server. Comunicările OOC sunt permise numai în spațiile de chat specific destinate acestei funcții." },
      { id: "04", name: "MetaGaming (MG)", content: "Utilizarea informațiilor obținute în afara cadrului de joc (OOC) pentru a influența sau facilita acțiuni desfășurate în joc (IC) este strict interzisă." },
      { id: "05", name: "PowerGaming (PG)", content: "Se interzice strict practica de PowerGaming (PG). PowerGaming reprezintă acțiunea prin care un jucător își impune acțiunile asupra altui participant într-un mod unilateral, fără a permite răspunsul sau reacția acestuia." },
      { id: "06", name: "Death Match (DM)", content: "Este strict interzisă practica cunoscută sub denumirea de Death Match (DM). Death Match se referă la angajarea într-o acțiune de eliminare a unui alt jucător fără un motiv IC adecvat și valid." },
      { id: "07", name: "Revenge Kill (RK)", content: "Este strict interzisă practica de Revenge Kill (RK). Revenge Kill se referă la actul prin care un jucător, după ce a fost eliminat de un alt participant IC, revine pentru a se răzbuna." },
      { id: "08", name: "Mixing (MX)", content: "Practica de Mixing (MX) este strict interzisă. Mixing-ul reprezintă transferul de informații între contextul IC în OOC, afectând realismul și integritatea interacțiunilor de roleplay." },
      { id: "09", name: "Character Kill (CK)", content: "Character Kill (CK) se referă la eliminarea definitivă a unui personaj. În cazul în care un jucător este supus unui CK, acesta va pierde toate progresele și va trebui să își creeze un nou personaj." },
      { id: "10", name: "Player-Kill (PK)", content: "Termenul „Player-Kill” (abreviat „PK”) se referă la o procedură prin care toate informațiile de tip IC asociate unui anumit rol sau caracter sunt resetate." },
      { id: "11", name: "Olympic Swim (OS)", content: "Termenul „Olympic Swim” se referă la comportamentul prin care un jucător înoată pe distanțe foarte mari fără oprire sau odihnă." },
      { id: "12", name: "No-Fear (NF)", content: "Conceptul de „No-Fear” desemnează situațiile în care un jucător nu simulează corect și realist sentimentul de frică." },
      { id: "13", name: "Cop Fear (CF)", content: "Conceptul de „Cop Fear” este o extensie a regulii privind simularea fricii (No-Fear) și stabilește necesitatea ca jucătorii să respecte autoritatea agenților de poliție." },
      { id: "14", name: "Drop & Kill (DK)", content: "Este strict interzis să constrângeți un alt jucător să renunțe la toate bunurile deținute, iar ulterior să îl eliminați." },
      { id: "15", name: "Rob & Kill (RB)", content: "Este strict interzis ca un jucător să comită acte de jaf asupra unei persoane și ulterior să o ucidă." },
      { id: "16", name: "RP Dezgustător", content: "Se interzice inițierea și participarea la acțiuni roleplay care implică acte de abuz sexual, canibalism, necrofilie, pedofilie și alte forme de roleplay considerate obscene fără acord OOC." }
    ]},
    { title: "CAP. 3: Regulament OOC", rules: [
      { id: "01", name: "Atitudini Ofensatoare", content: "Se interzice orice formă de exprimare verbală ostilă, intimidare sau jignire." },
      { id: "02", name: "BAN EVADE", content: "Evaziunea interdicției reprezintă încercarea unui utilizator de a evita o interdicție prin accesarea serverului de pe un cont alternativ. Este strict interzis." },
      { id: "03", name: "Account Sharing", content: "Transferul sau partajarea contului personal către orice altă persoană este strict interzisă." },
      { id: "04", name: "Reclamație Nejustificată", content: "Reclamațiile pot fi formulate doar de către jucătorii implicați direct și în termen de maximum 24 de ore." },
      { id: "05", name: "Înșelăciune (SCAM)", content: "SCAM-ul este permis doar exclusiv prin roleplay, fără a folosi informații OOC sau a încălca regulile administrative." },
      { id: "06", name: "Trolling", content: "Este strict interzis comportamentul care are ca scop deranjarea deliberată a experienței de joc a celorlalți." },
      { id: "07", name: "Reclamă", content: "Comunitatea EmpireRP interzice strict orice formă de promovare a altor comunități sau platforme." },
      { id: "08", name: "Bug Abuse", content: "Exploatarea defectelor tehnice constă în utilizarea intenționată a unor bug-uri pentru a obține avantaje nejustificate. Este obligatorie raportarea bug-urilor." },
      { id: "09", name: "Hack / Programe Neautorizate", content: "Este interzisă utilizarea oricăror forme de software care oferă avantaje nejustificate (aimbot, speedhack, etc.)." },
      { id: "10", name: "Afilierea cu Comunități Externe", content: "Este interzisă apartenența la grupuri care practică sau susțin activități ce contravin regulilor EmpireRP." },
      { id: "11", name: "Înregistrare Video", content: "Orice jucător care dorește să utilizeze o armă de foc are obligația să asigure înregistrarea video completă a acțiunii." },
      { id: "12", name: "Interpretare Subiectivă", content: "Interpretarea liberă a regulamentului în favoarea proprie este strict interzisă. Echipa administrativă are decizia finală." },
      { id: "13", name: "Tranzacții OOC", content: "Este strict interzis schimbul de bunuri din joc contra sume de bani reali / OOC." },
      { id: "14", name: "Amenințări Staff", content: "Este interzis să pretindeți influență asupra membrilor staff sau să emiteți amenințări administrative." },
      { id: "15", name: "Acte de Instigare", content: "Este interzis să instigați alte persoane să încalce regulamentul." },
      { id: "16", name: "Nume IC Nerecomandate", content: "Se interzice utilizarea numelor celebre, nerealiste sau cu scop de batjocură." },
      { id: "17", name: "Nume cu Referințe OOC", content: "Este interzisă folosirea de nume ce conțin link-uri sau referințe comerciale." },
      { id: "18", name: "Comportament față de Femei", content: "Este strict interzis comportamentul inadecvat, ofensator sau vulgar față de persoanele de sex feminin." },
      { id: "19", name: "Comportament Toxic", content: "Se sancționează cu ban permanent persoanele care manifestă o conduită toxică (instigare la ură, hărțuire, jigniri repetate)." }
    ]},
    { title: "CAP. 4: Regulament General", rules: [
      { id: "01", name: "Joburi Legale", content: "Este interzis jaful sau răpirea în timpul jobului legal. Uniformele și vehiculele de job trebuie folosite corespunzător." },
      { id: "02", name: "Acte de Răpire", content: "Este interzisă răpirea de unul singur în vehicul. Nu se cer recompense policiei." },
      { id: "03", name: "Evenimente Organizate", content: "Perturbarea evenimentelor publice fără aprobare admin este interzisă." },
      { id: "04", name: "Conducere Non-RP", content: "Se interzice circulația off-road nejustificată, viteza excesivă pe drumuri neasfaltate și aterizările de elicopter neconforme." },
      { id: "05", name: "Manevra PIT-STOP", content: "Interzis PIT-STOP peste 150 km/h. Permis doar pentru anumite clase de vehicule." },
      { id: "06", name: "Transport Deținuți", content: "Intervenția permisă doar membrilor aceleași organizații pentru lider sau minim 4 membri." },
      { id: "07", name: "AFK / Refuz RP", content: "Refuzul de a participa la RP prin desconectare sau AFK este interzis." },
      { id: "08", name: "Streaming", content: "Streamerii trebuie să respecte imaginea comunității și să păstreze confidențialitatea discuțiilor cu staff-ul." },
      { id: "09", name: "Jafuri Persoane", content: "Minim 150 ore, interval orar 20:00-08:00, interzis pe joburi legale sau poliție/medici." },
      { id: "10", name: "Jafuri Vehicule/Case", content: "Minim 100 ore, fără martori în zonă, fără ostatici." },
      { id: "11", name: "Organizații IC", content: "Denumirile trebuie să fie originale. Maxim 8 oficiale și 8 neoficiale." },
      { id: "12", name: "Comportament Închisoare", content: "Violența permisă doar în prezența gardienilor. Obligație de frică față de autorități." }
    ]}
  ];

  return (
    <div className="reg-main-layout">
      <div className="reg-sidebar">
        <div className="reg-search-box">
          <Icons.Search size={18} color="#666" />
          <input placeholder="CAUTĂ O REGULĂ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="reg-chapters-list">
          {regulamentData.map((cap, index) => (
            <div key={index} className={`reg-chapter-card ${activeChapter === index ? 'active' : ''}`} onClick={() => setActiveChapter(index)}>
              <div className="reg-chapter-info">
                <span className="reg-chapter-count">CAPITOLUL {index + 1}</span>
                <span className="reg-chapter-title">{cap.title.split(': ')[1]}</span>
              </div>
              <Icons.ChevronRight size={16} color={activeChapter === index ? "#f1c40f" : "#444"} />
            </div>
          ))}
        </div>
      </div>
      <div className="reg-content-panel">
        <div className="reg-content-header">
          <h2>{regulamentData[activeChapter].title}</h2>
          <div style={{ padding: '0.5vw 1.2vw', borderRadius: '0.5vw', background: 'rgba(255,255,255,0.05)', color: '#666', fontSize: '0.8vw', fontWeight: 900 }}>
            {regulamentData[activeChapter].rules.length} REGULI TOTAL
          </div>
        </div>
        <div className="reg-scroll-area">
          {regulamentData[activeChapter].rules
            .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((rule) => (
            <div key={rule.id} className="reg-rule-block">
              <div className="reg-rule-header">
                <span className="reg-rule-number">{rule.id}</span>
                <h3 className="reg-rule-name">{rule.name.toUpperCase()}</h3>
              </div>
              <div className="reg-rule-text">{rule.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TicketPage = () => (
  <div className="esc-menu-ticket-form">
    <Icons.Ticket size={64} color="#f1c40f" style={{ marginBottom: '1vw' }} />
    <h3 style={{ margin: 0, fontSize: '2vw' }}>CREEAZA UN TICKET</h3>
    <p style={{ color: '#666', marginBottom: '2vw' }}>Un membru staff iti va prelua cererea imediat.</p>
    <textarea className="esc-menu-ticket-area" placeholder="DESCRIE PROBLEMA TA..." />
    <button className="esc-menu-ticket-btn">TRIMITE CEREREA</button>
  </div>
);

export default EscMenu;
