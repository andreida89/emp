import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';

/**
 * Interfață de tabletă landscape (iPad Style) - VERSUNE NOUA
 * Unități: vh, vw, % (fără px).
 */
export default function Tablet() {
  const [currentTime, setCurrentTime] = useState('');
  const [activeApp, setActiveApp] = useState('home');
  const [factionTab, setFactionTab] = useState('grade');
  
  // State pentru data de pe server
  const [grade, setGrade] = useState<{id: string, name: string, vaultAccess?: boolean}[]>([]);
  const [membri, setMembri] = useState<{userId: string, name: string, rank: string, online: boolean}[]>([]);
  const [userRank, setUserRank] = useState('');
  const [factionName, setFactionName] = useState('Anonim');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);

    // Initial data load
    const loadData = async () => {
        try {
            const ranks = await rpc.callServer('Faction-GetRanks');
            const members = await rpc.callServer('Faction-GetMembers', 0);
            const myRank = await rpc.callServer('Faction-GetPlayerRank');
            const name = await rpc.callServer('Faction-GetFactionName');
            
            setGrade(ranks);
            setMembri(members);
            setUserRank(myRank || '');
            setFactionName(name || 'Nicio Organizație');
        } catch (e) {
            console.error('Error loading faction data:', e);
        } finally {
            setLoading(false);
        }
    };
    loadData();

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const handleAction = async (type: 'grade' | 'member', action: 'add' | 'edit' | 'delete', data: any) => {
    setError(null);
    try {
        if (type === 'grade') {
            const newList = await rpc.callServer('Faction-ManageRank', [action, data]);
            setGrade(newList);
        } else {
            const newList = await rpc.callServer('Faction-ManageMember', [action, data]);
            setMembri(newList);
        }
        setShowModal(null);
        setModalData({});
    } catch (e: any) {
        setError(e.message || 'A apărut o eroare');
    }
  };

  // Iconițe SVG native
  const FactionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.5vw', height: '1.5vw' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.5vw', height: '1.5vw' }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2vw', height: '1.2vw' }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2vw', height: '1.2vw' }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  const AddIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2vw', height: '1.2vw' }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const closeTablet = () => {
    if ((window as any).mp) {
      (window as any).mp.trigger('Tablet-Close');
    }
  };

  return (
    <div className="tablet_v2_app_container" id="tablet_v2_root">
      <style>{`
        .tablet_v2_app_container {
          margin: 0;
          padding: 0;
          background: rgba(5, 10, 20, 0.7);
          color: #ffffff;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .tablet_v2_main_panel::-webkit-scrollbar {
          width: 0.4vw;
        }
        .tablet_v2_main_panel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 1vh;
        }
        .tablet_v2_main_panel::-webkit-scrollbar-thumb {
          background: #facc15;
          border-radius: 1vh;
        }
        .tablet_v2_main_panel::-webkit-scrollbar-thumb:hover {
          background: #eab308;
        }

        .tablet_v2_tablet_frame {
          width: 90vw;
          height: 70vh;
          background: #1a1a1a;
          border-radius: 4.5vh;
          padding: 1.5vh;
          box-shadow: 0 5vh 15vh rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          border: 0.2vh solid #333;
          position: relative;
        }

        .tablet_v2_tablet_screen {
          flex: 1;
          background: #0a192f;
          border-radius: 3vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 0.1vh solid #1d2d44;
          position: relative;
        }

        .tablet_v2_status_bar {
          height: 4vh;
          padding: 0 2vw;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.6vh;
          font-weight: bold;
          color: #ffffff;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(1vh);
          z-index: 10;
        }

        .tablet_v2_desktop {
          flex: 1;
          padding: 5vh;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        }

        .tablet_v2_app_icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1vh;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .tablet_v2_app_icon:hover {
          transform: scale(1.1);
        }

        .tablet_v2_icon_box {
          width: 5.5vw;
          height: 5.5vw;
          background: linear-gradient(135deg, #2563eb, #1e40af);
          border-radius: 1.5vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.2vh;
          color: white;
          box-shadow: 0 1vh 2vh rgba(0,0,0,0.5);
        }

        .tablet_v2_app_label {
          font-size: 1.5vh;
          font-weight: bold;
          color: white;
          text-transform: uppercase;
        }

        .tablet_v2_dock {
          height: 9vh;
          width: fit-content;
          margin: 0 auto 2vh auto;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(2vh);
          border-radius: 2.5vh;
          padding: 0 2vw;
          display: flex;
          align-items: center;
          gap: 2vw;
          border: 0.1vh solid rgba(255, 255, 255, 0.1);
        }

        .tablet_v2_dock_item {
          width: 5.5vh;
          height: 5.5vh;
          background: rgba(255,255,255,0.1);
          border-radius: 1.2vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.2vh;
          cursor: pointer;
          color: rgba(255,255,255,0.6);
          transition: all 0.2s;
        }

        .tablet_v2_dock_item:hover {
          transform: translateY(-0.5vh);
          color: white;
        }

        .tablet_v2_app_view {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #0a1426;
          z-index: 20;
          display: flex;
          flex-direction: column;
          animation: tablet_v2_slideIn 0.3s ease-out;
        }

        @keyframes tablet_v2_slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .tablet_v2_app_header {
          height: 8vh;
          padding: 0 2vw;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border-bottom: 0.1vh solid rgba(255,255,255,0.1);
        }

        .tablet_v2_header_title {
          display: flex;
          align-items: center;
          gap: 1vw;
          color: #facc15;
          font-weight: 800;
          font-size: 2.2vh;
        }

        .tablet_v2_btn_exit {
          background: #facc15;
          color: #000;
          border: none;
          padding: 0.8vh 1.5vw;
          border-radius: 0.8vh;
          font-weight: bold;
          cursor: pointer;
          font-size: 1.4vh;
        }

        .tablet_v2_app_layout {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .tablet_v2_sidebar {
          width: 22vw;
          background: rgba(0,0,0,0.4);
          border-right: 0.1vh solid rgba(255,255,255,0.05);
          padding: 2vh 1vw;
          display: flex;
          flex-direction: column;
          gap: 1vh;
        }

        .tablet_v2_nav_btn {
          padding: 1.8vh 1.5vw;
          border-radius: 1vh;
          border: none;
          background: transparent;
          color: #ffffff;
          font-weight: 600;
          font-size: 1.6vh;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1vw;
          transition: 0.2s;
          text-align: left;
        }

        .tablet_v2_nav_btn.active {
          background: rgba(250, 204, 21, 0.15);
          color: #facc15;
          border: 0.1vh solid rgba(250, 204, 21, 0.3);
        }

        .tablet_v2_main_panel {
          flex: 1;
          padding: 4vh;
          overflow-y: auto;
        }

        .tablet_v2_content_card {
          background: rgba(255,255,255,0.04);
          border-radius: 2vh;
          padding: 3vh;
          border: 0.1vh solid rgba(255,255,255,0.1);
        }

        .tablet_v2_section_header_flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3vh;
        }

        .tablet_v2_section_title {
          color: #facc15;
          margin: 0;
          font-size: 2.5vh;
          text-transform: uppercase;
        }

        .tablet_v2_btn_add {
          background: #facc15;
          color: #000;
          border: none;
          padding: 1vh 1.5vw;
          border-radius: 0.8vh;
          font-weight: 800;
          cursor: pointer;
          font-size: 1.3vh;
          display: flex;
          align-items: center;
          gap: 0.5vw;
          transition: opacity 0.2s;
        }

        .tablet_v2_btn_add:hover {
          opacity: 0.9;
        }

        .tablet_v2_table_custom {
          width: 100%;
          border-collapse: collapse;
        }

        .tablet_v2_table_custom th {
          text-align: left;
          padding: 1.5vh;
          color: #facc15;
          font-size: 1.4vh;
          text-transform: uppercase;
          border-bottom: 0.2vh solid rgba(250, 204, 21, 0.3);
        }

        .tablet_v2_table_custom td {
          padding: 1.8vh;
          color: #ffffff;
          font-size: 1.6vh;
          border-bottom: 0.1vh solid rgba(255,255,255,0.05);
        }

        .tablet_v2_action_cell {
          display: flex;
          gap: 1vw;
          align-items: center;
        }

        .tablet_v2_action_btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5vh;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5vh;
          transition: background 0.2s;
        }

        .tablet_v2_action_btn.edit { color: #facc15; }
        .tablet_v2_action_btn.delete { color: #f87171; }

        .tablet_v2_action_btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .tablet_v2_status_badge {
          padding: 0.5vh 1vw;
          border-radius: 0.8vh;
          font-size: 1.2vh;
          font-weight: 800;
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }

        .tablet_v2_status_badge.off {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .tablet_v2_modal_overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 100;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(0.5vh);
        }

        .tablet_v2_modal_content {
            background: #111e35;
            width: 35vw;
            padding: 4vh;
            border-radius: 2vh;
            border: 0.1vh solid #facc15;
            box-shadow: 0 0 5vh rgba(250, 204, 21, 0.2);
        }

        .tablet_v2_modal_title {
            color: #facc15;
            font-size: 2.2vh;
            margin-bottom: 3vh;
            text-transform: uppercase;
            font-weight: 800;
        }

        .tablet_v2_form_group {
            margin-bottom: 2.5vh;
        }

        .tablet_v2_label {
            display: block;
            font-size: 1.4vh;
            margin-bottom: 1vh;
            color: rgba(255,255,255,0.7);
        }

        .tablet_v2_input {
            width: 100% !important;
            background: rgba(255,255,255,0.05) !important;
            border: 0.1vh solid rgba(255,255,255,0.1) !important;
            padding: 1.2vh !important;
            border-radius: 0.8vh !important;
            color: white !important;
            font-size: 1.6vh !important;
            outline: none !important;
        }

        .tablet_v2_input:focus {
            border-color: #facc15 !important;
        }

        .tablet_v2_radio_group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1vh;
            max-height: 20vh;
            overflow-y: auto;
            padding-right: 0.5vw;
        }

        .tablet_v2_radio_item {
            display: flex;
            align-items: center;
            gap: 0.5vw;
            background: rgba(255,255,255,0.03);
            padding: 1vh;
            border-radius: 0.5vh;
            cursor: pointer;
            font-size: 1.4vh;
            border: 0.1vh solid transparent;
        }

        .tablet_v2_radio_item.active {
            border-color: #facc15;
            background: rgba(250, 204, 21, 0.05);
        }

        .tablet_v2_checkbox_group {
            display: flex;
            align-items: center;
            gap: 1vw;
            cursor: pointer;
            font-size: 1.4vh;
        }

        .tablet_v2_modal_actions {
            display: flex;
            justify-content: flex-end;
            gap: 1vw;
            margin-top: 4vh;
        }

        .tablet_v2_btn_cancel {
            background: transparent;
            color: white;
            border: none;
            padding: 1.2vh 2vw;
            cursor: pointer;
            font-size: 1.4vh;
            font-weight: bold;
        }

        .tablet_v2_btn_save {
            background: #facc15;
            color: #000;
            border: none;
            padding: 1.2vh 2vw;
            border-radius: 0.8vh;
            cursor: pointer;
            font-size: 1.4vh;
            font-weight: 800;
        }

        .tablet_v2_error_msg {
            color: #f87171;
            font-size: 1.3vh;
            margin-top: 1vh;
            font-weight: 800;
        }
      `}</style>

      <div className="tablet_v2_tablet_frame" id="tablet_v2_frame">
        <div className="tablet_v2_tablet_screen" id="tablet_v2_screen">
          <div className="tablet_v2_status_bar">
            <span>{currentTime}</span>
            <div style={{ display: 'flex', gap: '1vw' }}>
              <span>LTE</span>
              <span>100%</span>
            </div>
          </div>

          {activeApp === 'home' ? (
            <div className="tablet_v2_desktop">
              <div className="tablet_v2_app_icon" id="tablet_v2_app_faction" onClick={() => setActiveApp('FACTIUNE')}>
                <div className="tablet_v2_icon_box">
                  <FactionIcon />
                </div>
                <span className="tablet_v2_app_label">FACȚIUNE</span>
              </div>
            </div>
          ) : (
            <div className="tablet_v2_app_view" id="tablet_v2_faction_app">
              <div className="tablet_v2_app_header">
                <div className="tablet_v2_header_title">
                  <div style={{ width: '2.5vh' }}><FactionIcon /></div>
                  <span>MANAGEMENT FACȚIUNE</span>
                </div>
                <button className="tablet_v2_btn_exit" onClick={() => setActiveApp('home')}>IEȘIRE</button>
              </div>

              <div className="tablet_v2_app_layout">
                <div className="tablet_v2_sidebar">
                  <div style={{ padding: '1vh 1.5vw', marginBottom: '2vh', borderBottom: '0.1vh solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.2vh', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Organizație curentă</div>
                    <div style={{ fontSize: '1.8vh', fontWeight: 'bold', color: '#facc15' }}>{factionName}</div>
                  </div>
                  <button 
                    className={`tablet_v2_nav_btn ${factionTab === 'grade' ? 'active' : ''}`}
                    onClick={() => setFactionTab('grade')}
                    id="tablet_v2_nav_grade"
                  >
                    <ShieldIcon /> Administrare Grade
                  </button>
                  <button 
                    className={`tablet_v2_nav_btn ${factionTab === 'membri' ? 'active' : ''}`}
                    onClick={() => setFactionTab('membri')}
                    id="tablet_v2_nav_members"
                  >
                    <UsersIcon /> Administrare Membri
                  </button>
                </div>

                <div className="tablet_v2_main_panel">
                  <div className="tablet_v2_content_card">
                    <div className="tablet_v2_section_header_flex">
                      <h2 className="tablet_v2_section_title">
                        {factionTab === 'grade' ? 'Configurare Ierarhie' : 'MEMBRI FACTIUNE'}
                      </h2>
                      <button 
                        className="tablet_v2_btn_add"
                        onClick={() => {
                            setShowModal(factionTab === 'grade' ? 'add_grade' : 'add_member');
                            setModalData({});
                            setError(null);
                        }}
                        id="tablet_v2_btn_add"
                      >
                        <AddIcon /> ADĂUGARE {factionTab === 'grade' ? 'GRAD' : 'MEMBRU'}
                      </button>
                    </div>
                    
                    <table className="tablet_v2_table_custom">
                      {factionTab === 'grade' ? (
                        <>
                          <thead>
                            <tr>
                              <th>Nume Grad</th>
                              <th>Acces Seif</th>
                              <th style={{ textAlign: 'right' }}>Acțiuni</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grade.map((g, i) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 'bold', color: g.name === 'Lider' ? '#facc15' : '#fff' }}>{g.name}</td>
                                <td style={{ opacity: 0.6 }}>{g.vaultAccess ? 'DA' : 'NU'}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <div className="tablet_v2_action_cell" style={{ justifyContent: 'flex-end' }}>
                                    <button 
                                        className="tablet_v2_action_btn edit" 
                                        title="Editează"
                                        onClick={() => {
                                            setShowModal('edit_grade');
                                            setModalData({ id: g.id, name: g.name, vaultAccess: g.vaultAccess });
                                        }}
                                    >
                                        <EditIcon />
                                    </button>
                                    {g.name !== 'Lider' && (
                                      <button 
                                        className="tablet_v2_action_btn delete" 
                                        title="Șterge"
                                        onClick={() => handleAction('grade', 'delete', { id: g.id })}
                                      >
                                        <DeleteIcon />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      ) : (
                        <>
                          <thead>
                            <tr>
                              <th>Nume</th>
                              <th>Grad</th>
                              <th>Status</th>
                              <th style={{ textAlign: 'right' }}>Acțiuni</th>
                            </tr>
                          </thead>
                          <tbody>
                            {membri.map((m) => (
                              <tr key={m.userId}>
                                <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                                <td style={{ color: '#facc15' }}>{m.rank}</td>
                                <td>
                                  <span className={`tablet_v2_status_badge ${!m.online ? 'off' : ''}`}>
                                    {m.online ? 'Online' : 'Offline'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div className="tablet_v2_action_cell" style={{ justifyContent: 'flex-end' }}>
                                    {m.rank !== 'Lider' && (
                                      <>
                                        <button 
                                            className="tablet_v2_action_btn edit" 
                                            title="Editează"
                                            onClick={() => {
                                                setShowModal('edit_member');
                                                const rankId = grade.find(g => g.name === m.rank)?.id || '';
                                                setModalData({ id: m.userId, name: m.name, rankId });
                                            }}
                                        >
                                            <EditIcon />
                                        </button>
                                        <button 
                                            className="tablet_v2_action_btn delete" 
                                            title="Șterge"
                                            onClick={() => handleAction('member', 'delete', { id: m.userId })}
                                        >
                                            <DeleteIcon />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="tablet_v2_dock">
            <div className="tablet_v2_dock_item" onClick={closeTablet} style={{ color: '#f87171' }}>
              <CloseIcon />
            </div>
            <div className="tablet_v2_dock_item" onClick={() => setActiveApp('FACTIUNE')} style={{ color: '#facc15' }}>
              <FactionIcon />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
          <div className="tablet_v2_modal_overlay">
              <div className="tablet_v2_modal_content">
                  <h3 className="tablet_v2_modal_title">
                      {showModal === 'add_grade' && 'Adăugare Grad Nou'}
                      {showModal === 'edit_grade' && `Editare Grad: ${modalData.name}`}
                      {showModal === 'add_member' && 'Adăugare Membru Nou'}
                      {showModal === 'edit_member' && `Editare Membru: ${modalData.name}`}
                  </h3>

                  {(showModal === 'add_grade' || showModal === 'edit_grade') && (
                      <>
                        <div className="tablet_v2_form_group">
                            <label className="tablet_v2_label">Nume Grad</label>
                            <input 
                                type="text" 
                                className="tablet_v2_input" 
                                value={modalData.name || ''} 
                                onChange={(e) => setModalData({...modalData, name: e.target.value})}
                                placeholder="Ex: Capitan"
                            />
                        </div>
                        <div className="tablet_v2_form_group">
                            <label className="tablet_v2_checkbox_group">
                                <input 
                                    type="checkbox" 
                                    checked={!!modalData.vaultAccess} 
                                    onChange={(e) => setModalData({...modalData, vaultAccess: e.target.checked})}
                                />
                                Acces la Seif (Inventory)
                            </label>
                        </div>
                      </>
                  )}

                  {(showModal === 'add_member' || showModal === 'edit_member') && (
                      <>
                        {showModal === 'add_member' && (
                            <div className="tablet_v2_form_group">
                                <label className="tablet_v2_label">ID Jucător (Server ID)</label>
                                <input 
                                    type="number" 
                                    className="tablet_v2_input" 
                                    value={modalData.targetId || ''} 
                                    onChange={(e) => setModalData({...modalData, targetId: e.target.value})}
                                    placeholder="Ex: 5"
                                />
                            </div>
                        )} 
                        <div className="tablet_v2_form_group">
                            <label className="tablet_v2_label">Selectare Grad</label>
                            <div className="tablet_v2_radio_group">
                                {grade.map(g => (
                                    <div 
                                        key={g.id} 
                                        className={`tablet_v2_radio_item ${modalData.rankId === g.id ? 'active' : ''}`}
                                        onClick={() => setModalData({...modalData, rankId: g.id})}
                                    >
                                        <input 
                                            type="radio" 
                                            name="rank" 
                                            checked={modalData.rankId === g.id}
                                            readOnly 
                                        />
                                        {g.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                      </>
                  )}

                  {error && <div className="tablet_v2_error_msg">{error}</div>}

                  <div className="tablet_v2_modal_actions">
                      <button className="tablet_v2_btn_cancel" onClick={() => setShowModal(null)}>ANULARE</button>
                      <button 
                        className="tablet_v2_btn_save"
                        onClick={() => {
                            if (showModal === 'add_grade') handleAction('grade', 'add', modalData);
                            if (showModal === 'edit_grade') handleAction('grade', 'edit', modalData);
                            if (showModal === 'add_member') handleAction('member', 'add', modalData);
                            if (showModal === 'edit_member') handleAction('member', 'edit', modalData);
                        }}
                      >
                          SALVEAZĂ
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
