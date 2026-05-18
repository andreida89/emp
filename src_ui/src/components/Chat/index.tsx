import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import rpc from 'utils/rpc';
import { StoreState } from 'store';
import { sendMessage } from 'store/app/actions';
import { commandsList, COMMANDS } from './data';

const THEME = {
  yellow: '#FFD700',
  yellowSoft: 'rgba(255, 215, 0, 0.3)',
  bleu: '#00d2ff',
  dark: '#050505',
  surface: 'rgba(10, 10, 10, 0.85)',
  radius: '5px'
};

const Icons = {
  Send: () => (
    <svg width="1.1vw" height="1.1vw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 3 9-3 9 19-9Z"/>
      <path d="M6 12h16"/>
    </svg>
  ),
  Settings: () => (
    <svg width="1.1vw" height="1.1vw" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  Move: () => (
    <svg width="1vw" height="1vw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 9-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>
  ),
  Resize: () => (
    <svg width="0.8vw" height="0.8vw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v6h-6M9 21H3v-6M15 3h6v6M3 9V3h6"/></svg>
  )
};

function prepareMessageText(text: string) {
	let msg = text.replace(/[<>]+/g, '');
    
    let parts = msg.split(/!{([a-fA-F0-9]{6}|[a-fA-F0-9]{3})}/);
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) {
        let color = parts[i];
        let content = parts[i+1];
        out += `<span style="color: #${color};">${content}</span>`;
    }
    msg = out;

	msg = msg.replace(/\[badge[\s\n:]*([a-zA-Z0-9_\-]+)\s*\]([\s\S]*?)\[\/badge\]/gi, (match, cls, content) => {
         return `<span class="zen-chat-badge ${cls.trim().toLowerCase()}">${content}</span>`;
    });
	return msg;
}

function parseMessageString(data: string) {
    let type = 'DEFAULT';

    let upperClean = data.toUpperCase();
    if (upperClean.includes('SYSTEM:') || upperClean.includes('!{FFD700}SYSTEM') || upperClean.includes('INFO:') || upperClean.includes('VIP ACCESS:')) {
        type = 'SYSTEM';
    } else if (upperClean.includes('VÂNZARE') || upperClean.includes('ANUNT') || upperClean.includes('ANUNȚ')) {
        type = 'AD';
    } 

    let header = '';
    let text = data;
    let subtext = '';

    const pipeIndex = data.indexOf('|');
    if (pipeIndex !== -1) {
        subtext = data.substring(pipeIndex + 1);
        text = data.substring(0, pipeIndex);
        data = text;
    }

    let colonIndex = -1;
    let bracketDepth = 0;
    let braceDepth = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i] === '[') bracketDepth++;
        else if (data[i] === ']') bracketDepth = Math.max(0, bracketDepth - 1);
        else if (data[i] === '{') braceDepth++;
        else if (data[i] === '}') braceDepth = Math.max(0, braceDepth - 1);
        else if (data[i] === ':' && bracketDepth === 0 && braceDepth === 0) {
            colonIndex = i;
            break;
        }
    }

    let headerInfo: any = null;

    if (colonIndex !== -1 && !data.startsWith('((')) {
        header = data.substring(0, colonIndex);
        text = data.substring(colonIndex + 1);
        
        let rankColor = '';
        
        // Extract first badge color for the border
        const badgeMatch = header.match(/\[badge[\s\n:]*([a-zA-Z0-9_\-]+)\s*\]/i);
        if (badgeMatch && badgeMatch[1]) {
            const cls = badgeMatch[1].toLowerCase();
            if (cls === 'lightgreen') rankColor = '#90ee90';
            else if (cls === 'green') rankColor = '#4ade80';
            else if (cls === 'cyan') rankColor = '#06b6d4';
            else if (cls === 'blue') rankColor = '#3b82f6';
            else if (cls === 'purple') rankColor = '#a855f7';
            else if (cls === 'yellow') rankColor = '#facc15';
            else if (cls === 'red') rankColor = '#ef4444';
            else if (cls === 'orange') rankColor = '#f97316';
            else if (cls === 'black') rankColor = '#fff'; // Border white for black badges
        }
        
        if (rankColor) {
            headerInfo = { rankColor };
            if (type === 'DEFAULT') type = 'RANK';
        }
    }

    return {
        type,
        headerInfo,
        header: header.trim(),
        text: text.trim(),
        subtext: subtext.trim()
    };
}

const Message = ({ data, fontSize }: { data: string, fontSize: number }) => {
  const parsed = parseMessageString(data);
  const baseSize = fontSize * 0.82;
  const badgeSize = fontSize * 0.82;
  const badgeHeight = fontSize * 1.25;

  let borderColor = 'rgba(255,255,255,0.3)';
  let headerColor = '#fff';
  
  if (parsed.type === 'SYSTEM' || parsed.type === 'ERROR') {
      borderColor = THEME.yellow;
      headerColor = THEME.yellow;
  } else if (parsed.type === 'AD') {
      borderColor = '#ef4444';
      headerColor = '#ef4444';
  } else if (parsed.headerInfo && parsed.headerInfo.rankColor) {
      borderColor = parsed.headerInfo.rankColor;
      headerColor = parsed.headerInfo.rankColor;
  }

  return (
    <div className="zen-chat-message-wrapper">
        {parsed.header ? (
            <>
              <div className="zen-chat-message-header" style={{ borderLeftColor: borderColor }}>
                {parsed.type === 'AD' && (
                  <span className="zen-chat-ad-badge" style={{ fontSize: `${badgeSize}vw`, height: `${badgeHeight}vw` }}>
                    ANUNȚ
                  </span>
                )}
                <span className="zen-chat-header-title" style={{ fontSize: `${baseSize}vw`, color: headerColor }} dangerouslySetInnerHTML={{ __html: prepareMessageText(parsed.header) }} />
              </div>
              <div className="zen-chat-message-content" style={{ fontSize: `${fontSize}vw`, paddingLeft: '0.8vw' }}>
                <span dangerouslySetInnerHTML={{ __html: prepareMessageText(parsed.text) }} />
                {parsed.subtext && <div className="zen-chat-message-subtext" style={{ fontSize: `${fontSize * 0.9}vw` }} dangerouslySetInnerHTML={{ __html: prepareMessageText(parsed.subtext) }} />}
              </div>
            </>
        ) : (
           <div className="zen-chat-message-content" style={{ fontSize: `${fontSize}vw` }}>
             <span dangerouslySetInnerHTML={{ __html: prepareMessageText(data) }} />
           </div>
        )}
    </div>
  );
};

const Chat = (props: any) => {
  const [config, setConfig] = useState(() => {
    let initial = {
      fontSize: 0.75,
      width: 29,
      height: 35,
      top: 0.2,
      left: 0.2,
      autoHideTime: 10,
      moveMode: false,
      resizeMode: false
    };
    try {
      if ((window as any).chatConfigEx) {
         initial = { ...initial, ...JSON.parse((window as any).chatConfigEx) };
      }
    } catch(e) {}
    initial.moveMode = false;
    initial.resizeMode = false;
    return initial;
  });

  const [isVisible, setIsVisible] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(() => {
     try {
         if ((window as any).lastHudSettingsVisibility) {
             const vis = JSON.parse((window as any).lastHudSettingsVisibility);
             return vis.showChat !== false;
         }
     } catch(e) {}
     return true;
  });
  const [isInputActive, setIsInputActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [input, setInput] = useState('');
  
  const [userData, setUserData] = useState<any>({ faction: null, isAdmin: false, hasVip: false });
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasShownVipWarning, setHasShownVipWarning] = useState(false);

  const timerRef = useRef<any>(null);
  const scrollRef = useRef<any>(null);
  const chatRef = useRef<any>(null);
  const inputRef = useRef<any>(null);

  const getFilters = () => {
     let f = ['ALL'];
     f.push('VIP'); // show VIP filter even if not VIP

     if (userData.faction && userData.faction !== 'NICIUNA') f.push(userData.faction);
     if (userData.isAdmin) f.push('ADMIN');
     return f;
  };

  const categoriesFiltered = props.messages.filter((m: string) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'ADMIN' && (m.includes('[Admin]') || m.includes('!{b80614}') || m.includes('HELPER') || m.includes('MODERATOR') || m.includes('FONDATOR') || m.includes('MANAGER'))) return true;
      if (activeFilter === 'VIP' && m.includes('[VIP]')) return true; // generic check
      if (userData.faction && activeFilter === userData.faction && m.includes('!{0880cf}')) return true;
      return false;
  });

  const saveConfig = (newConfig: any) => {
      setConfig(newConfig);
      try {
        (window as any).chatConfigEx = JSON.stringify(newConfig);
        if ((window as any).mp) {
           (window as any).mp.trigger('client:saveChatConfigEx', JSON.stringify(newConfig));
        }
      } catch(e){}
  };

  const resetInactivityTimer = useCallback((forceHide = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isSettingsOpen && !config.moveMode && !config.resizeMode && !isInputActive && !forceHide) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, config.autoHideTime * 1000);
    }
  }, [isSettingsOpen, config.moveMode, config.resizeMode, config.autoHideTime, isInputActive]);

  const toggleMenu = useCallback((status?: boolean) => {
		const enabled = status !== undefined ? status : !isInputActive;
		setIsInputActive(enabled);
		
		try {
		    if ((window as any).mp) {
			  (window as any).mp.invoke('focus', enabled);
			  (window as any).mp.invoke('setTypingInChatState', enabled);
            }
		} catch(e) {}

		if (enabled) {
            setIsVisible(true);
            setIsSettingsOpen(false);
            setHistoryIndex(-1);
            setTimeout(() => inputRef?.current?.focus(), 50);
        } else {
            setInput('');
            setHistoryIndex(-1);
            setIsSettingsOpen(false);
            resetInactivityTimer(false);
        }
  }, [isInputActive, resetInactivityTimer]);

  const addMessage = useCallback(async (text: string) => {
      if (!text || text.trim() === '') return;
      setIsVisible(true);
      resetInactivityTimer();
  	  const prepared: string = await rpc.callClient('PlayerFriends-PrepareString', text);
  	  props.sendMessage(prepared);
  }, [resetInactivityTimer, props]);

  useEffect(() => {
     const onHudSettingsChanged = () => {
         try {
             if ((window as any).lastHudSettingsVisibility) {
                 const vis = JSON.parse((window as any).lastHudSettingsVisibility);
                 setChatEnabled(vis.showChat !== false);
                 if (vis.showChat === false) {
                    setIsInputActive(false);
                    setIsVisible(false);
                 }
             }
         } catch(e) {}
     };
     window.addEventListener('hudSettingsChanged', onHudSettingsChanged);

     rpc.callServer('Chat-GetUserData').then((data: any) => {
         if (data) setUserData(data);
     }).catch(() => {});

     const api = {
			'chat:push': addMessage,
			'chat:activate': toggleMenu,
			'chat:show': (status: boolean) => setIsVisible(status)
     };

     if ((window as any).mp?.events) {
         Object.entries(api).forEach(([event, callback]) => {
             (window as any).mp.events.add(event, callback);
         });
     }
     (window as any).chatAPI = {
         push: api['chat:push'],
         activate: api['chat:activate'],
         show: api['chat:show']
     };

     return () => {
         window.removeEventListener('hudSettingsChanged', onHudSettingsChanged);
         try {
           (window as any).mp?.invoke('setTypingInChatState', false);
         } catch(e) {}
     };
  }, [addMessage, toggleMenu]);

  useEffect(() => {
     if (props.messages.length > 0) {
        setIsVisible(true);
        resetInactivityTimer();
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
  }, [props.messages, resetInactivityTimer]);

  useEffect(() => {
     // Ensure we scroll to bottom when opening the chat
     // so the older messages don't force us to the top
     if (isInputActive && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
  }, [isInputActive]);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const activeElement = document.activeElement;
      if (!isInputActive && e.keyCode === 84 && !(window as any).isPlayerDead && activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          try {
             if ((window as any).lastHudSettingsVisibility) {
                 const vis = JSON.parse((window as any).lastHudSettingsVisibility);
                 if (vis.showChat === false) return;
             }
          } catch(e) {}
          
          e.preventDefault();
          toggleMenu(true);
          return;
      }
      if (e.keyCode === 27 && isInputActive) { // Escape
          toggleMenu(false);
      }
      
      if (isInputActive && (e.keyCode === 38 || e.keyCode === 40)) {
         e.preventDefault();
         const direction = e.keyCode === 38 ? 1 : -1;
         let newIndex = historyIndex + direction;
         newIndex = Math.max(-1, Math.min(commandHistory.length - 1, newIndex));
         if (newIndex >= 0) {
             setInput(commandHistory[newIndex]);
         } else {
             setInput('');
         }
         setHistoryIndex(newIndex);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInputActive, historyIndex, commandHistory, toggleMenu]);

  const handleSendMessage = () => {
    const text = input.trim();
    if (text === '') {
        toggleMenu(false);
        return;
    }

    if (text[0] === '/') {
       setCommandHistory(prev => {
           const prevHistory = prev.filter(cmd => cmd !== text);
           return [text, ...prevHistory].slice(0, 10);
       });
    }

    try {
        const command = text.split(' ')[0]?.replace('/', '');
		const mode = (commandsList as any)[command] ? command : null;
		
        if (text[0] === '/' && !mode) {
			(window as any).mp.invoke('command', text.substr(1));
		} else if (text.length) {
			(window as any).mp.invoke(
				'chatMessage',
				JSON.stringify({
					mode: mode ? (commandsList as any)[mode] : COMMANDS.SAY,
					text: text.replace(`/${mode} `, '')
				})
			);
		}
    } catch(e) { }

    setInput('');
    toggleMenu(false);
  };

  const handleMouseDown = (e: any) => {
    if (!config.moveMode) return;
    const startX = e.clientX - chatRef.current.offsetLeft;
    const startY = e.clientY - chatRef.current.offsetTop;

    const onMouseMove = (moveEvent: any) => {
      const newLeft = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      const newTop = ((moveEvent.clientY - startY) / window.innerHeight) * 100;
      saveConfig({ ...config, left: newLeft, top: newTop });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const startResizing = (e: any) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = config.width;
    const startHeight = config.height;

    const onMouseMove = (moveEvent: any) => {
      const deltaX = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      const deltaY = ((moveEvent.clientY - startY) / window.innerHeight) * 100;
      saveConfig({
        ...config,
        width: Math.max(20, startWidth + deltaX),
        height: Math.max(20, startHeight + deltaY)
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleFilterClick = (f: string) => {
      if (f === 'VIP' && !userData.hasVip) {
          if (!hasShownVipWarning) {
              setHasShownVipWarning(true);
              addMessage('!{ff3333}VIP ACCESS: Nu detii acces la acest chat deoarece nu detii un pachet VIP.|Pentru a achizitiona unul, apasa tasta ESC si apoi selecteaza SHOP!');
          }
          return;
      }
      setActiveFilter(f);
      resetInactivityTimer();
  };

  return (
    <>
      {isInputActive && <div className="zen-chat-outside-click" onClick={() => toggleMenu(false)} />}
      <div 
        ref={chatRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => resetInactivityTimer()}
        onMouseLeave={() => resetInactivityTimer()}
        className="zen-chat-container"
        style={{
          top: `${config.top}vh`,
          left: `${config.left}vw`,
          width: `${config.width}vw`,
          height: `${config.height}vh`,
          border: (config.moveMode || config.resizeMode) ? `2px dashed ${THEME.yellow}` : 'none',
          cursor: config.moveMode ? 'move' : 'default',
          opacity: chatEnabled && (isVisible || isInputActive || config.moveMode || config.resizeMode) ? 1 : 0,
          pointerEvents: chatEnabled && (isVisible || isInputActive || config.moveMode || config.resizeMode) ? 'auto' : 'none',
          display: chatEnabled && (isVisible || isInputActive || config.moveMode || config.resizeMode) ? 'flex' : 'none'
        }}
      >
        {(config.moveMode || config.resizeMode) && (
          <div className="zen-chat-moveOverlay">
            {config.moveMode ? 'MOD MUTARE ACTIV' : 'MOD REDIMENSIONARE ACTIV'}
          </div>
        )}

        <div 
          className="zen-chat-messageList" 
          ref={scrollRef}
          style={{
            maskImage: isInputActive ? 'linear-gradient(to bottom, black 0%, black 80%, transparent 95%)' : 'none',
            WebkitMaskImage: isInputActive ? 'linear-gradient(to bottom, black 0%, black 80%, transparent 95%)' : 'none'
          }}
        >
          {categoriesFiltered.slice(isInputActive ? -20 : -5).map((msg: string, i: number) => (
            <Message key={i} data={msg} fontSize={config.fontSize} />
          ))}
        </div>

        {isInputActive && (
        <div className="zen-chat-inputWrapper">
          <div className="zen-chat-inputSection">
            <div className="zen-chat-inputContainer">
            <input 
              ref={inputRef}
              className="zen-chat-textInput"
              style={{ fontSize: `${config.fontSize * 0.9}vw` }} 
              placeholder="SCRIE UN MESAJ..." 
              maxLength={400}
              value={input}
              onFocus={() => resetInactivityTimer()}
              onChange={(e) => { setInput(e.target.value.slice(0, 400)); resetInactivityTimer(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <div className="zen-chat-inputActions">
               <div 
                 className="zen-chat-enterBtn"
                 style={{ fontSize: `${config.fontSize * 0.85}vw` }} 
                 onClick={handleSendMessage}
               >
                 <Icons.Send />
               </div>
               <div 
                 className="zen-chat-settingsBtn"
                 style={{ color: isSettingsOpen ? THEME.yellow : THEME.bleu }}
                 onClick={() => { setIsSettingsOpen(!isSettingsOpen); resetInactivityTimer(); }}
               >
                 <Icons.Settings />
               </div>
            </div>
          </div>

          {isSettingsOpen && (
            <div className="zen-chat-settingsModal">
              <div className="zen-chat-settingsTitle" style={{fontSize: `${config.fontSize * 0.9}vw`}}>SETĂRI CHAT</div>
              
              <div className="zen-chat-settingRow">
                <span style={{color: THEME.yellow, fontSize: `${config.fontSize * 0.75}vw`}}>FONT SIZE</span>
                <input 
                  type="range" min="0.5" max="1.5" step="0.05" 
                  className="zen-chat-custom-range"
                  value={config.fontSize} 
                  onChange={(e) => saveConfig({...config, fontSize: parseFloat(e.target.value)})} 
                />
              </div>

              <div className="zen-chat-settingRow">
                <span style={{color: THEME.yellow, fontSize: `${config.fontSize * 0.75}vw`}}>AUTO-HIDE ({config.autoHideTime}s)</span>
                <input 
                  type="range" min="3" max="60" step="1" 
                  className="zen-chat-custom-range"
                  value={config.autoHideTime} 
                  onChange={(e) => saveConfig({...config, autoHideTime: parseInt(e.target.value)})} 
                />
              </div>

              <div 
                className="zen-chat-settingBtnAction"
                style={{
                  fontSize: `${config.fontSize * 0.72}vw`,
                  backgroundColor: config.resizeMode ? THEME.yellow : 'rgba(255,255,255,0.1)',
                  color: config.resizeMode ? '#000' : '#fff'
                }}
                onClick={() => saveConfig({...config, resizeMode: !config.resizeMode, moveMode: false})}
              >
                <Icons.Resize /> {config.resizeMode ? 'SALVEAZĂ' : 'RESIZING'}
              </div>

              <div 
                className="zen-chat-settingBtnAction"
                style={{
                  fontSize: `${config.fontSize * 0.72}vw`,
                  backgroundColor: config.moveMode ? THEME.yellow : 'rgba(255,255,255,0.1)',
                  color: config.moveMode ? '#000' : '#fff'
                }}
                onClick={() => saveConfig({...config, moveMode: !config.moveMode, resizeMode: false})}
              >
                <Icons.Move /> {config.moveMode ? 'SALVEAZĂ' : 'MOVE CHAT'}
              </div>
            </div>
          )}
          </div>

          <div className="zen-chat-filterBar">
            {getFilters().map(f => (
              <div 
                key={f} 
                onClick={() => handleFilterClick(f)}
                className="zen-chat-filterItem"
                style={{
                  backgroundColor: activeFilter === f ? THEME.yellow : 'rgba(20,20,20,0.9)',
                  color: activeFilter === f ? '#000' : '#fff',
                  opacity: activeFilter === f ? 1 : 0.7
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
        )}

        {config.resizeMode && (
          <div onMouseDown={startResizing} className="zen-chat-resizeHandle">
            <div className="zen-chat-resizeDot" />
          </div>
        )}
        <style>{`
          .zen-chat-outside-click {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 90;
            background: transparent;
            pointer-events: auto;
          }
          .zen-chat-container {
            position: absolute;
            display: flex;
            flex-direction: column;
            gap: 0.6vh;
            transition: opacity 0.4s ease;
            z-index: 100;
            padding: 8px;
            border-radius: 5px;
            background-color: transparent;
            box-sizing: border-box;
          }
          .zen-chat-moveOverlay {
            position: absolute;
            top: -25px;
            left: 0;
            background-color: #FFD700;
            color: #000;
            font-size: 0.7vw;
            padding: 2px 8px;
            font-weight: bold;
            border-radius: 2px 2px 0 0;
          }
          .zen-chat-messageList {
            display: flex;
            flex-direction: column;
            gap: 0.6vh;
            flex: 1;
            overflow-y: auto;
            padding-left: 0.8vw;
            border-radius: 5px;
            background-color: transparent;
            direction: rtl;
          }
          .zen-chat-message-header {
            display: flex;
            align-items: center;
            gap: 0.6vw;
            padding-left: 0.5vw;
            margin-bottom: 0.2vh;
            border-left: 3px solid rgba(255, 255, 255, 0.3);
          }
          .zen-chat-header-title {
            letter-spacing: 0.5px;
            font-family: system-ui, sans-serif !important;
            font-weight: bold !important;
            font-style: normal !important;
          }
          .zen-chat-rank-badge {
            background-color: #4ade80;
            color: #000;
            padding: 0 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-style: normal !important;
            font-weight: bold !important;
            font-family: system-ui, sans-serif !important;
            border-radius: 2px !important;
            line-height: 1 !important;
          }
          .zen-chat-ad-badge {
            background-color: #ef4444 !important;
            color: #fff !important;
            padding: 0 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-style: normal !important;
            font-weight: bold !important;
            font-family: system-ui, sans-serif !important;
            border-radius: 2px !important;
            line-height: 1 !important;
          }
          .zen-chat-message-wrapper {
            padding: 0.5vh 0.8vw !important;
            background: linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%) !important;
            border-left: 1px solid rgba(255,255,255,0.05) !important;
            border-radius: 6px 0 0 6px !important;
            flex-shrink: 0;
            direction: ltr !important;
          }
          .zen-chat-message-content {
            color: #fff;
            font-weight: 500;
            line-height: 1.3;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
            font-family: system-ui, sans-serif !important;
            word-wrap: break-word;
          }
          .zen-chat-message-content span {
            text-shadow: inherit;
          }
          .zen-chat-message-subtext {
            color: #FFD700 !important;
            opacity: 0.8 !important;
            margin-top: 2px !important;
            font-style: italic !important;
            font-weight: bold !important;
          }
          .zen-chat-badge {
            padding: 1px 5px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-style: normal;
            font-weight: 900;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            border-radius: 3px;
            text-transform: uppercase;
            line-height: 1.1;
            margin-right: 0.4vw;
            text-shadow: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
            font-size: 0.85em;
          }
          .zen-chat-badge.lightgreen { background-color: #90ee90; color: #000; }
          .zen-chat-badge.green { background-color: #4ade80; color: #000; }
          .zen-chat-badge.cyan { background-color: #06b6d4; color: #000; }
          .zen-chat-badge.blue { background-color: #3b82f6; color: #fff; }
          .zen-chat-badge.purple { background-color: #a855f7; color: #fff; }
          .zen-chat-badge.yellow { background-color: #facc15; color: #000; }
          .zen-chat-badge.red { background-color: #ef4444; color: #fff; }
          .zen-chat-badge.orange { background-color: #f97316; color: #fff; }
          .zen-chat-badge.black { background-color: #000; color: #fff; border: 1px solid #333; }

          .zen-chat-inputWrapper {
            position: absolute;
            bottom: 8px; /* matching padding of container */
            left: 8px;
            right: 8px;
            z-index: 10;
            display: flex;
            flex-direction: column;
            gap: 0.3vh;
          }
          .zen-chat-filterBar {
            display: flex;
            gap: 0.3vw;
            flex-wrap: wrap;
          }
          .zen-chat-filterItem {
            font-size: 0.7vw;
            padding: 2px 10px;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
            font-family: system-ui, sans-serif;
          }
          .zen-chat-inputSection {
            display: flex;
            flex-direction: column;
            gap: 0.5vh;
            position: relative;
          }
          .zen-chat-inputContainer {
            background-color: rgba(5, 5, 5, 0.7);
            border: 1px solid rgba(255, 215, 0, 0.3);
            padding: 0.4vh 0.8vw;
            display: flex;
            align-items: center;
            border-radius: 5px;
          }
          .zen-chat-textInput {
            background: none !important;
            border: none !important;
            color: #fff !important;
            flex: 1 !important;
            outline: none !important;
            font-style: italic !important;
            font-weight: 900 !important;
            box-shadow: none !important;
            padding: 0;
          }
          .zen-chat-textInput::placeholder { 
            color: rgba(255, 255, 255, 0.4); 
          }
          .zen-chat-inputActions {
            display: flex;
            align-items: center;
            gap: 0.6vw;
          }
          .zen-chat-enterBtn {
            display: flex;
            align-items: center;
            gap: 0.3vw;
            font-weight: 900;
            cursor: pointer;
            font-style: italic;
            color: #FFD700;
          }
          .zen-chat-settingsBtn {
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: color 0.2s;
            margin-left: 0.2vw;
          }
          .zen-chat-settingsModal {
            position: absolute;
            top: 110%;
            left: 0;
            background-color: rgba(5,5,5,0.98);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 5px;
            padding: 6px;
            width: 120px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            z-index: 110;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .zen-chat-settingsTitle {
            color: #FFD700;
            font-weight: bold;
            font-style: italic;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 3px;
          }
          .zen-chat-settingRow {
            display: flex;
            flex-direction: column;
            gap: 1px;
            color: #fff;
          }
          .zen-chat-settingBtnAction {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 4px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
          }
          .zen-chat-resizeHandle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 16px;
            height: 16px;
            cursor: nwse-resize;
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            padding: 3px;
          }
          .zen-chat-resizeDot {
            width: 6px;
            height: 6px;
            background-color: #FFD700;
            border-radius: 1px;
            box-shadow: -1px -1px 0 rgba(0,0,0,0.5);
          }
          .zen-chat-messageList::-webkit-scrollbar { width: 6px; display: block !important; }
          .zen-chat-messageList::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
          .zen-chat-messageList::-webkit-scrollbar-thumb { background: #FFD700; border-radius: 10px; border: 1px solid rgba(0,0,0,0.3); }
          .zen-chat-messageList::-webkit-scrollbar-thumb:hover { background: #fff; }

          .zen-chat-custom-range { -webkit-appearance: none; width: 100% !important; background: transparent !important; margin: 3px 0 !important; }
          .zen-chat-custom-range:focus { outline: none !important; }
          .zen-chat-custom-range::-webkit-slider-runnable-track { width: 100% !important; height: 2px !important; cursor: pointer !important; background: rgba(255, 215, 0, 0.2) !important; border-radius: 10px !important; }
          .zen-chat-custom-range::-webkit-slider-thumb { height: 8px !important; width: 8px !important; border-radius: 50% !important; background: #FFD700 !important; cursor: pointer !important; -webkit-appearance: none !important; margin-top: -3px !important; box-shadow: 0 0 3px rgba(0,0,0,0.5) !important; }
        `}</style>
      </div>
    </>
  );
};
const mapStateToProps = (state: StoreState) => ({
	messages: state.app.chat
});
const mapDispatchToProps = {
	sendMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
