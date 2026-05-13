import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';
import { MdClose } from 'react-icons/md';

const App = () => {
    const [visibility, setVisibility] = useState({
        showLogo: true,
        showIdUsers: true,
        showMoneyCash: true,
        showMissions: true,
        showSpeedometer: true,
        showHealthArmor: true,
        showFoodWater: true,
        showStamina: true,
        showMic: true,
        showLocation: true,
        showMinimap: true,
        showChat: true,
        showBinds: true
    });

    const labels: { [key: string]: string } = {
        showLogo: "ARATA LOGO",
        showIdUsers: "ARATA ID si USERI",
        showMoneyCash: "ARATA BANI CASH",
        showMissions: "ARATA MISIUNI",
        showSpeedometer: "ARATA VITEZOMETRU",
        showHealthArmor: "ARATA VIATA + ARMURA",
        showFoodWater: "ARATA MANCARE + APA",
        showStamina: "ARATA STAMINA",
        showMic: "ARATA MICROFON",
        showLocation: "ARATA LOCATIA",
        showMinimap: "ARATA MINIMAP",
        showChat: "ARATA CHATUL",
        showBinds: "ARATA COMENZI/BINDS"
    };

    const [styles, setStyles] = useState({
        statusBarsVariant: 1, 
        speedometerVariant: 1  
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Here we could try to load existing settings via a global hook if sent from server, or via RPC.
        // For simplicity we will expose a global function that the client can call when opening the UI.
        const handleLoadSettings = (settingsAsJson: string) => {
            try {
                const settings = JSON.parse(settingsAsJson);
                if (settings.visibility) {
                    setVisibility(prev => ({ ...prev, ...settings.visibility }));
                    (window as any).lastHudSettingsVisibility = JSON.stringify(settings.visibility);
                }
                if (settings.styles) setStyles(prev => ({ ...prev, ...settings.styles }));
            } catch(e) {}
        };
        // @ts-ignore
        window.loadHudSettings = handleLoadSettings;
        return () => { 
            // @ts-ignore
            delete window.loadHudSettings; 
        };
    }, []);

    const toggleVisibility = (key: string) => {
        const newVisibility = { ...visibility, [key]: !visibility[key as keyof typeof visibility] };
        setVisibility(newVisibility as any);
        
        // Save for chat
        try {
            (window as any).lastHudSettingsVisibility = JSON.stringify(newVisibility);
            window.dispatchEvent(new CustomEvent('hudSettingsChanged'));
        } catch(e) {}
        
        // Notify client
        try {
            if ((window as any).mp) {
                (window as any).mp.trigger('client:updateHudVisibility', JSON.stringify(newVisibility));
            }
        } catch(e) {}
    };

    const updateStyle = (key: string, variant: number) => {
        const newStyles = { ...styles, [key]: variant };
        setStyles(newStyles);
        
        // Notify client
        try {
            if ((window as any).mp) {
                (window as any).mp.trigger('client:updateHudStyle', JSON.stringify(newStyles));
            }
        } catch(e) {}
    };

    const handleSave = () => {
        setIsSaving(true);
        try {
            if ((window as any).mp) {
                (window as any).mp.trigger('client:saveHudSettings', JSON.stringify({ visibility, styles }));
            }
        } catch(e) {}
        setTimeout(() => { setIsSaving(false); }, 1000);
    };

    const closeMenu = () => {
        try {
            if ((window as any).mp) {
                (window as any).mp.trigger('client:closeHudSettings');
            }
            rpc.callClient('Browser-HidePage');
        } catch(e) {}
    };

    const colors = {
        bgMain: 'rgba(7, 7, 7, 0.98)', 
        panelBg: '#0f0f0f', 
        borderGray: '#1e1e1e', 
        accentYellow: '#f2ba00', 
        subText: '#555555'
    };

    const css: { [key: string]: React.CSSProperties | any } = {
        mainWrapper: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: colors.bgMain,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            fontFamily: '"Rajdhani", sans-serif',
            color: 'white',
            userSelect: 'none'
        },
        topMenu: {
            width: '100vw',
            height: '10vh',
            backgroundColor: 'transparent',
            borderBottom: `1px solid ${colors.borderGray}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 4vw',
            boxSizing: 'border-box',
            justifyContent: 'space-between'
        },
        contentArea: {
            flex: 1,
            overflowY: 'auto',
            padding: '5vh 4vw'
        },
        sectionTitle: {
            fontSize: '1.2vw',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: colors.accentYellow,
            marginBottom: '3vh',
            letterSpacing: '0.1vw'
        },
        elementsGridContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            backgroundColor: colors.borderGray,
            border: `1px solid ${colors.borderGray}`,
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '8vh'
        },
        gridRowFirst: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px'
        },
        gridRowSecond: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            borderTop: `1px solid ${colors.borderGray}`
        },
        elementRow: {
            padding: '2.2vh 1.8vw',
            backgroundColor: colors.panelBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        toggleBase: (active: boolean): React.CSSProperties => ({
            width: '36px',
            height: '18px',
            backgroundColor: active ? colors.accentYellow : '#222',
            borderRadius: '20px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }),
        toggleCircle: (active: boolean): React.CSSProperties => ({
            width: '12px',
            height: '12px',
            backgroundColor: active ? '#000' : '#444',
            borderRadius: '50%',
            position: 'absolute',
            top: '3px',
            left: active ? '21px' : '3px',
            transition: 'all 0.2s ease'
        }),
        radioRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1vw',
            marginBottom: '2vh'
        },
        radioItem: (selected: boolean): React.CSSProperties => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8vw',
            padding: '2vh',
            backgroundColor: colors.panelBg,
            border: `1px solid ${colors.borderGray}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }),
        radioCircle: (selected: boolean): React.CSSProperties => ({
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: `2px solid ${selected ? colors.accentYellow : '#333'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }),
        previewBox: {
            backgroundColor: 'rgba(0,0,0,0.4)',
            border: `1px dashed ${colors.borderGray}`,
            borderRadius: '6px',
            padding: '4vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '6vh'
        }
    };

    const renderStatusPreview = (variant: number) => {
        if (variant === 1) return <div style={{ width: '20vw', height: '10px', background: colors.accentYellow, borderRadius: '5px' }} />;
        if (variant === 2) return (
            <div style={{ display: 'flex', gap: '1vw' }}>
                {[1,2,3,4].map(i => <div key={i} style={{ width: '3vh', height: '3vh', border: `2px solid ${colors.accentYellow}`, borderRadius: '50%' }} />)}
            </div>
        );
        return (
            <div style={{ display: 'flex', gap: '0.5vw' }}>
                {[1,2,3,4,5,6].map(i => <div key={i} style={{ width: '1vw', height: '2vh', background: colors.accentYellow, opacity: 1 - (i*0.1) }} />)}
            </div>
        );
    };

    const visibilityKeys = [
        "showLogo",
        "showIdUsers",
        "showMoneyCash",
        "showMissions",
        "showSpeedometer",
        "showHealthArmor",
        "showFoodWater",
        "showStamina",
        "showMic",
        "showLocation",
        "showMinimap",
        "showChat",
        "showBinds"
    ];
    const firstRowKeys = visibilityKeys.slice(0, 4);
    const secondRowKeys = visibilityKeys.slice(4, 8);
    const thirdRowKeys = visibilityKeys.slice(8, 12);
    const fourthRowKeys = visibilityKeys.slice(12, 16);

    return (
        <>
            <div style={css.mainWrapper}>
                <div style={css.topMenu}>
                    <h1 style={{ fontSize: '1.8vw', fontWeight: '900', color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '0.2vw' }}>
                        EMPIRE HUD SETTINGS
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2vw' }}>
                        <button 
                            style={{
                                backgroundColor: colors.accentYellow,
                                border: 'none',
                                color: '#000',
                                padding: '1.4vh 4vw',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '900',
                                fontSize: '1.1vw',
                                textTransform: 'uppercase',
                                transition: 'transform 0.1s active'
                            }}
                            onClick={handleSave}
                        >
                            {isSaving ? "SALVAT" : "SALVEAZA"}
                        </button>
                        
                        <button 
                            style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }} 
                            onClick={closeMenu}
                        >
                            <MdClose size="3.5vh" />
                        </button>
                    </div>
                </div>

                <div style={css.contentArea} className="custom-scroll">
                    
                    {/* ELEMENTE VIZUALE */}
                    <div style={css.sectionTitle}>Elemente Vizuale</div>
                    <div style={css.elementsGridContainer}>
                        {/* Primul rand: 4 elemente */}
                        <div style={css.gridRowFirst}>
                            {firstRowKeys.map((key) => (
                                <div key={key} style={css.elementRow}>
                                    <span style={{ fontSize: '0.9vw', fontWeight: '600', color: (visibility as any)[key] ? '#fff' : '#444', textTransform: 'uppercase' }}>
                                        {labels[key]}
                                    </span>
                                    <div style={css.toggleBase((visibility as any)[key])} onClick={() => toggleVisibility(key)}>
                                        <div style={css.toggleCircle((visibility as any)[key])} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Al doilea rand: 4 elemente */}
                        <div style={css.gridRowFirst}>
                            {secondRowKeys.map((key) => (
                                <div key={key} style={css.elementRow}>
                                    <span style={{ fontSize: '0.9vw', fontWeight: '600', color: (visibility as any)[key] ? '#fff' : '#444', textTransform: 'uppercase' }}>
                                        {labels[key]}
                                    </span>
                                    <div style={css.toggleBase((visibility as any)[key])} onClick={() => toggleVisibility(key)}>
                                        <div style={css.toggleCircle((visibility as any)[key])} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Al treilea rand: 4 elemente */}
                        <div style={css.gridRowFirst}>
                            {thirdRowKeys.map((key) => (
                                <div key={key} style={css.elementRow}>
                                    <span style={{ fontSize: '0.9vw', fontWeight: '600', color: (visibility as any)[key] ? '#fff' : '#444', textTransform: 'uppercase' }}>
                                        {labels[key]}
                                    </span>
                                    <div style={css.toggleBase((visibility as any)[key])} onClick={() => toggleVisibility(key)}>
                                        <div style={css.toggleCircle((visibility as any)[key])} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Al patrulea rand */}
                        <div style={css.gridRowFirst}>
                            {fourthRowKeys.map((key) => (
                                <div key={key} style={css.elementRow}>
                                    <span style={{ fontSize: '0.9vw', fontWeight: '600', color: (visibility as any)[key] ? '#fff' : '#444', textTransform: 'uppercase' }}>
                                        {labels[key]}
                                    </span>
                                    <div style={css.toggleBase((visibility as any)[key])} onClick={() => toggleVisibility(key)}>
                                        <div style={css.toggleCircle((visibility as any)[key])} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STIL INTERFATA */}
                    <div style={css.sectionTitle}>Stil Interfata</div>

                    {/* STATUS BARS */}
                    <div style={{ marginBottom: '2vh', fontSize: '0.8vw', color: colors.subText, textTransform: 'uppercase', fontWeight: 'bold' }}>Design Bare Status</div>
                    <div style={css.radioRow}>
                        {[1, 2, 3].map(v => (
                            <div key={v} style={css.radioItem(styles.statusBarsVariant === v)} onClick={() => updateStyle('statusBarsVariant', v)}>
                                <div style={css.radioCircle(styles.statusBarsVariant === v)}>
                                    {styles.statusBarsVariant === v && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.accentYellow }} />}
                                </div>
                                <span style={{ fontSize: '0.9vw', fontWeight: '700', color: styles.statusBarsVariant === v ? '#fff' : '#444' }}>STIL {v}</span>
                            </div>
                        ))}
                    </div>
                    <div style={css.previewBox}>
                        {renderStatusPreview(styles.statusBarsVariant)}
                    </div>

                    {/* SPEEDOMETER */}
                    <div style={{ marginBottom: '2vh', fontSize: '0.8vw', color: colors.subText, textTransform: 'uppercase', fontWeight: 'bold' }}>Stil Vitezometru</div>
                    <div style={css.radioRow}>
                        {[1, 2, 3].map(v => (
                            <div key={v} style={css.radioItem(styles.speedometerVariant === v)} onClick={() => updateStyle('speedometerVariant', v)}>
                                <div style={css.radioCircle(styles.speedometerVariant === v)}>
                                    {styles.speedometerVariant === v && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.accentYellow }} />}
                                </div>
                                <span style={{ fontSize: '0.9vw', fontWeight: '700', color: styles.speedometerVariant === v ? '#fff' : '#444' }}>DESIGN {v}</span>
                            </div>
                        ))}
                    </div>
                    <div style={css.previewBox}>
                        <div style={{ color: colors.accentYellow, fontWeight: 'bold', fontSize: '1.2vw', textTransform: 'uppercase' }}>
                            Preview Vitezometru Stil {styles.speedometerVariant}
                        </div>
                    </div>

                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;900&display=swap');
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: #070707; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #222; }
            `}</style>
        </>
    );
};

export default App;
