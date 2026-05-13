import React, { useState, useEffect, useCallback, useRef } from 'react';

const AdminMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminDuty, setAdminDuty] = useState(false);
  const [adminLevel, setAdminLevel] = useState(0);
  const [currentView, setCurrentView] = useState('main'); 
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [activeList, setActiveList] = useState({ visible: false, title: '', data: [] as any[] });
  const [lastHouseId, setLastHouseId] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMaximized, setIsMaximized] = useState(false); 
  const [ranksList, setRanksList] = useState([] as any[]);
  const [membersList, setMembersList] = useState([] as any[]);
  const [whitelistEnabled, setWhitelistEnabledUI] = useState(false);
  const itemsPerPage = 8;
  
  const [modal, setModal] = useState({ 
    type: null as string | null, 
    step: 0, 
    id: '', 
    name: '',
    extraId: '',
    reason: '', 
    time: '', 
    payment: '',
    garageType: '',
    houseType: '', 
    bizType: '',
    houseStatus: '', 
    price: '',
    coords: '', 
    profitPercent: '',
    targetItem: null as any,
    targetOrg: '',
    visualname: '',
    carType: '',
    moneyType: '',
    isPermanent: false,
    withPayment: false,
    action: '',
    vaultAccess: false,
    rankId: '',
    salary: ''
  });

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemsRefs = useRef<Array<HTMLDivElement | null>>([]);

  const colors = {
    bg: 'rgba(10, 10, 10, 0.98)',
    accent: '#f2ba00',
    accentLow: 'rgba(242, 186, 0, 0.15)',
    border: '#222',
    divider: 'rgba(242, 186, 0, 0.3)', 
    success: '#2ecc71',
    danger: '#e74c3c',
    info: '#3498db',
    overlay: 'rgba(0, 0, 0, 0.85)'
  };

  const toggleCursor = (state: boolean) => {
    if ((window as any).mp) {
        (window as any).mp.trigger('client:adminMenuState', state);
    }
  };

  useEffect(() => {
    toggleCursor(isOpen || activeList.visible || !!modal.type);
  }, [isOpen, activeList.visible, modal.type]);

  const isListingModal = (type: string | null) => {
    return type === 'adm_rankuri' || type === 'adm_membri' || ['add_org_safe', 'add_org_garage', 'del_org_safe', 'del_org_garage'].includes(type || '');
  };

  const isWhitelistList = (title: string) => {
    return title.includes("WHITELIST");
  };

  useEffect(() => {
    if (modal.type && inputRef.current && modal.type !== 'show_coords' && modal.type !== 'player_coords') {
      inputRef.current.focus();
    }
  }, [modal.type, modal.step]);

  useEffect(() => {
    if (isOpen && itemsRefs.current[selectedIndex]) {
      itemsRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex, isOpen, currentView]);

  const getMenuItems = useCallback(() => {
    const lvl = adminLevel;
    if (!adminDuty) return ['ADUTY ON'];

    if (currentView === 'main') {
      const items = ['ADUTY OFF'];
      if (lvl >= 1) items.push('PLAYER >', 'VEHICLE >', 'TELEPORT >');
      if (lvl >= 3) items.push('LISTA >', 'DIVERSE >');
      if (lvl >= 7) items.push('DIVIDER', 'CREAZA >', 'ADM AFACERI >', 'ADM ORGANIZATII >');
      return items;
    }
    if (currentView === 'player') {
      const items = ['< INAPOI'];
      if (lvl >= 1) items.push('WARN', 'KICK', 'FREEZE', 'UNFREEZE');
      if (lvl >= 2) items.push('BAN >');
      return items;
    }
    if (currentView === 'vehicle') {
      const items = ['< INAPOI'];
      if (lvl >= 1) items.push('FIX', 'DELETE');
      if (lvl >= 2) items.push('DELETE RADIUS');
      if (lvl >= 4) {
          items.push('DELETE ALL');
          items.push('STOP DELETEALL');
      }
      return items;
    }
    if (currentView === 'delall_type') return ['< INAPOI', 'INSTANT', 'PE TIMP (MINUTE)'];
    if (currentView === 'teleport') {
      const items = ['< INAPOI'];
      if (lvl >= 1) items.push('LA JUCATOR', 'LA MINE', 'LA WAYPOINT');
      if (lvl >= 2) items.push('LA COORDONATE');
      return items;
    }
    if (currentView === 'create') return ['< INAPOI', 'CASA >', 'GARAJ >', 'AFACERE >'];
    if (currentView === 'adm_orgs') return ['< INAPOI', 'SINDICAT >', 'POLITIE >', 'UMU >', 'MAFII >', 'GANGURI >', 'CLANURI >'];
    if (currentView === 'adm_org_politie') return ['< INAPOI', 'ADM RANKURI', 'ADM MEMBRI'];
    if (currentView === 'adm_org_sindicat') return ['< INAPOI', 'ADM RANKURI', 'ADM MEMBRI'];
    if (currentView === 'adm_org_umu') return ['< INAPOI', 'ADM RANKURI', 'ADM MEMBRI'];
    if (currentView === 'adm_org_mafie') return ['< INAPOI', 'LISTA MAFII', 'CREAZA MAFIE', 'MARKERS >', 'ADM RANKURI', 'ADM MEMBRI'];
    if (currentView === 'adm_org_gang') return ['< INAPOI', 'LISTA GANGURI', 'CREAZA GANG', 'MARKERS >', 'ADM RANKURI', 'ADM MEMBRI'];
    if (currentView === 'adm_org_clanuri') return ['< INAPOI', 'LISTA CLANURI', 'CREAZA CLAN', 'MARKERS >', 'ADM RANKURI', 'ADM MEMBRI'];
    if (currentView === 'adm_org_clanuri_markers' || currentView === 'adm_org_mafie_markers' || currentView === 'adm_org_gang_markers') return ['< INAPOI', 'ADAUGA SEIF', 'ADAUGA GARAJ', 'STERGE SEIF', 'STERGE GARAJ'];
    if (currentView === 'create_biz_type') return ['< INAPOI', 'Magazin 24/7', 'Magazin de Haine', 'Benzinarie', 'Magazin de Unelte', 'Magazin de Electronice', 'Farmacie', 'Fastfood', 'Restaurant', 'Club', 'Gunshop', 'Bar', 'Frizerie', 'Spalatorie Auto', 'Tattoo Shop', 'Service Auto >'];
    if (currentView === 'create_service_type') return ['< INAPOI', 'Service Auto (Service)', 'Service Auto (Tuning)'];
    if (currentView === 'adm_biz_type') return ['< INAPOI', 'Magazin 24/7', 'Magazin de Haine', 'Benzinarie', 'Magazin de Unelte', 'Magazin de Electronice', 'Farmacie', 'Fastfood', 'Restaurant', 'Club', 'Gunshop', 'Bar', 'Frizerie', 'Spalatorie Auto', 'Tattoo Shop', 'Service Auto >'];
    if (currentView === 'adm_service_type') return ['< INAPOI', 'Service Auto (Service)', 'Service Auto (Tuning)'];
    if (currentView === 'create_house_type') return ['< INAPOI', 'ECONOMIC', 'MEDIU', 'PREMIUM'];
    if (currentView === 'create_house_status') return ['< INAPOI', 'LA VANZARE', 'PROPRIETAR'];
    if (currentView === 'delete_menu') return ['< INAPOI', 'CASA', 'GARAJ', 'AFACERE', 'CLAN', 'GANG', 'MAFIE'];
    if (currentView === 'list_menu') return ['< INAPOI', 'CASE', 'GARAJE', 'AFACERI', 'CLANURI', 'GANGURI', 'MAFII'];
    if (currentView === 'list_garage_type') return ['< INAPOI', 'TOATE', 'CIVIL', 'POLITIE', 'UMU', 'BARCI', 'BARCI POLITIE', 'CAMIOANE', 'AVIOANE', 'ELICOPTER', 'HELI POLITIE', 'HELI UMU', 'KART', 'FORMULA1'];
    if (currentView === 'create_garage') return ['< INAPOI', 'CIVIL', 'POLITIE', 'UMU', 'BARCI', 'BARCI POLITIE', 'CAMIOANE', 'AVIOANE', 'ELICOPTER', 'HELI POLITIE', 'HELI UMU', 'KART', 'FORMULA1'];
    if (currentView === 'ban_type') {
      const items = ['< INAPOI'];
      if (lvl >= 5) items.push('PERMANENT >');
      if (lvl >= 2) items.push('TEMPORAR >');
      return items;
    }
    if (currentView === 'ban_permanent_pay') return ['< INAPOI', 'CU PLATA', 'FARA PLATA'];
    if (currentView === 'ban_temporar_pay') return ['< INAPOI', 'CU PLATA', 'FARA PLATA'];
    if (currentView === 'diverse') {
      const items = ['< INAPOI'];
      if (lvl >= 4) items.push('NOTIFICARE');
      if (lvl >= 5) items.push('ANUNT');
      if (lvl >= 6) items.push('GIVEITEM', 'GIVEMONEY >');
      if (lvl >= 7) items.push('GIVECAR >', 'SKIN JUCATOR');
      if (lvl >= 3) items.push('COORDONATE', 'WHITELIST >');
      return items;
    }
    if (currentView === 'whitelist') {
        const items = ['< INAPOI', whitelistEnabled ? 'SET OFF' : 'SET ON', 'MANAGE'];
        return items;
    }
    if (currentView === 'givemoney_type') return ['< INAPOI', 'CASH', 'IN BANCA'];
    if (currentView === 'givecar_type') return ['< INAPOI', 'TEMPORAR', 'PERMANENT'];

    return [];
  }, [adminDuty, currentView, whitelistEnabled]);

  const rawMenuItems = getMenuItems();

  const menuItems: string[] = [];
  rawMenuItems.forEach((item, idx) => {
    menuItems.push(item);
    if (idx < rawMenuItems.length - 1) {
        const nextItem = rawMenuItems[idx + 1];
        const isSpecial = (val: string) => val === 'DIVIDER';
        if (!isSpecial(item) && !isSpecial(nextItem)) {
            menuItems.push('DIVIDER');
        }
    }
  });

  const showListUI = (title: string, mockData?: any[]) => {
    const isHouse = title.includes("CASE");
    
    let data = mockData;
    if (data === undefined) {
        // Default to empty array instead of mock data
        data = [];
    }
    
    setActiveList({ visible: true, title: title, data: data });
    setCurrentPage(0);
    setSearchTerm('');
    setIsMaximized(false);
  };

  const closeActiveList = () => {
    setActiveList({ visible: false, title: '', data: [] });
    setSearchTerm('');
    setIsMaximized(false);
  };

  useEffect(() => {
    (window as any).toggleAdminMenu = (level: number, duty: boolean, whitelistStatus?: boolean) => {
        if (level !== undefined) setAdminLevel(level);
        if (duty !== undefined) setAdminDuty(duty);
        if (whitelistStatus !== undefined) setWhitelistEnabledUI(whitelistStatus);
        
        setIsOpen((prev) => {
            if (prev) {
                resetModal();
                closeActiveList();
                setCurrentView('main');
                (window as any).adminMenuOpen = false;
                window.dispatchEvent(new Event('adminMenuToggled'));
                return false;
            } else {
                (window as any).adminMenuOpen = true;
                window.dispatchEvent(new Event('adminMenuToggled'));

                if ((window as any).mp) {
                    (window as any).mp.trigger('Admin-GetLastHouseId');
                }

                return true;
            }
        });
    };

    (window as any).setLastHouseId = (id: number) => {
        setLastHouseId(id);
    };

    (window as any).setAdminList = (title: string, dataStr: string) => {
        try {
            const data = JSON.parse(dataStr);
            showListUI(title, data);
        } catch (e) {
            console.error("Error parsing admin list data:", e);
        }
    };

    (window as any).setOrgRanks = (dataStr: string) => {
        try {
            const data = JSON.parse(dataStr);
            setRanksList(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error parsing org ranks:", e);
        }
    };

    (window as any).setOrgMembers = (dataStr: string) => {
        try {
            const data = JSON.parse(dataStr);
            setMembersList(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error parsing org members:", e);
        }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const isTyping = (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'SELECT';

      if (e.key === 'Escape' || (e.key === 'Backspace' && !isTyping)) {
        if (modal.type) { 
            if (modal.step > 0) {
                setModal(p => ({ ...p, step: p.step - 1 }));
            } else {
                resetModal(); 
            }
            return; 
        }
        if (activeList.visible) { closeActiveList(); return; }
        if (currentView !== 'main') {
            const backMap: any = {
                'create_house_status': 'create_house_type',
                'create_house_type': 'create',
                'create_biz_type': 'create',
                'create_service_type': 'create_biz_type',
                'adm_biz_type': 'create',
                'adm_service_type': 'adm_biz_type',
                'adm_orgs': 'create',
                'adm_org_sindicat': 'adm_orgs',
                'adm_org_politie': 'adm_orgs',
                'adm_org_umu': 'adm_orgs',
                'adm_org_clanuri': 'adm_orgs',
                'adm_org_mafie': 'adm_orgs',
                'adm_org_gang': 'adm_orgs',
                'adm_org_clanuri_markers': 'adm_org_clanuri',
                'create_garage': 'create',
                'delall_type': 'vehicle',
                'list_garage_type': 'list_menu',
                'diverse': 'main',
                'givemoney_type': 'diverse',
                'givecar_type': 'diverse',
                'ban_type': 'player',
                'ban_permanent_pay': 'ban_type',
                'ban_temporar_pay': 'ban_type'
            };
            setCurrentView(backMap[currentView] || 'main');
            setSelectedIndex(0);
            return;
        }
        setIsOpen(false);
        (window as any).adminMenuOpen = false;
        window.dispatchEvent(new Event('adminMenuToggled'));
        return;
      }

      if (!modal.type && !activeList.visible && !isTyping) {
        if (e.key === 'ArrowDown') {
          e.preventDefault(); 
          let nextIndex = (selectedIndex + 1) % menuItems.length;
          while (menuItems[nextIndex] === 'DIVIDER') {
            nextIndex = (nextIndex + 1) % menuItems.length;
          }
          setSelectedIndex(nextIndex);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          let nextIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
          while (menuItems[nextIndex] === 'DIVIDER') {
            nextIndex = (nextIndex - 1 + menuItems.length) % menuItems.length;
          }
          setSelectedIndex(nextIndex);
        } else if (e.key === 'Enter') {
          handleSelection(menuItems[selectedIndex]);
        }
      } else if (modal.type && e.key === 'Enter') {
        handleModalNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, menuItems, selectedIndex, modal, activeList, currentView]);

  const resetModal = () => {
    setModal({ type: null, step: 0, id: '', name: '', visualname: '', extraId: '', reason: '', time: '', payment: '', garageType: '', houseType: '', bizType: '', houseStatus: '', price: '', coords: '', profitPercent: '', targetItem: null, targetOrg: '', carType: '', moneyType: '', isPermanent: false, withPayment: false, action: '', vaultAccess: false, rankId: '', salary: '' });
  };

  const handleSelection = (item: string) => {
    if (item === 'DIVIDER' || item === '< INAPOI') {
        if (item === '< INAPOI') {
            const backMap: any = {
                'create_house_status': 'create_house_type',
                'create_house_type': 'create',
                'create_biz_type': 'create',
                'create_service_type': 'create_biz_type',
                'adm_biz_type': 'create',
                'adm_service_type': 'adm_biz_type',
                'adm_orgs': 'create',
                'adm_org_sindicat': 'adm_orgs',
                'adm_org_politie': 'adm_orgs',
                'adm_org_umu': 'adm_orgs',
                'adm_org_clanuri': 'adm_orgs',
                'adm_org_mafie': 'adm_orgs',
                'adm_org_gang': 'adm_orgs',
                'adm_org_clanuri_markers': 'adm_org_clanuri',
                'create_garage': 'create',
                'delall_type': 'vehicle',
                'list_garage_type': 'list_menu',
                'diverse': 'main',
                'givemoney_type': 'diverse',
                'givecar_type': 'diverse',
                'ban_type': 'player',
                'ban_permanent_pay': 'ban_type',
                'ban_temporar_pay': 'ban_type'
            };
            setCurrentView(backMap[currentView] || 'main');
            setSelectedIndex(0);
        }
        return;
    }

    const viewMap: any = {
        'PLAYER >': 'player', 'VEHICLE >': 'vehicle', 'TELEPORT >': 'teleport',
        'CREAZA >': 'create', 'STERGE >': 'delete_menu', 'LISTA >': 'list_menu',
        'DIVERSE >': 'diverse', 'GARAJE': 'list_garage_type', 'GARAJ >': 'create_garage',
        'CASA >': 'create_house_type', 'AFACERE >': 'create_biz_type', 'ADM AFACERI >': 'adm_biz_type',
        'ADM ORGANIZATII >': 'adm_orgs', 'SINDICAT >': 'adm_org_sindicat', 'POLITIE >': 'adm_org_politie', 'UMU >': 'adm_org_umu', 'CLANURI >': 'adm_org_clanuri',
        'MAFII >': 'adm_org_mafie', 'GANGURI >': 'adm_org_gang',
        'MARKERS >': () => {
            if (currentView === 'adm_org_mafie') setCurrentView('adm_org_mafie_markers');
            else if (currentView === 'adm_org_gang') setCurrentView('adm_org_gang_markers');
            else setCurrentView('adm_org_clanuri_markers');
        },
        'Service Auto >': (currentView === 'create_biz_type') ? 'create_service_type' : 'adm_service_type',
        'GIVEMONEY >': 'givemoney_type', 'GIVECAR >': 'givecar_type',
        'WHITELIST >': 'whitelist',
        'BAN >': 'ban_type', 'PERMANENT >': 'ban_permanent_pay', 'TEMPORAR >': 'ban_temporar_pay'
    };
    if (viewMap[item]) { setCurrentView(viewMap[item]); setSelectedIndex(0); return; }

    if (currentView === 'create_biz_type' || currentView === 'create_service_type') {
        const bizType = item.includes('Service Auto (') ? item.split('(')[1].split(')')[0].trim() : item;
        setModal(p => ({ ...p, type: 'create_biz', bizType: bizType, step: 0 }));
        return;
    }

    if (currentView === 'adm_biz_type' || currentView === 'adm_service_type') {
        const bizType = item.includes('Service Auto (') ? item.split('(')[1].split(')')[0].trim() : item;
        setModal(p => ({ ...p, type: 'create_biz_point_confirm', bizType: bizType, step: 0 }));
        return;
    }

    if (currentView === 'list_menu' || currentView === 'list_garage_type') {
        const typeStr = currentView === 'list_garage_type' ? `GARAJE (${item})` : item;
        const typeMap: any = {'CASE': 'house', 'CLANURI': 'clan', 'GANGURI': 'gang', 'MAFII': 'mafie'};
        const realType = typeMap[item] || (currentView === 'list_garage_type' ? `garage_${item.toLowerCase()}` : item.toLowerCase());
        if ((window as any).mp) (window as any).mp.trigger('client:adminList', realType);
        showListUI(`LISTA ${typeStr.toUpperCase()}`);
        return;
    }

    if (currentView === 'create_house_type') {
        setModal(p => ({ ...p, houseType: item }));
        setCurrentView('create_house_status');
        setSelectedIndex(0);
        return;
    }

    if (currentView === 'create_house_status') {
        setModal(p => ({ ...p, type: 'create_house_input', houseStatus: item, step: 0 }));
        return;
    }

    if (currentView === 'givemoney_type') {
        const mType = item === 'CASH' ? 'CASH' : 'BANK';
        setModal(p => ({ ...p, type: 'givemoney_input', moneyType: mType, step: 0 }));
        return;
    }

    if (currentView === 'givecar_type') {
        const cType = item === 'TEMPORAR' ? 'TEMPORARY' : 'PERMANENT';
        setModal(p => ({ ...p, type: 'givecar_input', carType: cType, step: 0 }));
        return;
    }

    if (currentView === 'adm_org_politie' || currentView === 'adm_org_umu' || currentView === 'adm_org_clanuri' || currentView === 'adm_org_mafie' || currentView === 'adm_org_gang' || currentView === 'adm_org_sindicat') {
        const targetOrg = currentView.split('_').pop() || '';
        if (item === 'ADM RANKURI') { 
            const step = (targetOrg === 'clanuri' || targetOrg === 'mafie' || targetOrg === 'gang') ? 0 : 1;
            setModal({...modal, type: 'adm_rankuri', targetOrg, step, extraId: ''}); 
            if (targetOrg !== 'clanuri' && targetOrg !== 'mafie' && targetOrg !== 'gang' && (window as any).mp) {
                (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org: targetOrg}));
            }
            return; 
        }
        if (item === 'ADM MEMBRI') {
            let step = (targetOrg === 'clanuri' || targetOrg === 'mafie' || targetOrg === 'gang') ? 0 : 1;
            if (targetOrg === 'sindicat' || targetOrg === 'politie' || targetOrg === 'umu') step = 2;
            setModal({...modal, type: 'adm_membri', targetOrg, step, extraId: ''});
            if (targetOrg !== 'clanuri' && targetOrg !== 'mafie' && targetOrg !== 'gang' && (window as any).mp) {
                (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org: targetOrg}));
                if (targetOrg === 'sindicat' || targetOrg === 'politie' || targetOrg === 'umu') {
                    (window as any).mp.trigger('client:adminAction', 'get_org_members', JSON.stringify({org: targetOrg}));
                }
            }
            return;
        }
        if (item.includes('LISTA ')) {
            const orgTypeOriginal = item.split(' ')[1].toLowerCase();
            const map: any = {'ganguri': 'gang', 'clanuri': 'clanuri', 'mafii': 'mafie'};
            const mappedOrgType = map[orgTypeOriginal] || orgTypeOriginal;
            if ((window as any).mp) (window as any).mp.trigger('client:adminList', mappedOrgType);
            showListUI(item);
            return;
        }
        if (item.includes('CREAZA ')) {
            const orgTypeOriginal = item.split(' ')[1].toLowerCase();
            const map: any = {'mafie': 'mafia', 'gang': 'gang', 'clan': 'clan'};
            const mappedOrgType = map[orgTypeOriginal] || orgTypeOriginal;
            setModal({...modal, type: `create_${mappedOrgType}`, step: 0}); 
            return;
        }
        if (item === 'MARKERS >') { 
            if (targetOrg === 'mafie') setCurrentView('adm_org_mafie_markers');
            else if (targetOrg === 'gang') setCurrentView('adm_org_gang_markers');
            else setCurrentView('adm_org_clanuri_markers');
        }
    }

    if (currentView === 'adm_org_clanuri_markers' || currentView === 'adm_org_mafie_markers' || currentView === 'adm_org_gang_markers') {
        const targetOrg = currentView.includes('_mafie_') ? 'mafie' : (currentView.includes('_gang_') ? 'gang' : 'clanuri');
        if (item === 'ADAUGA SEIF') { 
            setModal({...modal, type: 'add_org_safe', targetOrg, step: 0, extraId: ''}); 
            if ((window as any).mp) (window as any).mp.trigger('client:adminList', targetOrg);
            return; 
        }
        if (item === 'ADAUGA GARAJ') { 
            setModal({...modal, type: 'add_org_garage', targetOrg, step: 0, extraId: ''}); 
            if ((window as any).mp) (window as any).mp.trigger('client:adminList', targetOrg);
            return; 
        }
        if (item === 'STERGE SEIF') { setModal({...modal, type: 'del_org_safe', targetOrg, step: 0, extraId: ''}); return; }
        if (item === 'STERGE GARAJ') { setModal({...modal, type: 'del_org_garage', targetOrg, step: 0, extraId: ''}); return; }
    }

    if (currentView === 'create_garage') {
        setModal(p => ({ ...p, type: 'create_garage_input', garageType: item, step: 0 }));
        return;
    }

    switch (item) {
      case 'ADUTY ON': 
          setAdminDuty(true); 
          setSelectedIndex(0); 
          if ((window as any).mp) (window as any).mp.invoke('command', 'aduty on');
          break;
      case 'ADUTY OFF': 
          setAdminDuty(false); 
          setSelectedIndex(0); 
          if ((window as any).mp) (window as any).mp.invoke('command', 'aduty off');
          break;
      case 'WARN': setModal({ ...modal, type: 'warn', step: 0 }); break;
      case 'KICK': setModal({ ...modal, type: 'kick', step: 0 }); break;
      case 'CU PLATA': 
      case 'FARA PLATA':
         if (currentView === 'ban_permanent_pay' || currentView === 'ban_temporar_pay') {
             setModal({ ...modal, type: 'ban_input', isPermanent: currentView === 'ban_permanent_pay', withPayment: item === 'CU PLATA', payment: item, step: 0 });
         }
         break;
      case 'FREEZE': setModal({ ...modal, type: 'freeze', step: 0 }); break;
      case 'UNFREEZE': setModal({ ...modal, type: 'unfreeze', step: 0 }); break;
      case 'SET ON': 
      case 'SET OFF':
          if ((window as any).mp) (window as any).mp.trigger('client:whitelistAction', 'toggle', item === 'SET ON');
          setWhitelistEnabledUI(item === 'SET ON');
          break;
      case 'MANAGE':
          if (currentView === 'whitelist') {
              if ((window as any).mp) (window as any).mp.trigger('client:adminList', 'whitelist');
          }
          break;
      case 'FIX': setModal({ ...modal, type: 'fix_vehicle_input', step: 0 }); break;
      case 'DELETE': if ((window as any).mp) (window as any).mp.trigger('client:adminVeh', 'delete'); break;
      case 'DELETE RADIUS': setModal({ ...modal, type: 'delradius', step: 0 }); break;
      case 'DELETE ALL': setCurrentView('delall_type'); setSelectedIndex(0); break;
      case 'STOP DELETEALL': if ((window as any).mp) (window as any).mp.trigger('client:adminVeh', 'cancel_delall_timed', JSON.stringify({})); break;
      case 'LA JUCATOR': setModal({ ...modal, type: 'tp_to_player', step: 0 }); break;
      case 'LA MINE': setModal({ ...modal, type: 'tp_here', step: 0 }); break;
      case 'LA COORDONATE': setModal({ ...modal, type: 'tp_to_coords', step: 0 }); break;
      case 'LA WAYPOINT': if ((window as any).mp) (window as any).mp.trigger('client:adminAction', 'tp_to_waypoint'); break;
      case 'AFACERE': setModal({ ...modal, type: (currentView === 'delete_menu' ? 'delete_afacere' : 'create_biz'), step: 0 }); break;
      case 'CLAN': setModal({ ...modal, type: (currentView === 'delete_menu' ? 'delete_clan' : 'create_clan'), step: 0 }); break;
      case 'GANG': setModal({ ...modal, type: (currentView === 'delete_menu' ? 'delete_gang' : 'create_gang'), step: 0 }); break;
      case 'MAFIE': setModal({ ...modal, type: (currentView === 'delete_menu' ? 'delete_mafie' : 'create_mafia'), step: 0 }); break;
      case 'CASA': setModal({ ...modal, type: 'delete_house', step: 0 }); break;
      case 'GARAJ': setModal({ ...modal, type: 'delete_garage', step: 0 }); break;
      case 'INSTANT': if ((window as any).mp) (window as any).mp.trigger('client:adminVeh', 'delall', 0); break;
      case 'PE TIMP (MINUTE)': setModal({ ...modal, type: 'delall_timed', step: 0 }); break;
      case 'NOTIFICARE': setModal({ ...modal, type: 'notify_player', step: 0 }); break;
      case 'ANUNT': setModal({ ...modal, type: 'global_announcement', step: 0 }); break;
      case 'GIVEITEM': setModal({ ...modal, type: 'giveitem_input', step: 0 }); break;
      case 'SKIN JUCATOR': setModal({ ...modal, type: 'giveskin_input', step: 0 }); break;
      case 'COORDONATE': 
        if ((window as any).mp && (window as any).mp.players && (window as any).mp.players.local) {
            try {
                const local = (window as any).mp.players.local;
                const pos = local.position;
                const heading = typeof local.getHeading === 'function' ? local.getHeading() : 0;
                const coordsStr = `${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)}, ${heading.toFixed(4)}`;
                setModal({...modal, type: 'player_coords', coords: coordsStr});
            } catch (e) {
                setModal({...modal, type: 'player_coords', coords: "EROARE CITIRE COORDONATE"});
            }
        } else {
            setModal({...modal, type: 'player_coords', coords: "123.456, 789.012, 34.567, 0.0000"});
        }
        break;
    }
  };

  const handleModalNext = () => {
    const { type, step } = modal;
    if (type === 'edit_item' || type === 'edit_house' || type === 'delete_afacere' || type === 'create_biz_point_confirm') submitModal();
    else if (type === 'confirm_delete' || type === 'confirm_org_rank_delete' || type === 'confirm_org_member_delete') { if (modal.reason.toLowerCase() === 'sterge') submitModal(); }
    else if (type === 'create_biz') {
      if (step === 0 && modal.name) setModal(p => ({ ...p, step: 1 }));
      else if (step === 1 && modal.extraId) setModal(p => ({ ...p, step: 2 }));
      else if (step === 2 && modal.price) setModal(p => ({ ...p, step: 3 }));
      else if (step === 3) setModal(p => ({ ...p, step: 4 }));
      else if (step === 4) submitModal();
    } else if (['create_clan', 'create_gang', 'create_mafia'].includes(type as string)) {
      if (step === 0 && modal.name) {
          console.log(`[AdminMenu] create_clan Step 0 -> 1. Name: ${modal.name}`);
          setModal(p => ({ ...p, step: 1 }));
      }
      else if (step === 1 && modal.visualname) {
          setModal(p => ({ ...p, step: 2 }));
      }
      else if (step === 2 && modal.id) {
          console.log(`[AdminMenu] create_clan Step 2 -> Submit. Leader ID: ${modal.id}`);
          submitModal();
      }
    } else if (type === 'edit_clan_info') {
        if (step === 0) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1) submitModal();
    } else if (['add_org_rank', 'update_org_rank', 'add_org_member', 'update_org_member'].includes(type as string)) {
        const org = modal.targetOrg;
        const extraId = modal.extraId;
        submitModal();
        // Go back to the management view instead of main
        setTimeout(() => {
            if (['add_org_member', 'update_org_member'].includes(type as string)) {
                setModal(p => ({ ...p, type: 'adm_membri', targetOrg: org, extraId: extraId, step: (org === 'clanuri' || org === 'mafie' || org === 'gang') ? 2 : 2 }));
            } else {
                setModal(p => ({ ...p, type: 'adm_rankuri', targetOrg: org, extraId: extraId, step: (org === 'clanuri' || org === 'mafie' || org === 'gang') ? 1 : 1 }));
            }
        }, 100);
    } else if (type === 'create_house_input') {
        if (modal.houseStatus === 'LA VANZARE') {
            if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
            else if (step === 1 && modal.name) setModal(p => ({ ...p, step: 2 }));
            else if (step === 2 && modal.price) submitModal();
        } else {
            if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
            else if (step === 1 && modal.extraId) setModal(p => ({ ...p, step: 2 }));
            else if (step === 2 && modal.name) setModal(p => ({ ...p, step: 3 }));
            else if (step === 3 && modal.price) submitModal();
        }
    } else if (type === 'giveitem_input') {
        if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.name) setModal(p => ({ ...p, step: 2 }));
        else if (step === 2 && modal.price) submitModal();
    } else if (type === 'givemoney_input') {
        if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.price) submitModal();
    } else if (type === 'givecar_input') {
        if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.name) submitModal();
    } else if (type === 'giveskin_input') {
        if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.name) submitModal();
    } else if (type === 'notify_player') {
        if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.reason) submitModal();
    } else if (type === 'global_announcement') {
        if (modal.reason) submitModal();
    } else if (type === 'add_member_input') {
        if (modal.id) {
            const org = modal.targetOrg;
            if ((window as any).mp) (window as any).mp.trigger('client:adminAction', 'add_org_member', JSON.stringify({org, extraId: modal.extraId, memberId: modal.id, rankId: modal.rankId}));
            setModal({...modal, type: (['clanuri', 'politie', 'umu', 'mafie', 'gang', 'sindicat'].includes(org)) ? 'adm_membri' : null, step: 2});
        }
    } else if (type === 'whitelist_input') {
        if (step === 0 && modal.name) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.id) submitModal();
    } else if (type === 'add_rank_input') {
        if (step === 0 && modal.name) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.salary) submitModal();
    } else if (type === 'org_marker_clan_input') {
        if (modal.extraId) {
            if ((window as any).mp) (window as any).mp.trigger('client:adminOrgMarkers', modal.action, JSON.stringify({orgId: modal.extraId}));
            setModal({...modal, type: null});
        }
    } else if (['delete_clan', 'delete_mafie', 'delete_gang'].includes(type as string)) {
        if (modal.reason.toUpperCase() === 'STERGE') submitModal();
    } else if (['add_org_safe', 'add_org_garage', 'del_org_safe', 'del_org_garage'].includes(type as string)) {
        if (modal.step === 0 && modal.id) {
            setModal(p => ({ ...p, step: 1 }));
            setCurrentPage(0); // Reset for confirmation if needed, though confirm doesn't use it
        }
        else if (modal.step === 1) submitModal();
    } else if (type?.startsWith('delete_') && modal.id) submitModal();
    else if (type === 'create_garage_input') {
        if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
        else if (step === 1 && modal.name) submitModal();
    } else if (type === 'ban_input') {
        const isPerm = modal.isPermanent;
        if (isPerm) {
            if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
            else if (step === 1 && modal.reason) submitModal();
        } else {
            if (step === 0 && modal.id) setModal(p => ({ ...p, step: 1 }));
            else if (step === 1 && modal.time) setModal(p => ({ ...p, step: 2 }));
            else if (step === 2 && modal.reason) submitModal();
        }
    } else if (step === 0) {
        if (['delall_timed', 'delradius', 'freeze', 'unfreeze', 'fix_vehicle_input', 'tp_to_player', 'tp_here', 'tp_to_coords'].includes(type as string)) {
            if (modal.id || type === 'fix_vehicle_input') submitModal();
        } else if (modal.id) {
            setModal(p => ({ ...p, step: 1 }));
        }
    } else if (step === 1 && modal.reason) submitModal();
  };

  const submitModal = () => {
    console.log(`[AdminMenu] --- SUBMIT MODAL START ---`);
    console.log(`[AdminMenu] Type: ${modal.type}`);
    console.log(`[AdminMenu] Step: ${modal.step}`);
    console.log(`[AdminMenu] Data:`, JSON.stringify(modal));
    
    if ((window as any).mp) {
        console.log(`[AdminMenu] window.mp detected, triggering event...`);
        if (modal.type === 'fix_vehicle_input') {
            (window as any).mp.trigger('client:adminVeh', 'fix', JSON.stringify(modal));
        } else if (modal.type === 'delradius') {
            (window as any).mp.trigger('client:adminVeh', 'delradius', JSON.stringify(modal));
        } else if (modal.type === 'delall_timed') {
            (window as any).mp.trigger('client:adminVeh', 'delall_timed', JSON.stringify(modal));
        } else if (modal.type === 'add_org_rank') {
            const org = modal.targetOrg;
            const extraId = modal.extraId;
            (window as any).mp.trigger('client:adminAction', 'add_org_rank', JSON.stringify({org, clanId: extraId, name: modal.name, salary: modal.salary, vaultAccess: modal.vaultAccess}));
            setTimeout(() => {
                (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org, clanId: extraId}));
                setModal(p => ({ ...p, type: 'adm_rankuri', step: 1 }));
            }, 200);
            return;
        } else if (modal.type === 'update_org_rank') {
            const org = modal.targetOrg;
            const extraId = modal.extraId;
            (window as any).mp.trigger('client:adminAction', 'update_org_rank', JSON.stringify({org, clanId: extraId, rankId: modal.rankId, name: modal.name, salary: modal.salary, vaultAccess: modal.vaultAccess}));
            setTimeout(() => {
                (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org, clanId: extraId}));
                setModal(p => ({ ...p, type: 'adm_rankuri', step: 1 }));
            }, 200);
            return;
        } else if (modal.type === 'add_org_member') {
            const org = modal.targetOrg;
            const extraId = modal.extraId;
            (window as any).mp.trigger('client:adminAction', 'add_org_member', JSON.stringify({org, clanId: extraId, memberId: modal.id, rankId: modal.rankId, vaultAccess: modal.vaultAccess}));
            setTimeout(() => {
                (window as any).mp.trigger('client:adminAction', 'get_org_members', JSON.stringify({org, clanId: extraId}));
                setModal(p => ({ ...p, type: 'adm_membri', step: 2 }));
            }, 200);
            return;
        } else if (modal.type === 'update_org_member') {
            const org = modal.targetOrg;
            const extraId = modal.extraId;
            (window as any).mp.trigger('client:adminAction', 'update_org_member', JSON.stringify({org, clanId: extraId, memberId: modal.id, rankId: modal.rankId, vaultAccess: modal.vaultAccess}));
            setTimeout(() => {
                (window as any).mp.trigger('client:adminAction', 'get_org_members', JSON.stringify({org, clanId: extraId}));
                setModal(p => ({ ...p, type: 'adm_membri', step: 2 }));
            }, 200);
            return;
        } else if (modal.type === 'confirm_org_rank_delete') {
            const org = modal.targetOrg;
            const extraId = modal.extraId;
            (window as any).mp.trigger('client:adminAction', 'del_org_rank', JSON.stringify({org: modal.targetOrg, clanId: modal.extraId, rankId: modal.targetItem.id}));
            setTimeout(() => {
                setModal(p => ({ ...p, type: 'adm_rankuri', targetOrg: org, extraId: extraId, step: 1 }));
                if ((window as any).mp) {
                    (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org, clanId: extraId}));
                }
            }, 100);
            return;
        } else if (modal.type === 'confirm_org_member_delete') {
            const org = modal.targetOrg;
            const extraId = modal.extraId;
            const memberId = modal.id;
            (window as any).mp.trigger('client:adminAction', 'del_org_member', JSON.stringify({org: modal.targetOrg, clanId: modal.extraId, memberId: memberId}));
            setTimeout(() => {
                setModal(p => ({ ...p, type: 'adm_membri', targetOrg: org, extraId: extraId, step: 2 }));
                if ((window as any).mp) {
                    (window as any).mp.trigger('client:adminAction', 'get_org_members', JSON.stringify({org, clanId: extraId}));
                }
            }, 100);
            return;
        } else if (['create_clan', 'create_gang', 'create_mafia'].includes(modal.type as string)) {
            (window as any).mp.trigger('client:adminAction', modal.type, JSON.stringify({id: modal.id, name: modal.name, visualname: modal.visualname}));
        } else if (modal.type === 'edit_clan_info') {
            (window as any).mp.trigger('client:adminAction', 'edit_clan_info', JSON.stringify({targetItem: modal.targetItem, name: modal.name, visualname: modal.visualname}));
        } else if (['delete_clan', 'delete_mafie', 'delete_gang'].includes(modal.type as string)) {
            (window as any).mp.trigger('client:adminAction', modal.type, JSON.stringify({id: modal.id, reason: modal.reason}));
        } else if (['add_org_safe', 'add_org_garage', 'del_org_safe', 'del_org_garage'].includes(modal.type as string)) {
            const act = modal.type === 'add_org_safe' ? 'add_safe' : (modal.type === 'add_org_garage' ? 'add_garage' : (modal.type === 'del_org_safe' ? 'del_safe' : 'del_garage'));
            (window as any).mp.trigger('client:adminOrgMarkers', act, JSON.stringify({orgId: modal.id}));
        } else if (modal.type === 'whitelist_input') {
            (window as any).mp.trigger('client:whitelistAction', modal.action, JSON.stringify({ name: modal.name, serial: modal.id }));
        } else {
            (window as any).mp.trigger('client:adminAction', modal.type, JSON.stringify(modal));
        }
        console.log(`[AdminMenu] Trigger sent.`);
    } else {
        console.warn(`[AdminMenu] window.mp NOT detected! Are you in browser or game?`);
    }
    if (!['add_org_rank', 'update_org_rank', 'add_org_member', 'update_org_member', 'confirm_org_rank_delete', 'confirm_org_member_delete'].includes(modal.type as string)) {
        resetModal(); 
        setCurrentView('main');
        setSelectedIndex(0);
    }
    console.log(`[AdminMenu] --- SUBMIT MODAL END ---`);
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const getModalTitle = () => {
    const { type } = modal;
    if (type === 'adm_rankuri') return `ADM RANKURI - ${modal.targetOrg?.toUpperCase() || ''}`;
    if (type === 'adm_membri') return `ADM MEMBRI - ${modal.targetOrg?.toUpperCase() || ''}`;
    
    switch(type) {
        case 'tp_here': return "TELEPORT JUCATOR LA TINE";
        case 'tp_to_player': return "TELEPORT LA JUCATOR";
        case 'tp_to_coords': return "TELEPORT LA COORDONATE";
        case 'warn': return "WARN JUCATOR";
        case 'kick': return "KICK JUCATOR";
        case 'ban_input': return "BAN JUCATOR";
        case 'freeze': return "FREEZE JUCATOR";
        case 'unfreeze': return "UNFREEZE JUCATOR";
        case 'fix_vehicle_input': return "REPARARE VEHICUL";
        case 'delradius': return "STERGE VEHICULE (RAZA)";
        case 'delall_timed': return "STERGE VEHICULE (TIMP)";
        case 'create_biz': return `CREAZA AFACERE (${modal.bizType})`;
        case 'delete_afacere': return "STERGE AFACERE";
        case 'create_clan': return "CREAZA CLAN";
        case 'create_gang': return "CREAZA GANG";
        case 'create_mafia': return "CREAZA MAFIE";
        case 'create_garage_input': return "CREAZA GARAJ";
        case 'create_biz_point_confirm': return `ADAUGA PUNCT INTERACTIUNE (${modal.bizType})`;
        case 'player_coords': return "COORDONATELE TALE";
        case 'givecar_input': return `GIVE CAR (${modal.carType})`;
        case 'shows_coords': return "COORDONATE ITEM";
        case 'delete_clan': return "STERGE CLAN";
        case 'add_org_safe': return "ADAUGA SEIF ORG";
        case 'add_org_garage': return "ADAUGA GARAJ ORG";
        case 'del_org_safe': return "STERGE SEIF ORG";
        case 'del_org_garage': return "STERGE GARAJ ORG";
        default: return type?.replace(/_/g, ' ').toUpperCase() || "";
    }
  };

  const renderModalContent = () => {
    const { type, step } = modal;
    const inputBase: any = { padding: '2vh', background: '#151515', border: `1px solid ${colors.border}`, borderRadius: '6px', color: 'white', outline: 'none', fontSize: '1.2vw', width: '100%', textAlign: 'center' };
    
    if (type === 'delete_afacere') {
      return (
        <div style={{ background: colors.overlay, padding: '4vh', borderRadius: '12px', border: `1px solid ${colors.accent}`, boxShadow: '0 0 40px rgba(0,0,0,0.5)', width: '30vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>STERGE AFACERE</div>
          <div style={{ color: '#aaa', marginBottom: '2vh', textAlign: 'center' }}>Introdu index-ul afacerii pentru stergere:</div>
          <input ref={inputRef as any} style={inputBase} placeholder="INDEX AFACERE" value={modal.id} onChange={e => setModal({...modal, id: e.target.value})} />
          <div style={{ fontSize: '0.8vw', color: colors.accent, marginTop: '2vh' }}>ENTER: STERGE / ESC: ANULEAZA</div>
        </div>
      );
    }

    if (['add_org_safe', 'add_org_garage', 'del_org_safe', 'del_org_garage'].includes(type as string)) {
        const orgs = activeList.data.filter(item => item.type === modal.targetOrg || (modal.targetOrg === 'clanuri' && item.type === 'clanuri'));
        const pageSize = 20;
        const orgPages = Math.ceil(orgs.length / pageSize) || 1;

        if (step === 0) {
            const pageOrgs = orgs.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'center', width: '30vw' }}>
                    <div style={{ fontSize: '1.4vw', fontWeight: '800', color: colors.accent }}>SELECTEAZA ORGANIZATIA</div>
                    <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '1vh', maxHeight: '40vh', overflowY: 'auto', background: '#1a1a1a', padding: '1.5vh', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                        {pageOrgs.length > 0 ? pageOrgs.map((org, idx) => (
                            <div key={idx} onClick={() => setModal({...modal, id: org.id})} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.8vw', 
                                padding: '1.2vh 1.2vw', 
                                background: modal.id == org.id ? colors.accent : 'rgba(255,255,255,0.03)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                width: '100%',
                                border: `1px solid ${modal.id == org.id ? 'white' : 'transparent'}`,
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ width: '1.2vw', height: '1.2vw', borderRadius: '50%', border: `1px solid ${modal.id == org.id ? 'white' : '#555'}`, background: modal.id == org.id ? 'white' : 'transparent', flexShrink: 0 }} />
                                <span style={{ fontSize: '1vw', fontWeight: 700, color: modal.id == org.id ? 'black' : '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{org.info || org.name} (#{org.id})</span>
                            </div>
                        )) : (
                            <div style={{ width: '100%', textAlign: 'center', color: '#555', padding: '2vh' }}>Daca lista e goala, deschide lista din meniu (CREAZA/LISTA).</div>
                        )}
                    </div>
                    {orgPages > 1 && (
                        <div style={{ display: 'flex', gap: '1vw', alignItems: 'center' }}>
                            <button disabled={currentPage === 0} onClick={(e) => { e.stopPropagation(); setCurrentPage(p => p - 1); }} style={{ background: '#333', border: 'none', padding: '0.5vh 1.5vw', borderRadius: '4px', color: 'white', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', fontWeight: 900 }}>{"<"}</button>
                            <span style={{ fontSize: '1vw', fontWeight: 700 }}>{currentPage + 1} / {orgPages}</span>
                            <button disabled={currentPage >= orgPages - 1} onClick={(e) => { e.stopPropagation(); setCurrentPage(p => p + 1); }} style={{ background: '#333', border: 'none', padding: '0.5vh 1.5vw', borderRadius: '4px', color: 'white', cursor: currentPage >= orgPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 900 }}>{">"}</button>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '1vw', width: '100%', marginTop: '2vh' }}>
                        <button onClick={() => { if (modal.id) setModal({...modal, step: 1}); }} style={{ flex: 1, background: colors.success, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', opacity: modal.id ? 1 : 0.5 }}>CONTINUA</button>
                        <button onClick={resetModal} style={{ flex: 1, background: colors.danger, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>ANULEAZA</button>
                    </div>
                </div>
            );
        }
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3vh', alignItems: 'center', padding: '2vh', width: '30vw' }}>
                <div style={{ fontSize: '1.8vw', fontWeight: '900', color: colors.accent, textAlign: 'center' }}>{(type || '').replace(/_/g, ' ').toUpperCase()}</div>
                <div style={{ fontSize: '1.2vw', color: '#ccc', textAlign: 'center' }}>Esti sigur ca vrei sa {(type || '').startsWith('add') ? 'ADAUGI' : 'STERGI'} {(type || '').includes('safe') ? 'SEIFUL' : 'GARAJUL'} pentru organizatia <b>{modal.id}</b> la locatia ta actuala?</div>
                <div style={{ display: 'flex', gap: '1vw', width: '100%' }}>
                    <button onClick={submitModal} style={{ flex: 1, background: colors.success, color: 'white', border: 'none', padding: '1.8vh', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1vw' }}>CONFIRMA</button>
                    <button onClick={() => setModal({...modal, step: 0})} style={{ flex: 1, background: colors.danger, color: 'white', border: 'none', padding: '1.8vh', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1vw' }}>INAPOI</button>
                </div>
            </div>
        );
    }

    if (type === 'adm_rankuri' || type === 'adm_membri') {
        const titleTarget = type === 'adm_rankuri' ? `ADM RANKURI - ${modal.extraId || modal.targetOrg.toUpperCase()}` : `ADM MEMBRI - ${modal.extraId || modal.targetOrg.toUpperCase()}`;
        
        // Selection step for clans/gangs/mafias
        if (['clanuri', 'mafie', 'gang'].includes(modal.targetOrg) && modal.step === 0) {
            const orgTitle = modal.targetOrg === 'clanuri' ? 'CLANUL' : (modal.targetOrg === 'mafie' ? 'MAFIA' : 'GANGUL');
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'center', padding: '4vh' }}>
                    <div style={{ fontSize: '1.8vw', fontWeight: '800', color: colors.accent }}>SELECTEAZA {orgTitle}</div>
                    <select 
                        value={modal.extraId} 
                        onChange={(e) => setModal({...modal, extraId: e.target.value})}
                        style={{ ...inputBase, textAlign: 'left', appearance: 'auto', background: '#1a1a1a', cursor: 'pointer' }}
                    >
                        <option value="">Alege o organizatie...</option>
                        {activeList.data.filter(item => item.type === modal.targetOrg || (modal.targetOrg === 'clanuri' && item.type === 'clanuri')).map((item, idx) => (
                            <option key={idx} value={item.id}>{item.info} (#{item.id})</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => {
                            if (modal.extraId) {
                                setModal({...modal, step: 1});
                                if ((window as any).mp) {
                                    (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org: modal.targetOrg, clanId: modal.extraId}));
                                }
                            }
                        }}
                        style={{ background: colors.accent, color: 'black', border: 'none', padding: '1.5vh 3vw', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', opacity: modal.extraId ? 1 : 0.5 }}
                    >
                        CONTINUA
                    </button>
                    <div style={{ fontSize: '0.8vw', color: '#666', marginTop: '2vh' }}>* Daca lista e goala, deschide intai lista corespunzatoare din meniu.</div>
                </div>
            );
        }

        // Rank selection step for members
        if (type === 'adm_membri' && modal.step === 1) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.4vw', fontWeight: '800', color: colors.accent }}>RANKURI {modal.extraId?.toUpperCase() || modal.targetOrg?.toUpperCase()}</div>
                        {['clanuri', 'mafie', 'gang'].includes(modal.targetOrg) && <button onClick={() => setModal({...modal, step: 0})} style={{ background: '#333', border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>SCHIMBA CLAN</button>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
                        {ranksList.length > 0 ? ranksList.map((rank, idx) => (
                            <div key={idx} onClick={() => {
                                setModal({...modal, step: 2, id: rank.id.toString()});
                                if ((window as any).mp) (window as any).mp.trigger('client:adminAction', 'get_org_members', JSON.stringify({org: modal.targetOrg, clanId: modal.extraId, rankId: rank.id}));
                            }} style={{ background: 'rgba(255,255,255,0.03)', padding: '2vh', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', border: `1px solid ${colors.border}` }} className="list-row">
                                <span style={{ fontWeight: '800' }}>{rank.name}</span>
                                <span style={{ color: colors.accent }}># {rank.id}</span>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '4vh', color: '#555' }}>Nu exista rankuri configurate.</div>
                        )}
                    </div>
                </div>
            );
        }

        // Member list view
        if (type === 'adm_membri' && modal.step === 2) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.4vw', fontWeight: '800', color: colors.accent }}>MEMBRI {modal.extraId?.toUpperCase() || modal.targetOrg?.toUpperCase()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1vh', marginBottom: '1vh' }}>
                        <button onClick={() => setModal({...modal, type: 'adm_membri', step: 1})} style={{ background: colors.info, border: 'none', padding: '1.2vh 2vw', borderRadius: '4px', color: 'white', fontWeight: '900', cursor: 'pointer' }}>INAPOI LA RANKURI</button>
                        <button onClick={() => setModal({...modal, type: 'add_org_member', id: '', rankId: '', vaultAccess: false})} style={{ background: colors.success, border: 'none', padding: '1.2vh 2vw', borderRadius: '4px', color: 'white', fontWeight: '900', cursor: 'pointer' }}>ADAUGA MEMBRU</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: colors.accent, borderBottom: `1px solid ${colors.border}` }}>
                                <th style={{ padding: '1vh' }}>ID</th>
                                <th style={{ padding: '1vh' }}>NUME</th>
                                <th style={{ padding: '1vh' }}>RANK</th>
                                <th style={{ padding: '1vh', textAlign: 'right' }}>ACTIUNI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {membersList.length > 0 ? membersList.map((m, idx) => (
                                <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }} className="list-row">
                                    <td style={{ padding: '1.5vh 1vh', fontWeight: '800' }}>#{m.id}</td>
                                    <td style={{ padding: '1.5vh 1vh' }}>{m.name}</td>
                                    <td style={{ padding: '1.5vh 1vh' }}>{m.rankName}</td>
                                    <td style={{ padding: '1.5vh 1vh', textAlign: 'right', display: 'flex', gap: '0.5vw', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setModal({...modal, type: 'update_org_member', id: m.id.toString(), rankId: m.rankId, vaultAccess: m.vaultAccess})} style={{ background: colors.info, border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>EDIT</button>
                                        <button onClick={() => setModal({...modal, type: 'confirm_org_member_delete', targetItem: m, id: m.id.toString(), reason: ''})} style={{ background: colors.danger, border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>STERGE</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '4vh', color: '#555' }}>Nu exista membri.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Rank list view (for adm_rankuri)
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.4vw', fontWeight: '800', color: colors.accent }}>LISTA RANKURI</div>
                    <div style={{ display: 'flex', gap: '1vh' }}>
                        {['clanuri', 'mafie', 'gang'].includes(modal.targetOrg) && <button onClick={() => setModal({...modal, step: 0})} style={{ background: '#333', border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>SCHIMBA CLAN</button>}
                        <button onClick={() => setModal({...modal, type: 'add_org_rank', step: 0, name: '', salary: '', vaultAccess: false})} style={{ background: colors.success, border: 'none', padding: '1vh 1.5vw', fontSize: '0.9vw', fontWeight: '900', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>ADAUGA RANK</button>
                    </div>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1vh' }}>
                    {ranksList.length > 0 ? ranksList.map((rank, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '2vh', borderRadius: '8px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="list-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw' }}>
                                <div style={{ color: colors.accent, fontSize: '1.2vw', fontWeight: '900' }}>#{rank.id}</div>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '1.1vw' }}>{rank.name}</div>
                                    <div style={{ fontSize: '0.7vw', color: '#777' }}>Salariu: ${rank.salary?.toLocaleString() || 0} | Acces Seif: {rank.vaultAccess ? 'DA' : 'NU'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5vw' }}>
                                <button onClick={() => setModal({...modal, type: 'update_org_rank', rankId: rank.id.toString(), name: rank.name, salary: rank.salary.toString(), vaultAccess: rank.vaultAccess})} style={{ background: colors.info, border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>EDIT</button>
                                <button onClick={() => {
                                    setModal({...modal, type: 'confirm_org_rank_delete', targetItem: rank, id: rank.id.toString(), reason: ''});
                                }} style={{ background: colors.danger, border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>STERGE</button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '8vh', textAlign: 'center', color: '#555', fontWeight: '800', border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>
                            NU EXISTA RANKURI CONFIGURATE PENTRU ACEASTA ORGANIZATIE.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (type === 'add_org_rank' || type === 'update_org_rank') {
        const isEdit = type === 'update_org_rank';
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', width: '30vw' }}>
                <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh', textAlign: 'center' }}>{isEdit ? 'EDITARE RANK' : 'ADAUGA RANK'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontSize: '0.8vw', fontWeight: 700 }}>NUME RANK</label>
                    {/* @ts-ignore */}
                    <input ref={inputRef} style={inputBase} value={modal.name} onChange={e => setModal({...modal, name: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontSize: '0.8vw', fontWeight: 700 }}>SALARIU</label>
                    <input style={inputBase} value={modal.salary} onChange={e => setModal({...modal, salary: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '1vh', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5vh', borderRadius: '4px' }}>
                    <input type="checkbox" checked={modal.vaultAccess} onChange={e => setModal({...modal, vaultAccess: e.target.checked})} style={{ width: '1.5vw', height: '1.5vw' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9vw' }}>ACCES SEIF?</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', marginTop: '1vh' }}>
                    <button onClick={() => {
                        if (modal.name && modal.salary) {
                            submitModal();
                        }
                    }} style={{ flex: 1, background: colors.success, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>SALVEAZA</button>
                    <button onClick={() => setModal({...modal, type: 'adm_rankuri'})} style={{ flex: 1, background: colors.danger, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>ANULEAZA</button>
                </div>
            </div>
        );
    }

    if (type === 'org_marker_clan_input') {
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>MARKERS - {modal.action?.toUpperCase().replace('_', ' ')}</div>
            <div style={{ color: '#888', fontWeight: 700 }}>INTRODU NUME ORGANIZATIE / CLAN</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={inputBase} placeholder="NUME ORGANIZATIE" value={modal.extraId} onChange={e => setModal({...modal, extraId: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent, marginTop: '2vh' }}>ENTER: EXECUTA / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'whitelist_input') {
        const labels = ["NUME JUCATOR", "SERIAL"];
        const keys = ['name', 'id'];
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', width: '30vw' }}>
                <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh', textAlign: 'center' }}>{modal.action === 'add' ? 'ADAUGA' : 'EDITARE'} WHITELIST</div>
                <div style={{ color: '#888', fontWeight: 700, textAlign: 'center' }}>{labels[step]}</div>
                {/* @ts-ignore */}
                <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder={`INTRODU ${labels[step]}`} value={(modal as any)[keys[step]]} onChange={e => setModal({...modal, [keys[step]]: e.target.value})} />
                <div style={{ display: 'flex', gap: '1vw', marginTop: '1vh' }}>
                    <button onClick={handleModalNext} style={{ flex: 1, background: colors.success, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>{step === 1 ? 'SALVEAZA' : 'URMATORUL'}</button>
                    <button onClick={resetModal} style={{ flex: 1, background: colors.danger, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>ANULEAZA</button>
                </div>
            </div>
        )
    }

    if (type === 'add_org_member') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', width: '30vw' }}>
                <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh', textAlign: 'center' }}>ADAUGA MEMBRU</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontSize: '0.8vw', fontWeight: 700 }}>ID JUCATOR (FixID / UID)</label>
                    {/* @ts-ignore */}
                    <input ref={inputRef} style={inputBase} value={modal.id} onChange={e => setModal({...modal, id: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontSize: '0.8vw', fontWeight: 700 }}>SELECTEAZA RANK</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5vw', maxHeight: '15vh', overflowY: 'auto', background: '#1a1a1a', padding: '1vh', borderRadius: '4px', border: `1px solid ${colors.border}` }}>
                        {(ranksList || []).map((rank, idx) => (
                            <div key={idx} onClick={() => setModal({...modal, rankId: rank.id})} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5vw', 
                                padding: '0.8vh 1vw', 
                                background: modal.rankId == rank.id ? colors.accent : 'rgba(255,255,255,0.03)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                minWidth: '45%',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', border: `1px solid ${modal.rankId == rank.id ? 'white' : '#555'}`, background: modal.rankId == rank.id ? 'white' : 'transparent', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.75vw', fontWeight: 600, color: modal.rankId == rank.id ? 'white' : '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rank.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1vh', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5vh', borderRadius: '4px' }}>
                    <input type="checkbox" checked={modal.vaultAccess} onChange={e => setModal({...modal, vaultAccess: e.target.checked})} style={{ width: '1.5vw', height: '1.5vw' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9vw' }}>ACCES SEIF?</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', marginTop: '1vh' }}>
                    <button onClick={() => {
                        if (modal.id && modal.rankId) {
                            submitModal();
                        }
                    }} style={{ flex: 1, background: colors.success, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', opacity: (modal.id && modal.rankId) ? 1 : 0.5 }}>ADAUGA</button>
                    <button onClick={() => setModal({...modal, type: 'adm_membri'})} style={{ flex: 1, background: colors.danger, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>ANULEAZA</button>
                </div>
            </div>
        );
    }

    if (type === 'update_org_member') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', width: '30vw' }}>
                <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh', textAlign: 'center' }}>EDITARE MEMBRU #{modal.id}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontSize: '0.8vw', fontWeight: 700 }}>SELECTEAZA RANK NOU</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5vw', maxHeight: '15vh', overflowY: 'auto', background: '#1a1a1a', padding: '1vh', borderRadius: '4px', border: `1px solid ${colors.border}` }}>
                        {(ranksList || []).map((rank, idx) => (
                            <div key={idx} onClick={() => setModal({...modal, rankId: rank.id})} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5vw', 
                                padding: '0.8vh 1vw', 
                                background: modal.rankId == rank.id ? colors.accent : 'rgba(255,255,255,0.03)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                minWidth: '45%',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', border: `1px solid ${modal.rankId == rank.id ? 'white' : '#555'}`, background: modal.rankId == rank.id ? 'white' : 'transparent', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.75vw', fontWeight: 600, color: modal.rankId == rank.id ? 'white' : '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rank.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1vh', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5vh', borderRadius: '4px' }}>
                    <input type="checkbox" checked={modal.vaultAccess} onChange={e => setModal({...modal, vaultAccess: e.target.checked})} style={{ width: '1.5vw', height: '1.5vw' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9vw' }}>ACCES SEIF?</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', marginTop: '1vh' }}>
                    <button onClick={() => {
                        submitModal();
                    }} style={{ flex: 1, background: colors.success, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>SALVEAZA</button>
                    <button onClick={() => setModal({...modal, type: 'adm_membri'})} style={{ flex: 1, background: colors.danger, color: 'white', border: 'none', padding: '1.5vh', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>ANULEAZA</button>
                </div>
            </div>
        );
    }

    if (type === 'create_biz_point_confirm') {
      return (
        <div style={{ background: colors.overlay, padding: '4vh', borderRadius: '12px', border: `1px solid ${colors.accent}`, boxShadow: '0 0 40px rgba(0,0,0,0.5)', width: '30vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>{getModalTitle()}</div>
          <div style={{ color: '#aaa', marginBottom: '2vh', textAlign: 'center' }}>Vei adauga un punct de interactiune pentru tipul <b>{modal.bizType}</b> la coordonatele tale actuale.</div>
          <div style={{ fontSize: '0.8vw', color: colors.accent, marginTop: '2vh' }}>ENTER: CONFIRMA / ESC: ANULEAZA</div>
        </div>
      );
    }

    if (type === 'show_coords' || type === 'player_coords') return (
        <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>{getModalTitle()}</div>
        <div style={{ ...inputBase, cursor: 'pointer', fontSize: '1.5vw' }} onClick={() => copyToClipboard(modal.coords)}>{modal.coords}</div>
        <div style={{ fontSize: '0.8vw', color: colors.accent }}>CLICK PE TEXT PENTRU A COPIA / ESC: INCHIDE</div></>
    );

    if (type === 'givecar_input') {
        const labels = ["ID JUCATOR", "MODEL MASINA"];
        const keys = ['id', 'name'];
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>{getModalTitle()}</div>
            <div style={{ color: '#888', fontWeight: 700 }}>{labels[step]}</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder={`INTRODU ${labels[step]}`} value={(modal as any)[keys[step]]} onChange={e => setModal({...modal, [keys[step]]: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: URMATORUL / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'giveitem_input') {
        const labels = ["ID JUCATOR", "NUME OBIECT", "CANTITATE"];
        const keys = ['id', 'name', 'price'];
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>GIVE ITEM</div>
            <div style={{ color: '#888', fontWeight: 700 }}>{labels[step]}</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder={`INTRODU ${labels[step]}`} value={(modal as any)[keys[step]]} onChange={e => setModal({...modal, [keys[step]]: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: URMATORUL / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'givemoney_input') {
        const labels = ["ID JUCATOR", `SUMA (${modal.moneyType})` ];
        const keys = ['id', 'price'];
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>GIVE MONEY</div>
            <div style={{ color: '#888', fontWeight: 700 }}>{labels[step]}</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder={`INTRODU ${labels[step]}`} value={(modal as any)[keys[step]]} onChange={e => setModal({...modal, [keys[step]]: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: URMATORUL / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'giveskin_input') {
        const labels = ["ID JUCATOR", "MODEL SKIN"];
        const keys = ['id', 'name'];
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>GIVE SKIN</div>
            <div style={{ color: '#888', fontWeight: 700 }}>{labels[step]}</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder={`INTRODU ${labels[step]}`} value={(modal as any)[keys[step]]} onChange={e => setModal({...modal, [keys[step]]: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: URMATORUL / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'edit_house') {
        const isForSale = modal.houseStatus === 'LA VANZARE';
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh', textAlign: 'center' }}>EDITARE CASA #{modal.targetItem?.id}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontSize: '0.8vw' }}>NUME CASA</label>
                    {/* @ts-ignore */}
                    <input ref={inputRef} style={inputBase} value={modal.name} onChange={e => setModal({...modal, name: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontSize: '0.8vw' }}>STATUS (LA VANZARE / ID PROPRIETAR)</label>
                    <input style={inputBase} placeholder={isForSale ? "LA VANZARE" : "ID PROPRIETAR"} value={modal.id} onChange={e => setModal({...modal, id: e.target.value})} />
                </div>
                {isForSale && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                        <label style={{ color: '#888', fontSize: '0.8vw' }}>PRET CASA</label>
                        <input style={inputBase} value={modal.price} onChange={e => setModal({...modal, price: e.target.value})} />
                    </div>
                )}
                <div style={{ fontSize: '0.8vw', color: colors.accent, textAlign: 'center' }}>ENTER: SALVEAZA / ESC: ANULEAZA</div>
            </div>
        );
    }

    if (type === 'edit_item') {
        const isGarage = activeList.title.includes("GARAJE") || modal.targetItem?.type === 'garage';
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                <div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh', textAlign: 'center' }}>EDITARE #{modal.targetItem?.id}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    <label style={{ color: '#888', fontWeight: 700, fontSize: '0.8vw', textTransform: 'uppercase' }}>Denumire Nouă</label>
                    {/* @ts-ignore */}
                    <input ref={inputRef} style={inputBase} placeholder={modal.targetItem?.info} value={modal.name} onChange={e => setModal({...modal, name: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh', opacity: isGarage ? 0.5 : 1 }}>
                    <label style={{ color: '#888', fontWeight: 700, fontSize: '0.8vw', textTransform: 'uppercase' }}>ID Proprietar Nou {isGarage && "(BLOCAT)"}</label>
                    <div style={{ fontSize: '0.7vw', color: colors.accentLow, marginBottom: '0.2vh' }}>Proprietar actual: {modal.targetItem?.owner}</div>
                    <input style={{ ...inputBase, cursor: isGarage ? 'not-allowed' : 'text' }} placeholder={isGarage ? "SERVER" : (modal.targetItem?.ownerId || "ID JUCATOR")} value={isGarage ? '' : modal.id} readOnly={isGarage} onChange={e => !isGarage && setModal({...modal, id: e.target.value})} />
                </div>
                <div style={{ fontSize: '0.8vw', color: colors.accent, textAlign: 'center', marginTop: '1vh' }}>ENTER: SALVEAZA MODIFICARILE / ESC: ANULEAZA</div>
            </div>
        );
    }

    if (type === 'create_house_input') {
        const placeholders = modal.houseStatus === 'LA VANZARE' 
            ? ["ID CASA", "NUME CASA", "PRET"] 
            : ["ID PROPRIETAR", "ID CASA", "NUME CASA", "PRET"];
        const currentVal = modal.houseStatus === 'LA VANZARE' ? ['id', 'name', 'price'][step] : ['id', 'extraId', 'name', 'price'][step];
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>CREAZA CASA ({modal.houseType})</div>
            {lastHouseId > 0 && <div style={{ fontSize: '1vw', color: colors.success, marginBottom: '1vh', fontWeight: '800' }}>ULTIMA CASA CREATA ARE ID: {lastHouseId}</div>}
            <div style={{ color: '#888', fontWeight: 700 }}>{placeholders[step]}</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder={`INTRODU ${placeholders[step]}`} value={(modal as any)[currentVal]} onChange={e => {
                const keys = modal.houseStatus === 'LA VANZARE' ? ['id', 'name', 'price'] : ['id', 'extraId', 'name', 'price'];
                const key = keys[step];
                const val = e.target.value;
                setModal(p => ({...p, [key]: val}));
            }} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: URMATORUL / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'notify_player') {
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>NOTIFICARE</div>
            <div style={{ color: '#888', fontWeight: 700 }}>{step === 0 ? "ID JUCATOR" : "MESAJ NOTIFICARE"}</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.2vw'}} placeholder={step === 0 ? "ID" : "SCRIE MESAJUL..."} value={(modal as any)[step === 0 ? 'id' : 'reason']} onChange={e => setModal({...modal, [step === 0 ? 'id' : 'reason']: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: URMATORUL / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'global_announcement') {
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>ANUNT GLOBAL</div>
            <div style={{ color: '#888', fontWeight: 700 }}>MESAJ ANUNT GLOBAL</div>
            {/* @ts-ignore */}
            <textarea ref={inputRef} style={{...inputBase, height: '15vh', textAlign: 'left'}} placeholder="SCRIE ANUNTUL AICI..." value={modal.reason} onChange={e => setModal({...modal, reason: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: TRIMITE ANUNTUL / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'ban_input') {
        const isPerm = modal.isPermanent;
        let placeholders = ["ID JUCATOR", "MOTIV BAN"];
        let keys = ['id', 'reason'];
        if (!isPerm) {
           placeholders = ["ID JUCATOR", "DURATA (EX: 1zi, 7zile, 1luna)", "MOTIV BAN"];
           keys = ['id', 'time', 'reason'];
        }
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>{getModalTitle()}</div>
            <div style={{ color: '#888', fontWeight: 700 }}>{placeholders[step]}</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder={`INTRODU ${placeholders[step]}`} value={(modal as any)[keys[step]]} onChange={e => setModal({...modal, [keys[step]]: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: {step === placeholders.length - 1 ? "CONFIRMA" : "URMATORUL"} / ESC: ANULEAZA</div></>
        );
    }

    if (type === 'confirm_delete' || type === 'confirm_org_rank_delete' || type === 'confirm_org_member_delete') return (
        <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.danger, marginBottom: '1vh' }}>CONFIRMA STERGEREA</div>
        <div style={{ color: '#888', textAlign: 'center' }}>Scrie "STERGE" pentru a confirma eliminarea {type === 'confirm_org_member_delete' ? `membrului ${modal.targetItem?.name}` : (type === 'confirm_org_rank_delete' ? `rankului ${modal.targetItem?.name}` : (modal.targetItem?.type === 'whitelist' ? `serialului ${modal.targetItem?.id} (${modal.targetItem?.info})` : `obiectului #${modal.targetItem?.id}`))}</div>
        {/* @ts-ignore */}
        <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder="STERGE" value={modal.reason} onChange={e => setModal({...modal, reason: e.target.value})} />
        <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: CONFIRMA / ESC: ANULEAZA</div></>
    );

    if (['delete_clan', 'delete_mafie', 'delete_gang'].includes(type as string)) {
        return (
            <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.danger, marginBottom: '1vh' }}>STERGE {(type || '').split('_').pop()?.toUpperCase()}</div>
            <div style={{ color: '#888', fontWeight: 700 }}>SCRIE 'STERGE' PENTRU CONFIRMARE</div>
            {/* @ts-ignore */}
            <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder="STERGE" value={modal.reason} onChange={e => setModal({...modal, reason: e.target.value})} />
            <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: CONFIRMA / ESC: ANULEAZA</div></>
        );
    }

    if (type?.startsWith('delete_')) return (
        <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.danger, marginBottom: '1vh' }}>STERGE {(type || '').split('_').pop()?.toUpperCase()}</div>
        {/* @ts-ignore */}
        <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder="INTRODU ID" value={modal.id} onChange={e => setModal({...modal, id: e.target.value})} />
        <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: CONFIRMA / ESC: ANULEAZA</div></>
    );

    const getStepLabel = () => {
        if (type === 'tp_to_coords') return "COORDONATE (X Y Z)";
        if (type === 'tp_here' || type === 'tp_to_player' || type === 'notify_player') return "ID JUCATOR";
        if (type === 'global_announcement') return "MESAJ ANUNT";
        if (type === 'giveskin_input' || type === 'givecar_input') return step === 0 ? "ID JUCATOR" : (type === 'giveskin_input' ? "MODEL SKIN" : "MODEL MASINA");
        if (type === 'giveitem_input') return ["ID JUCATOR", "NUME OBIECT", "CANTITATE"][step];
        if (type === 'givemoney_input') return step === 0 ? "ID JUCATOR" : "SUMA";
        if (type === 'delradius') return "RAZA (METRI)";
        if (type === 'delall_timed') return "TIMP (MINUTE)";
        if (type === 'fix_vehicle_input') return "ID JUCATOR (GOL PT AUTO-FIX)";
        if (['warn', 'kick', 'freeze', 'unfreeze'].includes(type as string)) {
            return step === 0 ? "ID JUCATOR" : "MOTIV";
        }
        if (['delete_clan', 'delete_mafie', 'delete_gang'].includes(type as string)) {
            return step === 0 ? "NUME ORGANIZATIE" : "SCRIE 'STERGE' PENTRU CONFIRMARE";
        }
        if (type === 'create_biz') {
            if (step === 0) return "NUME AFACERE";
            if (step === 1) return "ID AFACERE (EX: 1, 2, 3)";
            if (step === 2) return "PRET AFACERE";
            if (step === 3) return "ID PROPRIETAR (GOL DACA E LA VANZARE)";
            return "CAT % SE CUVINE PROPRIETARULUI?";
        }
        if (type === 'create_clan') return ["NUME CLAN", "NUME VIZUAL CLAN", "ID JUCATOR LIDER"][step];
        if (type === 'edit_clan_info') return ["NUME CLAN", "NUME VIZUAL CLAN"][step];
        if (type === 'create_gang') return ["NUME GANG", "NUME VIZUAL GANG", "ID JUCATOR LIDER"][step];
        if (type === 'create_mafia') return ["NUME MAFIE", "NUME VIZUAL MAFIE", "ID JUCATOR LIDER"][step];
        if (type === 'create_garage_input') return step === 0 ? "ID GARAJ" : "NUME GARAJ";
        return `PAS ${step + 1}`;
    };

    const keys = ['id', 'name', 'extraId', 'reason', 'time'];
    let currentKey = keys[step];
    if (type === 'create_garage_input') currentKey = ['id', 'name'][step];
    else if (type === 'create_biz') currentKey = ['name', 'extraId', 'price', 'id', 'profitPercent'][step];
    else if (['create_clan', 'create_gang', 'create_mafia'].includes(type as string)) currentKey = ['name', 'visualname', 'id'][step];
    else if (type === 'edit_clan_info') currentKey = ['name', 'visualname'][step];
    else if (type === 'create_house_input') currentKey = ['id', 'name', 'extraId'][step];
    else if (['giveitem_input', 'givecar_input', 'giveskin_input'].includes(type as string)) currentKey = ['id', 'name', 'price'][step];
    else if (['givemoney_input'].includes(type as string)) currentKey = ['id', 'price'][step];
    else if (['warn', 'kick', 'freeze', 'unfreeze', 'fix_vehicle_input', 'notify_player', 'delete_clan', 'delete_mafie', 'delete_gang'].includes(type as string)) currentKey = ['id', 'reason'][step];
    else if (type === 'global_announcement') currentKey = 'reason';
    else if (type === 'ban_input' && modal.isPermanent) currentKey = ['id', 'reason'][step];
    else if (type === 'ban_input' && !modal.isPermanent) currentKey = ['id', 'time', 'reason'][step];
    
    return (
        <><div style={{ fontSize: '2.2vw', fontWeight: '900', color: colors.accent, marginBottom: '1vh' }}>{getModalTitle()}</div>
        <div style={{ color: '#888', fontWeight: 700 }}>{getStepLabel()}</div>
        {/* @ts-ignore */}
        <input ref={inputRef} style={{...inputBase, fontSize: '1.5vw'}} placeholder="INTRODU DATELE" value={(modal as any)[currentKey] || ''} onChange={e => {
            setModal({...modal, [currentKey]: e.target.value});
        }} />
        <div style={{ fontSize: '0.8vw', color: colors.accent }}>ENTER: {(['freeze', 'unfreeze', 'fix_vehicle_input', 'delall_timed', 'delradius', 'tp_to_player', 'tp_here', 'tp_to_coords', 'giveskin_input', 'givecar_input'].includes(type as string) && step === 0 || (['create_biz'].includes(type as string) && step === 4) || (['create_clan', 'create_gang', 'create_mafia'].includes(type as string) && step === 2) || (type === 'edit_clan_info' && step === 1) || (['delete_clan', 'delete_mafie', 'delete_gang'].includes(type as string) && step === 1)) ? "CONFIRMA" : "URMATORUL"} / ESC: ANULEAZA</div></>
    );
  };

  const filteredData = activeList.data.filter(item => 
    item.id.toString().includes(searchTerm) || 
    item.info.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  useEffect(() => { setCurrentPage(0); }, [searchTerm]);

  if (!isOpen && !activeList.visible && !modal.type) return null;

  const lvl = adminLevel;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', fontFamily: 'Rajdhani', color: 'white', overflow: 'hidden', zIndex: 9000, pointerEvents: 'none' }}>
      
      {activeList.visible && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: colors.overlay, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9008, pointerEvents: 'all' }}
          >
              <div style={{ width: isMaximized ? '95vw' : '55vw', height: isMaximized ? '95vh' : '80vh', backgroundColor: 'rgba(12, 12, 12, 0.98)', border: `1px solid ${colors.border}`, borderRadius: isMaximized ? '0' : '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'scaleUp 0.25s ease', transition: 'width 0.3s ease, height 0.3s ease' }}>
                  <div style={{ padding: '2.5vh 3vh', borderBottom: `2px solid ${colors.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ fontSize: isMaximized ? '2.2vw' : '1.8vw', fontWeight: '900', letterSpacing: '2px' }}>{activeList.title}</span>
                      <div style={{ display: 'flex', gap: '1vw' }}>
                          {isWhitelistList(activeList.title) && <div onClick={() => setModal({...modal, type: 'whitelist_input', step: 0, action: 'add', name: '', id: ''})} style={{ cursor: 'pointer', background: colors.success, padding: '0.6vh 1.5vw', borderRadius: '4px', fontSize: '0.8vw', fontWeight: '800' }}>ADD NEW</div>}
                          <div onClick={() => setIsMaximized(!isMaximized)} style={{ cursor: 'pointer', background: colors.info, padding: '0.6vh 1vw', borderRadius: '4px', fontSize: '0.8vw', fontWeight: '800' }}>{isMaximized ? 'RESTORE' : 'MAXIMIZE'}</div>
                          <div onClick={closeActiveList} style={{ cursor: 'pointer', background: colors.danger, padding: '0.6vh 1vw', borderRadius: '4px', fontSize: '0.8vw', fontWeight: '800' }}>INCHIDE (ESC)</div>
                      </div>
                  </div>
                  <div style={{ padding: '1.5vh 3vh', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '1vw' }}>
                    <div style={{ color: colors.accent, fontWeight: '900', fontSize: '0.9vw' }}>CAUTARE:</div>
                    <input type="text" placeholder="ID / NUME / PROPRIETAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.border}`, borderRadius: '4px', padding: '1vh 1.5vh', color: 'white', outline: 'none', fontFamily: 'Rajdhani', fontSize: '1vw' }} />
                  </div>
                  <div style={{ flex: 1, padding: '1.5vh', overflowX: 'hidden', overflowY: 'auto' }} className="fine-scrollbar">
                      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                          <thead>
                              {['CLANURI', 'MAFII', 'GANGURI'].some(t => activeList.title.includes(t)) ? (
                                  <tr style={{ color: colors.accent, fontSize: isMaximized ? '1.1vw' : '0.9vw', textTransform: 'uppercase', textAlign: 'left' }}>
                                      <th style={{ padding: '1vh 2vh' }}>ID</th>
                                      <th style={{ padding: '1vh 2vh' }}>NAME</th>
                                      <th style={{ padding: '1vh 2vh' }}>VISUAL NAME</th>
                                      <th style={{ padding: '1vh 2vh' }}>LIDER [ID] (NAME)</th>
                                      <th style={{ padding: '1vh 2vh', textAlign: 'right' }}>ACTIUNI</th>
                                  </tr>
                              ) : (
                                  <tr style={{ color: colors.accent, fontSize: isMaximized ? '1.1vw' : '0.9vw', textTransform: 'uppercase', textAlign: 'left' }}>
                                      {isWhitelistList(activeList.title) ? (
                                          <th style={{ padding: '1vh 2vh' }}>NUME JUCATOR</th>
                                      ) : (
                                          <>
                                              <th style={{ padding: '1vh 2vh' }}>ID</th>
                                              <th style={{ padding: '1vh 2vh' }}>DETALII</th>
                                              <th style={{ padding: '1vh 2vh' }}>PROPRIETAR</th>
                                          </>
                                      )}
                                      <th style={{ padding: '1vh 2vh', textAlign: 'right' }}>ACTIUNI</th>
                                  </tr>
                              )}
                          </thead>
                          <tbody>
                              {paginatedData.length > 0 ? paginatedData.map((item, idx) => (
                                  <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)', transition: '0.2s' }} className="list-row">
                                      {['CLANURI', 'MAFII', 'GANGURI'].some(t => activeList.title.includes(t)) ? (
                                          <>
                                              <td style={{ padding: '1.5vh 2vh', fontWeight: '900', color: colors.accent, fontSize: isMaximized ? '1.1vw' : '1vw' }}>#{item.numid}</td>
                                              <td style={{ padding: '1.5vh 2vh', fontSize: isMaximized ? '1.1vw' : '1vw' }}>{item.name}</td>
                                              <td style={{ padding: '1.5vh 2vh', fontSize: isMaximized ? '1.1vw' : '1vw' }}>{item.visualname}</td>
                                              <td style={{ padding: '1.5vh 2vh', color: '#888', fontSize: isMaximized ? '1vw' : '0.9vw' }}>[{item.leaderUid}] {item.leader}</td>
                                          </>
                                      ) : (
                                          <>
                                              {isWhitelistList(activeList.title) ? (
                                                  <td style={{ padding: '1.5vh 2vh', fontSize: isMaximized ? '1.1vw' : '1vw' }}>{item.info}</td>
                                              ) : (
                                                  <>
                                                      <td style={{ padding: '1.5vh 2vh', fontWeight: '900', color: colors.accent, fontSize: isMaximized ? '1.1vw' : '1vw' }}>#{item.id}</td>
                                                      <td style={{ padding: '1.5vh 2vh', fontSize: isMaximized ? '1.1vw' : '1vw' }}>{item.info} {item.price > 0 && <span style={{color: colors.success, fontSize: isMaximized ? '0.9vw' : '0.7vw', marginLeft: '0.5vw'}}>(${item.price.toLocaleString()})</span>}</td>
                                                      <td style={{ padding: '1.5vh 2vh', color: '#888', fontSize: isMaximized ? '1vw' : '0.9vw' }}>{item.owner}</td>
                                                  </>
                                              )}
                                          </>
                                      )}
                                      <td style={{ padding: '1.5vh 2vh', textAlign: 'right', display: 'flex', gap: '0.5vw', justifyContent: 'flex-end' }}>
                                          {['CLANURI', 'MAFII', 'GANGURI'].some(t => activeList.title.includes(t)) ? (
                                              <>
                                                  <button onClick={() => setModal({...modal, type: 'edit_clan_info', targetItem: item, name: item.name, visualname: item.visualname})} title="Edit" style={{ background: colors.success }} className="list-action-btn">E</button>
                                                  <button onClick={() => {
                                                      const type = item.type === 'mafie' ? 'mafie' : (item.type === 'gang' ? 'gang' : 'clanuri');
                                                      setModal({...modal, type: 'adm_rankuri', targetOrg: type, extraId: item.name, step: 1});
                                                      if ((window as any).mp) (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org: type, clanId: item.name}));
                                                  }} title="Rankuri" style={{ background: colors.info }} className="list-action-btn">R</button>
                                                  <button onClick={() => {
                                                      const type = item.type === 'mafie' ? 'mafie' : (item.type === 'gang' ? 'gang' : 'clanuri');
                                                      setModal({...modal, type: 'adm_membri', targetOrg: type, extraId: item.name, step: 2});
                                                      if ((window as any).mp) {
                                                          (window as any).mp.trigger('client:adminAction', 'get_org_ranks', JSON.stringify({org: type, clanId: item.name}));
                                                          (window as any).mp.trigger('client:adminAction', 'get_org_members', JSON.stringify({org: type, clanId: item.name}));
                                                      }
                                                  }} title="Membri" style={{ background: colors.accent, color: 'black' }} className="list-action-btn">M</button>
                                                 <button onClick={() => {
                                                          const deleteType = item.type === 'mafie' ? 'delete_mafie' : (item.type === 'gang' ? 'delete_gang' : 'delete_clan');
                                                          setModal({...modal, type: deleteType, targetItem: item, id: item.name, step: 0});
                                                      }} title="Sterge" style={{ background: colors.danger }} className="list-action-btn">S</button>
                                              </>
                                          ) : (
                                              <>
                                                  {item.type !== 'clanuri' && item.type !== 'whitelist' && (
                                              <>
                                                  <button onClick={() => {
                                                      if (item.type === 'house') {
                                                          if ((window as any).mp) (window as any).mp.trigger('client:adminAction', 'tp_to_house', JSON.stringify({id: item.id}));
                                                      } else if (item.type === 'business') {
                                                          if ((window as any).mp) (window as any).mp.trigger('client:adminAction', 'tp_to_biz', JSON.stringify({id: item.id}));
                                                      } else if (item.type === 'garage') {
                                                          if ((window as any).mp) (window as any).mp.trigger('client:adminAction', 'tp_to_garage', JSON.stringify({id: item.id}));
                                                      } else {
                                                          (window as any).mp?.trigger('client:adminTeleport', item.id);
                                                      }
                                                  }} title="Teleport" style={{ background: colors.info }} className="list-action-btn">T</button>
                                                  <button onClick={() => setModal({...modal, type: 'show_coords', coords: item.coords})} title="Coordonate" style={{ background: '#555' }} className="list-action-btn">C</button>
                                              </>
                                          )}
                                          {lvl >= 6 && (
                                              <>
                                                  <button onClick={() => {
                                                      if (item.type === 'house') {
                                                          setModal({...modal, type: 'edit_house', targetItem: item, houseStatus: item.ownerId ? 'PROPRIETAR' : 'LA VANZARE', name: item.info, id: item.ownerUid?.toString() || (item.ownerId ? 'PROPRIETAR' : 'LA VANZARE'), price: item.price.toString()});
                                                      } else if (item.type === 'clanuri') {
                                                          setModal({...modal, type: 'edit_clan_info', targetItem: item, step: 0, name: item.name, visualname: item.visualname});
                                                      } else {
                                                       if (item.type === 'whitelist') {
                                                           setModal({...modal, type: 'whitelist_input', action: 'edit', name: item.info, id: item.id, step: 0});
                                                       } else {
                                                          setModal({...modal, type: 'edit_item', targetItem: item, step: 0, name: item.info, id: item.ownerId?.toString() || ''});
                                                       }
                                                      }
                                                  }} title="Editare" style={{ background: colors.success }} className="list-action-btn">E</button>
                                                  <button onClick={() => setModal({...modal, type: 'confirm_delete', targetItem: item, id: ''})} title="Stergere" style={{ background: colors.danger }} className="list-action-btn">S</button>
                                              </>
                                          )}
                                              </>
                                          )}
                                      </td>
                                  </tr>
                              )) : (
                                <tr>
                                  <td colSpan={4} style={{ textAlign: 'center', padding: '5vh', color: '#555', fontWeight: '700' }}>
                                    {searchTerm ? `NU AM GASIT REZULTATE PENTRU "${searchTerm}"` : (activeList.title.includes("CASE") ? "NU EXISTA NICIO CASA" : "NU EXISTA REZULTATE")}
                                  </td>
                                </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
                  <div style={{ padding: '2vh 3vh', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2vw', background: 'rgba(0,0,0,0.2)' }}>
                      <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} style={{ opacity: currentPage === 0 ? 0.3 : 1, background: colors.accent, border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', color: 'black' }}>{"<"}</button>
                      <span style={{ fontSize: '1vw', fontWeight: '700' }}>PAGINA {currentPage + 1} DIN {totalPages}</span>
                      <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} style={{ opacity: currentPage >= totalPages - 1 ? 0.3 : 1, background: colors.accent, border: 'none', padding: '0.5vh 1vw', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', color: 'black' }}>{">"}</button>
                  </div>
              </div>
          </div>
      )}

      {isOpen && (
        <div style={{ 
            position: 'absolute', 
            right: '8%', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            width: '15vw', 
            height: '46vh', 
            backgroundColor: colors.bg, 
            border: `1px solid ${colors.border}`, 
            borderRadius: '10px', 
            display: 'flex', 
            flexDirection: 'column', 
            zIndex: 9005, 
            pointerEvents: 'all',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)', 
            overflow: 'hidden' 
        }}>
          <div style={{ padding: '2.5vh 1vh', textAlign: 'center', background: 'rgba(242,186,0,0.05)' }}>
            <div style={{ fontSize: '1.4vw', fontWeight: '900', letterSpacing: '2px' }}>MENIU ADMIN</div>
            <div style={{ height: '2px', width: '30%', backgroundColor: colors.accent, margin: '0.8vh auto 0' }} />
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0.8vh' }} className="menu-scroll fine-scrollbar">
            {menuItems.map((item, index) => {
                if (item === 'DIVIDER') return <div key={`div-${index}`} style={{ height: '1px', width: '85%', margin: '1vh auto', background: `linear-gradient(90deg, transparent, ${colors.divider}, transparent)` }} />;
                return (
                    <div key={`${item}-${index}`} ref={el => itemsRefs.current[index] = el} onClick={() => handleSelection(item)} style={{ padding: '1.5vh', fontSize: '1.1vw', fontWeight: '700', backgroundColor: selectedIndex === index ? colors.accent : 'transparent', color: selectedIndex === index ? '#000' : '#bbb', textAlign: 'center', borderRadius: '6px', cursor: 'pointer', marginBottom: '0.1vh', transition: '0.1s', textTransform: 'uppercase' }}>
                        {item}
                    </div>
                );
            })}
          </div>
        </div>
      )}

      {modal.type && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9010, pointerEvents: 'all' }}>
          {isListingModal(modal.type) ? (
              <div style={{ width: isMaximized ? '95vw' : '55vw', height: isMaximized ? '95vh' : '80vh', backgroundColor: 'rgba(12, 12, 12, 0.98)', border: `1px solid ${colors.border}`, borderRadius: isMaximized ? '0' : '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'scaleUp 0.25s ease', transition: 'width 0.3s ease, height 0.3s ease' }}>
                   <div style={{ padding: '2.5vh 3vh', borderBottom: `2px solid ${colors.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                       <span style={{ fontSize: isMaximized ? '2.2vw' : '1.8vw', fontWeight: '900', letterSpacing: '2px' }}>{getModalTitle()}</span>
                       <div style={{ display: 'flex', gap: '1vw' }}>
                           <div onClick={() => setIsMaximized(!isMaximized)} style={{ cursor: 'pointer', background: colors.info, padding: '0.6vh 1vw', borderRadius: '4px', fontSize: '0.8vw', fontWeight: '800' }}>{isMaximized ? 'RESTORE' : 'MAXIMIZE'}</div>
                           <div onClick={resetModal} style={{ cursor: 'pointer', background: colors.danger, padding: '0.6vh 1vw', borderRadius: '4px', fontSize: '0.8vw', fontWeight: '800' }}>INCHIDE (ESC)</div>
                       </div>
                   </div>
                   <div style={{ flex: 1, padding: '3vh', overflowY: 'auto' }}>
                       {renderModalContent()}
                   </div>
              </div>
          ) : (
            <div style={{ backgroundColor: '#0c0c0c', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '4vh', width: '35vw', display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'center', boxShadow: '0 10px 50px rgba(0,0,0,0.8)' }}>
              {renderModalContent()}
            </div>
          )}
        </div>
      )}
 
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700;900&display=swap');
        
        .fine-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .fine-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .fine-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(242, 186, 0, 0.4);
          border-radius: 10px;
        }
        .fine-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(242, 186, 0, 0.7);
        } 
 
        .menu-scroll {
            scrollbar-gutter: stable;
            overflow-x: hidden;
            overscroll-behavior: contain;
        }
  
        .list-action-btn { border: none; color: white; width: 2.2vw; height: 2.2vw; border-radius: 4px; cursor: pointer; font-weight: 900; font-size: 0.9vw; transition: 0.2s; }
        .list-action-btn:hover { filter: brightness(1.2); transform: translateY(-2px); }
        .list-row:hover { background: rgba(255,255,255,0.05) !important; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AdminMenu;
