import React, { useState, useMemo, useEffect } from 'react';
import rpc from 'utils/rpc';
import images from 'utils/images';

// Iconițe SVG definite ca componente pentru a înlocui lucide-react
const Icons = {
  X: ({ size }: { size: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
  ),
  Navigation: ({ size }: { size: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
  ),
  Car: ({ size }: { size: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
  ),
  Zap: ({ size }: { size: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  ChevronRight: ({ size }: { size: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  Package: ({ size }: { size: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></svg>
  ),
  Search: ({ size }: { size: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Star: ({ size, fill, color }: { size: string, fill?: string, color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
};

interface Vehicle {
  id: any;
  name: string;
  category: string;
  img?: string;
  modelKey?: string;
  stage: string;
  isVip: boolean;
  fuel: number;
  km: number;
  expiry: string;
  tax: string;
  isOut?: boolean;
  description: string;
}

const Garage = ({ location }: any) => {
  const vehicles: Vehicle[] = location?.state?.vehicles || [];
  const title = location?.state?.title || 'GARAJ';
  const subTitle = location?.state?.subTitle || 'PERSONAL';
  const type = location?.state?.type || 'civil';
  const inVehicle = location?.state?.inVehicle || false;
  const nearbyVehicleId = location?.state?.nearbyVehicleId || null;
  
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      let initialVehicle = null;
      if (nearbyVehicleId) {
        initialVehicle = vehicles.find(v => String(v.id) === String(nearbyVehicleId));
      }
      
      if (!initialVehicle) {
        const factionVeh = vehicles.find(v => v.category === 'FACTION');
        initialVehicle = factionVeh || vehicles[0];
      }
      
      if (initialVehicle) {
        setSelectedVehicle(initialVehicle);
        if (initialVehicle.category === 'FACTION') setActiveCategory('FACTION');
      }
    }
  }, [vehicles, selectedVehicle, nearbyVehicleId]);

  const detailImage = "/assets/images/vehicule/default.webp";

  const getVehicleImage = (v: Vehicle | null) => {
    if (!v) return detailImage;
    if (failedImages.has(v.id)) return detailImage;
    
    if (v.modelKey) {
      const assetImg = images.getImage(`${v.modelKey}.webp`, 'vehicule');
      if (assetImg) return assetImg;
    }
    
    return v.img || detailImage;
  };

  const handleImageError = (id: any) => {
    const idStr = String(id);
    if (!failedImages.has(idStr)) {
      setFailedImages(prev => {
        const next = new Set(prev);
        next.add(idStr);
        return next;
      });
    }
  };

  const categories = useMemo(() => {
    const cats = [
      { id: 'ALL', label: 'ALL', icon: <Icons.Package size="1.2vw" /> },
    ];

    const hasFaction = vehicles.some(v => v.category === 'FACTION');
    if (hasFaction) {
      cats.push({ id: 'FACTION', label: 'FACTION', icon: <Icons.Star size="1.2vw" /> });
    }

    // Only show car categories for civil, politie car, and umu car garages
    const showAdvancedCategories = ['civil', 'politie', 'umu'].includes(type);

    if (showAdvancedCategories) {
      cats.push(
        { id: 'CLASAA', label: 'CLASA A', icon: <Icons.Car size="1.2vw" /> },
        { id: 'CLASAB', label: 'CLASA B', icon: <Icons.Car size="1.2vw" /> },
        { id: 'CLASAC', label: 'CLASA C', icon: <Icons.Zap size="1.2vw" /> },
        { id: 'CLASAD', label: 'CLASA D', icon: <Icons.Zap size="1.2vw" /> },
      );
    }

    return cats;
  }, [vehicles, type]);

  const toggleFavorite = (e: React.MouseEvent, id: any) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter((f: any) => f !== id) : [...prev, id]
    );
  };

  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    if (activeCategory !== 'ALL') {
      result = result.filter((v: Vehicle) => v.category === activeCategory);
    }
    if (searchQuery.trim() !== '') {
      result = result.filter((v: Vehicle) => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [...result].sort((a: Vehicle, b: Vehicle) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [vehicles, activeCategory, searchQuery, favorites]);

  const close = () => {
    rpc.callClient('Browser-HidePage');
  };

  const withdraw = () => {
    if (selectedVehicle) {
      rpc.callServer('Garage-Withdraw', selectedVehicle.id).catch(() => {});
    }
  };

  const park = () => {
    if (selectedVehicle) {
      rpc.callServer('Garage-Park', selectedVehicle.id).catch(() => {});
    }
  };

  const locate = () => {
    if (selectedVehicle && selectedVehicle.isOut) {
      rpc.callServer('Garage-Locate', selectedVehicle.id).catch(() => {});
    }
  };

  return (
    <div className="main-container">
      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <h1 className="main-title">{title}</h1>
          <p className="sub-title">{subTitle}</p>
        </div>
        <button className="close-btn" onClick={close}>
          <Icons.X size="1.2vw" />
        </button>
      </div>

      <div className="content-layout">
        {/* LEFT SIDE */}
        <div className="left-panel">
          <div className="search-filter-section">
            <div className="search-wrapper">
              <div className="search-icon">
                <Icons.Search size="1.4vw" />
              </div>
              <input 
                type="text"
                placeholder="CAUTA MASINA DORITA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-row">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.icon}
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="vehicle-grid scroll-hide">
            {filteredVehicles.map((v) => (
              <div 
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`vehicle-card ${selectedVehicle?.id === v.id ? 'active' : ''}`}
              >
                <div className="card-img-wrapper">
                  <img 
                    src={getVehicleImage(v)} 
                    className="card-img" 
                    alt={v.name} 
                    onError={() => handleImageError(v.id)}
                  />
                  <button 
                    onClick={(e) => toggleFavorite(e, v.id)}
                    className="fav-btn"
                  >
                    <Icons.Star 
                      size="1.2vw" 
                      fill={favorites.includes(v.id) ? "#f1c40f" : "none"}
                      color={favorites.includes(v.id) ? "#f1c40f" : "rgba(255,255,255,0.4)"}
                    />
                  </button>
                  <div className="stage-badge">S{v.stage}</div>
                  {v.isVip && <div className="vip-badge">VIP</div>}
                </div>
                <div className="card-footer">
                  <div className="card-info-main">
                    <h4 className="card-name">{v.name}</h4>
                    {v.isOut && <div className="out-indicator">SCOASA</div>}
                  </div>
                  <div className="chevron-box">
                    <Icons.ChevronRight size="1.3vw" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-panel">
          <div className="panel-header">
            <div className="panel-title-wrapper">
              <Icons.Car size="1.8vw" />
              <span className="panel-title">DETALII VEHICUL</span>
            </div>
          </div>

          <div className="panel-content scroll-hide">
             {selectedVehicle ? (
               <div className="details-container animate-in">
                  <div className="detail-preview">
                    <div className="preview-top-left">
                        <h2 className="vehicle-main-name">{selectedVehicle.name}</h2>
                        <span className="tax-badge">IMPOZIT: {selectedVehicle.tax} G</span>
                    </div>
                    <img 
                      src={getVehicleImage(selectedVehicle)} 
                      className="detail-hero-img" 
                      alt="Detail" 
                      onError={() => handleImageError(selectedVehicle.id)}
                    />
                    <div className="preview-stats">
                        <div className="fuel-bar-wrapper">
                           <div className="stat-labels">
                              <span className="label-gray">REZERVOR</span>
                              <span className="label-green">{selectedVehicle.fuel}%</span>
                           </div>
                           <div className="progress-bg">
                              <div className="progress-fill" style={{ width: `${selectedVehicle.fuel}%` }} />
                           </div>
                        </div>
                        <div className="odometer">
                           <span className="odo-label">ODOMETRU</span>
                           <span className="odo-value">{selectedVehicle.km} KM</span>
                        </div>
                    </div>
                  </div>

                  <div className="title-section">
                    <div className="badges-row">
                       <span className="expiry-badge">EXPIRA LA: {selectedVehicle.expiry}</span>
                    </div>
                  </div>

                  {selectedVehicle.description && <p className="description-text">{selectedVehicle.description}</p>}

                  <div className="stats-grid">
                    <div className="stat-box">
                       <span className="stat-top-label">NIVEL TUNING</span>
                       <span className="stat-main-value">STAGE {selectedVehicle.stage}</span>
                    </div>
                    <div className="stat-box">
                       <span className="stat-top-label">TIER VEHICUL</span>
                       <span className={`stat-main-value ${selectedVehicle.isVip ? 'text-yellow' : ''}`}>
                        {selectedVehicle.isVip ? 'VIP PASS' : 'STANDARD'}
                       </span>
                    </div>
                  </div>
               </div>
             ) : (
                <div className="no-selection">SELECTEAZA UN VEHICUL</div>
             )}
          </div>

          <div className="panel-footer">
            {inVehicle ? (
                <button className="main-action-btn" onClick={park}>
                    <Icons.Package size="1.8vw" />
                    <span className="action-text">PARCHEAZA</span>
                </button>
            ) : (
                <>
                    <button className="main-action-btn" onClick={withdraw}>
                        <Icons.Package size="1.8vw" />
                        <span className="action-text">SCOATE DIN GARAJ</span>
                    </button>
                    
                    <div className="secondary-btns">
                    {selectedVehicle?.isOut && (
                        <button 
                            className="sec-btn" 
                            onClick={locate}
                        >
                            <Icons.Navigation size="0.9vw" />
                            LOCALIZEAZA MASINA
                        </button>
                    )}
                    {nearbyVehicleId && String(nearbyVehicleId) === String(selectedVehicle?.id) ? (
                        <button className="sec-btn" onClick={park}>PARCHEAZA</button>
                    ) : null}
                    </div>
                </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        
        .main-container {
          width: 100vw;
          height: 100vh;
          background-color: rgba(10, 10, 10, 0.7) !important;
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 2vw;
          user-select: none;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          background-image: radial-gradient(circle at 50% 50%, rgba(26, 26, 26, 0.6) 0%, rgba(5, 5, 5, 0.7) 100%);
        }

        /* HEADER */
        .header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2vw;
          flex-shrink: 0;
        }
        .brand { display: flex; flex-direction: column; line-height: 0.8; }
        .main-title { font-size: 5vw; font-weight: 900; color: #f1c40f; font-style: italic; letter-spacing: -0.2vw; margin: 0; }
        .sub-title { color: #f1c40f; font-weight: 900; font-style: italic; letter-spacing: 0.3em; text-transform: uppercase; margin: 0.5vh 0 0 0; font-size: 1.4vw; line-height: 1; }
        
        .close-btn {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 0.6vw;
          border-radius: 0.8vw;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn:hover { 
          background-color: #dc2626;
          transform: rotate(90deg);
        }

        /* LAYOUT */
        .content-layout { flex: 1; display: flex; gap: 2vw; overflow: hidden; }
        .left-panel { flex: 2.2; display: flex; flex-direction: column; gap: 1.2vw; min-height: 0; }

        /* SEARCH & FILTER */
        .search-filter-section { display: flex; flex-direction: column; gap: 1vw; flex-shrink: 0; }
        .search-wrapper { position: relative; width: 100%; }
        .search-icon { position: absolute; left: 1.2vw; top: 0; bottom: 0; display: flex; align-items: center; color: #666; pointer-events: none; }
        .search-input {
          width: 100% !important;
          background: #141414 !important;
          border: 0.1vw solid rgba(255,255,255,0.05) !important;
          border-radius: 1vw !important;
          padding: 0.8vw 1.2vw 0.8vw 3.8vw !important;
          font-size: 0.8vw !important;
          font-weight: 700 !important;
          font-style: italic !important;
          text-transform: uppercase !important;
          color: #fff !important;
          outline: none !important;
          transition: border 0.3s !important;
          height: auto !important;
        }
        .search-input:focus { border-color: rgba(241,196,15,0.5); }
        .search-input::placeholder { color: #333; }

        .category-row { display: flex; gap: 0.6vw; }
        .category-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6vw;
          padding: 1vw;
          border-radius: 1vw;
          border: 0.1vw solid rgba(255,255,255,0.05);
          background: #141414;
          color: #666;
          transition: all 0.3s;
          cursor: pointer;
        }
        .category-btn.active { background: #f1c40f; border-color: #f1c40f; color: #000; }
        .category-btn:hover:not(.active) { color: #fff; }
        .cat-label { font-size: 0.8vw; font-weight: 900; font-style: italic; text-transform: uppercase; }

        /* VEHICLE GRID */
        .vehicle-grid {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1vw;
          padding-bottom: 2vw;
          padding-right: 0.5vw;
          align-content: start;
          width: 100%;
        }
        .scroll-hide::-webkit-scrollbar { display: none; }

        .vehicle-card {
          background: #141414;
          border: 0.1vw solid rgba(255,255,255,0.05);
          border-radius: 1.5vw;
          padding: 1vw;
          display: flex;
          flex-direction: column;
          gap: 1vw;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          width: 100% !important;
          min-width: 0;
          height: 100%;
        }
        .vehicle-card.active { border-color: #f1c40f; }
        .vehicle-card:hover:not(.active) { border-color: rgba(241,196,15,0.5); }
        .vehicle-card:active { transform: scale(0.95); }

        .card-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          border-radius: 1.2vw;
          overflow: hidden;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-img { max-width: 100%; max-height: 100%; object-fit: contain; opacity: 0.8; transition: all 0.5s; }
        .vehicle-card:hover .card-img { opacity: 1; transform: scale(1.1); }
        
        .fav-btn {
          position: absolute;
          top: 0.8vw;
          left: 0.8vw;
          z-index: 20;
          padding: 0.5vw;
          border-radius: 0.5vw;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(0.5vw);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .fav-btn:hover { background: rgba(0,0,0,0.9); }
        
        .stage-badge {
          position: absolute;
          top: 0.8vw;
          right: 0.8vw;
          background: rgba(0,0,0,0.9);
          padding: 0.3vw 0.8vw;
          border-radius: 0.5vw;
          border: 0.1vw solid rgba(255,255,255,0.2);
          font-weight: 900;
          color: #f1c40f;
          font-size: 1vw;
          font-style: italic;
          z-index: 10;
        }
        .vip-badge {
          position: absolute;
          bottom: 0.8vw;
          left: 0.8vw;
          background: #f1c40f;
          padding: 0.3vw 0.8vw;
          border-radius: 0.5vw;
          font-weight: 900;
          color: #000;
          font-size: 0.9vw;
          font-style: italic;
          z-index: 10;
          letter-spacing: -0.05vw;
        }

        .card-footer { display: flex; justify-content: space-between; align-items: center; padding: 0 0.2vw; gap: 0.5vw; }
        .card-info-main { flex: 1; display: flex; flex-direction: column; gap: 0.2vw; overflow: hidden; }
        .card-name { font-weight: 900; font-style: italic; font-size: 1.1vw; text-transform: uppercase; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; }
        .out-indicator { font-size: 0.6vw; font-weight: 900; color: #2ecc71; text-transform: uppercase; line-height: 1; }
        
        .chevron-box {
          width: 2.2vw;
          height: 2.2vw;
          border-radius: 0.6vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          color: #fff;
          transition: all 0.3s;
          flex-shrink: 0;
        }
        .vehicle-card.active .chevron-box { background: #f1c40f; color: #000; }

        /* RIGHT PANEL */
        .right-panel {
          flex: 1.4;
          background: #141414;
          border-radius: 1.5vw;
          border: 0.1vw solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 2vw 5vw rgba(0,0,0,0.5);
        }
        .panel-header { padding: 0.8vw 1.5vw; background: rgba(255,255,255,0.05); border-bottom: 0.1vw solid rgba(255,255,255,0.05); }
        .panel-title-wrapper { display: flex; align-items: center; gap: 0.8vw; color: #f1c40f; }
        .panel-title { font-weight: 900; font-style: italic; font-size: 0.9vw; text-transform: uppercase; letter-spacing: -0.05vw; }

        .panel-content { flex: 1; overflow-y: auto; padding: 2vw; display: flex; flex-direction: column; }
        .details-container { display: flex; flex-direction: column; gap: 1.5vw; }

        .detail-preview {
          position: relative;
          border-radius: 1.5vw;
          overflow: hidden;
          background: rgba(0,0,0,0.4);
          border: 0.1vw solid rgba(255,255,255,0.05);
          aspect-ratio: 16/9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .preview-top-left {
          position: absolute;
          top: 1.5vw;
          left: 1.5vw;
          display: flex;
          flex-direction: column;
          gap: 0.5vw;
          z-index: 20;
        }
        .detail-hero-img { width: 70%; height: auto; object-fit: contain; filter: drop-shadow(0 1vw 2vw rgba(0,0,0,0.8)); margin-bottom: 1vw; }

        .preview-stats {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5vw;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        }
        .fuel-bar-wrapper { flex: 0 0 60%; display: flex; flex-direction: column; gap: 0.4vw; }
        .stat-labels { display: flex; justify-content: space-between; font-size: 0.7vw; font-weight: 900; font-style: italic; text-transform: uppercase; }
        .label-gray { color: #999; }
        .label-green { color: #2ecc71; }
        .progress-bg { width: 100%; height: 0.4vw; background: rgba(255,255,255,0.1); border-radius: 1vw; overflow: hidden; }
        .progress-fill { height: 100%; background: #2ecc71; transition: width 1s; }

        .odometer { display: flex; flex-direction: column; align-items: flex-end; }
        .odo-label { font-size: 0.6vw; color: #999; font-weight: 900; text-transform: uppercase; }
        .odo-value { font-size: 1.2vw; font-weight: 900; font-style: italic; color: #48dbfb; line-height: 1; text-transform: uppercase; }

        .title-section { display: flex; flex-direction: column; gap: 0.6vw; }
        .vehicle-main-name { font-size: 1.1vw; font-weight: 900; font-style: italic; color: #f1c40f; line-height: 1; text-transform: uppercase; letter-spacing: -0.05vw; margin: 0; }
        .badges-row { display: flex; gap: 0.6vw; }
        .expiry-badge { background: rgba(241,196,15,0.1); border: 0.1vw solid rgba(241,196,15,0.2); padding: 0.2vw 0.6vw; border-radius: 10vw; font-size: 0.5vw; font-weight: 900; font-style: italic; color: #f1c40f; text-transform: uppercase; }
        .tax-badge { background: rgba(255,255,255,0.05); border: 0.1vw solid rgba(255,255,255,0.1); padding: 0.2vw 0.6vw; border-radius: 10vw; font-size: 0.5vw; font-weight: 900; font-style: italic; color: #eee; text-transform: uppercase; }

        .description-text { color: #ccc; font-style: italic; font-size: 0.9vw; line-height: 1.5; border-left: 0.3vw solid #f1c40f; padding-left: 1.5vw; margin: 0; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1vw; padding-top: 0.5vw; }
        .stat-box { background: rgba(255,255,255,0.05); padding: 0.5vw; border-radius: 1vw; border: 0.1vw solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; }
        .stat-top-label { font-size: 0.5vw; color: #ccc; font-weight: 900; text-transform: uppercase; margin-bottom: 0.1vw; }
        .stat-main-value { font-size: 0.8vw; font-weight: 900; font-style: italic; color: #f1c40f; }
        .stat-main-value.text-yellow { color: #f1c40f; }
        .text-yellow { color: #f1c40f; }

        .panel-footer { padding: 1vw 1.5vw; background: rgba(255,255,255,0.05); border-top: 0.1vw solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 0.8vw; flex-shrink: 0; }
        .main-action-btn {
          width: 100%;
          padding: 0.8vw;
          background: #f1c40f;
          color: #000;
          border-radius: 1vw;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1vw;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1vw 4vw rgba(241,196,15,0.25);
        }
        .main-action-btn:hover { transform: scale(1.02); }
        .main-action-btn:active { transform: scale(0.98); }
        .action-text { font-weight: 900; font-style: italic; font-size: 1vw; text-transform: uppercase; letter-spacing: -0.05vw; }

        .secondary-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8vw; }
        .sec-btn {
          padding: 0.6vw;
          background: rgba(255,255,255,0.05);
          border: 0.1vw solid rgba(255,255,255,0.05);
          border-radius: 1vw;
          color: rgba(255,255,255,0.7);
          font-weight: 900;
          font-style: italic;
          font-size: 0.7vw;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5vw;
        }
        .sec-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .sec-btn.disabled { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }
        .sec-btn.disabled:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }

        @keyframes slideIn { from { opacity: 0; transform: translateX(3vw); } to { opacity: 1; transform: translateX(0); } }
        .animate-in { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        .no-selection {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-weight: 900;
          font-style: italic;
          font-size: 1.2vw;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default Garage;
