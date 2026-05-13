import React, { useState, useEffect, useCallback, useRef } from 'react';
import rpc from 'utils/rpc';
import { RouteComponentProps } from 'react-router-dom';
import withPayment, { WrappedProps } from 'components/Common/with-payment';
import withRotation from 'components/Common/with-rotation';
import images from 'utils/images';
import Hint from 'components/Common/hint';


const Icons = {
  head: () => <img src={images.getImage('head.svg')} alt="head" />,
  torso: () => <img src={images.getImage('torso.svg')} alt="torso" />,
  leftarm: () => <img src={images.getImage('leftarm.svg')} alt="leftarm" />,
  rightarm: () => <img src={images.getImage('rightarm.svg')} alt="rightarm" />,
  leftleg: () => <img src={images.getImage('leftleg.svg')} alt="leftleg" />,
  rightleg: () => <img src={images.getImage('rightleg.svg')} alt="rightleg" />,
  ChevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  ),
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
  )
};

const categoryMapping: { [key: string]: string } = {
  'head': 'Cap',
  'torso': 'Piept / Spate',
  'leftarm': 'Mana stanga',
  'rightarm': 'Mana dreapta',
  'leftleg': 'Picior stang',
  'rightleg': 'Picior drept'
};

const categories = [
  { id: 'head', IconComponent: Icons.head },
  { id: 'torso', IconComponent: Icons.torso },
  { id: 'leftarm', IconComponent: Icons.leftarm },
  { id: 'rightarm', IconComponent: Icons.rightarm },
  { id: 'leftleg', IconComponent: Icons.leftleg },
  { id: 'rightleg', IconComponent: Icons.rightleg }
];

type Props = {} & WrappedProps & RouteComponentProps;

const TattooShop = (props: Props) => {
  const [activeCategory, setActiveCategory] = useState('head');
  const [variationIndex, setVariationIndex] = useState(0);
  const [isExists, setIsExists] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  
  const [maxItems, setMaxItems] = useState(0);
  const [prices, setPrices] = useState<{ [name: string]: number }>({});
  
  const [cart, setCart] = useState<{ categoryId: string; categoryName: string; index: number; price: number; action: 'add' | 'remove' }[]>([]);

  const isInitialMount = useRef(true);

  const arcItems = [...categories];
  const startAngle = 45;
  const endAngle = -45;
  const angleStep = (endAngle - startAngle) / (arcItems.length - 1);

  useEffect(() => {
    const state = props.location.state as any;
    if (state && state.prices) {
        setPrices(state.prices);
    }
  }, [props.location.state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            e.stopPropagation();
            e.preventDefault();
        }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const updatePreview = useCallback(async (category: string, item: number) => {
    if (item < 0) return;
    try {
        const exists: boolean = await rpc.callClient('TattooShop-SetItem', Math.max(0, item));
        setIsExists(exists);
    } catch (e) {
        console.error('Failed to update preview', e);
    }
  }, []);

  const changeCategory = async (cat: string) => {
    try {
        const data: any = await rpc.callClient('TattooShop-ChangeType', cat);
        setActiveCategory(cat);
        const finalAmount = Math.max(0, data?.items || 0);
        setMaxItems(finalAmount);
        setVariationIndex(0);
        setIsExists(data?.isExists || false);
    } catch (e) {
        console.error('Failed to change category', e);
    }
  };

  useEffect(() => {
    changeCategory('head');
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    if (maxItems > 0) {
        updatePreview(activeCategory, variationIndex);
    }
  }, [variationIndex, activeCategory, updatePreview, maxItems]);

  const addToCart = () => {
    if (isExists) return; // Prevent adding if already owned
    setCart(prev => [...prev, { 
      categoryId: activeCategory, 
      categoryName: categoryMapping[activeCategory],
      index: variationIndex, 
      price: prices[activeCategory] || 0,
      action: isExists ? 'remove' : 'add'
    }]);
  };

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCheckout = async (paymentMode: string) => {
      if (cart.length === 0) return;
      setPaymentStatus('Procesare...');
      let allSuccess = true;
      for (const item of cart) {
          try {
              await rpc.callClient('TattooShop-ChangeType', item.categoryId);
              await rpc.callClient('TattooShop-SetItem', item.index);
              if (item.action === 'remove') {
                 await rpc.callClient('TattooShop-Remove', paymentMode);
              } else {
                 await rpc.callClient('TattooShop-Buy', paymentMode);
              }
          } catch (e) {
              allSuccess = false;
          }
      }
      
      // restore view
      await changeCategory(activeCategory);
      await updatePreview(activeCategory, variationIndex);

      if (allSuccess) {
          setPaymentStatus('Plată reușită!');
          setCart([]);
          setTimeout(() => {
              setPaymentStatus(null);
          }, 1500);
      } else {
          setPaymentStatus('Fonduri insuficiente sau eroare!');
          setTimeout(() => setPaymentStatus(null), 3000);
      }
  };

  const closeMenu = () => {
      rpc.callClient('TattooShop-CloseMenu');
  };

  return (
    <div className="mh-shop-clothes-shop-wrapper">
      <style>{`
        .hud, .hud_minimap, #minimap { display: none !important; visibility: hidden !important; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .mh-shop-clothes-shop-wrapper {
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          font-family: 'Inter', sans-serif !important;
          color: white !important;
          user-select: none !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          z-index: 100 !important;
          background: none !important;
          background-color: transparent !important;
        }
        :root {
          --background: transparent !important;
        }
        .mh-shop-arc-menu {
          position: absolute !important;
          left: 22vw !important;
          top: 50% !important;
          width: 0 !important;
          height: 0 !important;
          z-index: 10 !important;
        }
        .mh-shop-arc-arm {
          position: absolute !important;
          right: 0 !important;
          top: 0 !important;
          width: 18vw !important;
          height: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          transform-origin: right center !important;
        }
        .mh-shop-arc-item {
          width: 3.5vw !important;
          height: 3vw !important;
          background: #141414 !important;
          border: 0.1vw solid rgba(255,255,255,0.05) !important;
          border-radius: 0.4vw !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #ffffff !important;
          cursor: pointer !important;
          transition: 0.3s !important;
          clip-path: polygon(0 0, 100% 15%, 100% 85%, 0 100%) !important;
          position: relative !important;
        }
        .mh-shop-arc-item svg {
          width: 1.6vw !important;
          height: 1.6vw !important;
          display: block !important;
        }
        .mh-shop-arc-item img {
          width: 1.6vw !important;
          height: 1.6vw !important;
          display: block !important;
          filter: brightness(0) invert(1) !important;
        }
        .mh-shop-arc-item.active {
          background: #f1c40f !important;
          color: #000 !important;
          transform: scale(1.05) !important;
          z-index: 2 !important;
        }
        .mh-shop-arc-item.active img {
          filter: brightness(0) !important;
        }
        .mh-shop-arc-item:hover:not(.active) {
          background: rgba(241,196,15,0.2) !important;
          color: #fff !important;
        }
        .mh-shop-shop-ui-container {
          position: absolute !important;
          bottom: 4vw !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
        }
        .mh-shop-selection-panel {
          background: #141414 !important;
          border: 0.1vw solid rgba(255,255,255,0.05) !important;
          border-radius: 0.8vw !important;
          padding: 0.6vw 1.2vw !important;
          display: flex !important;
          align-items: center !important;
          gap: 1.2vw !important;
          min-width: 25vw !important;
          box-shadow: 0 1vw 4vw rgba(0,0,0,0.5) !important;
        }
        .mh-shop-control-group {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.15vw !important;
        }
        .mh-shop-control-label {
          font-size: 0.55vw !important;
          color: #666 !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-style: italic !important;
        }
        .mh-shop-selector-box {
          display: flex !important;
          align-items: center !important;
          gap: 0.3vw !important;
          background: rgba(255,255,255,0.02) !important;
          padding: 0.15vw 0.4vw !important;
          border-radius: 0.5vw !important;
          border: 0.1vw solid rgba(255,255,255,0.05) !important;
        }
        .mh-shop-arrow-btn {
          background: rgba(255,255,255,0.05) !important;
          border: none !important;
          color: #f1c40f !important;
          width: 1.5vw !important;
          height: 1.5vw !important;
          border-radius: 0.4vw !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: 0.2s !important;
        }
        .mh-shop-arrow-btn:hover {
          background: #f1c40f !important;
          color: #000 !important;
        }
        .mh-shop-arrow-btn svg {
            width: 0.8vw !important;
            height: 0.8vw !important;
        }
        .mh-shop-value-input {
          background: transparent !important;
          border: none !important;
          color: white !important;
          font-size: 0.9vw !important;
          font-weight: 900 !important;
          font-style: italic !important;
          width: 2vw !important;
          text-align: center !important;
          outline: none !important;
        }
        .mh-shop-action-buttons {
          display: flex !important;
          gap: 0.5vw !important;
          margin-left: auto !important;
          align-items: center !important;
        }
        .mh-shop-shop-btn {
          padding: 0.5vw 1.2vw !important;
          border-radius: 0.5vw !important;
          font-weight: 900 !important;
          font-style: italic !important;
          font-size: 0.6vw !important;
          text-transform: uppercase !important;
          border: none !important;
          cursor: pointer !important;
          transition: 0.3s !important;
        }
        .mh-shop-btn-yellow {
          background: #f1c40f !important;
          color: #000 !important;
        }
        .mh-shop-btn-yellow:hover {
          background: #dfb30a !important;
        }
        .mh-shop-btn-disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          background: #666 !important;
          color: #aaa !important;
        }
        .mh-shop-btn-disabled:hover {
          background: #666 !important;
        }
        .mh-shop-btn-close-square {
          width: 2vw !important;
          height: 2vw !important;
          background: #ff3030 !important;
          color: #fff !important;
          border-radius: 0.5vw !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: none !important;
        }
        .mh-shop-btn-close-square:hover {
          background: #e62222 !important;
          transform: rotate(360deg) !important;
        }
        .mh-shop-btn-close-square .mh-shop-x-icon {
          transform: rotate(45deg) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .mh-shop-btn-close-square .mh-shop-x-icon svg {
          width: 1.8vw !important;
          height: 1.8vw !important;
          stroke: white !important;
          stroke-width: 3 !important;
        }

        /* CART PANEL CSS */
        .mh-shop-cart-panel {
          position: absolute !important;
          right: 4vw !important;
          top: 4vw !important;
          width: 18vw !important;
          max-height: 80vh !important;
          background: #141414 !important;
          border: 0.1vw solid rgba(255,255,255,0.05) !important;
          border-radius: 0.8vw !important;
          display: flex !important;
          flex-direction: column !important;
          box-shadow: 0 1vw 4vw rgba(0,0,0,0.5) !important;
        }
        .mh-shop-cart-header {
          padding: 1vw !important;
          background: rgba(255,255,255,0.02) !important;
          border-bottom: 0.1vw solid rgba(255,255,255,0.05) !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5vw !important;
        }
        .mh-shop-cart-header svg {
          width: 1.2vw !important;
          height: 1.2vw !important;
          color: #f1c40f !important;
        }
        .mh-shop-cart-header h2 {
          margin: 0 !important;
          font-size: 1vw !important;
          font-weight: 900 !important;
          font-style: italic !important;
          color: #f1c40f !important;
          line-height: 1 !important;
        }
        .mh-shop-cart-items {
          flex: 1 !important;
          overflow-y: auto !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .mh-shop-cart-item { 
          padding: 0.8vw 1vw !important;
          border-bottom: 0.1vw solid rgba(255,255,255,0.02) !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        .mh-shop-cart-item-info {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.2vw !important;
        }
        .mh-shop-cart-item-title {
          font-size: 0.75vw !important;
          font-weight: 700 !important;
          color: #fff !important;
        }
        .mh-shop-cart-item-desc {
          font-size: 0.65vw !important;
          color: #888 !important;
        }
        .mh-shop-cart-item-price {
          font-size: 0.75vw !important;
          font-weight: 900 !important;
          font-style: italic !important;
          color: #f1c40f !important;
        }
        .mh-shop-cart-item-right {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-end !important;
          gap: 0.4vw !important;
        }
        .mh-shop-cart-item-remove {
          background: rgba(255,48,48,0.1) !important;
          border: none !important;
          color: #ff3030 !important;
          border-radius: 0.3vw !important;
          width: 1.2vw !important;
          height: 1.2vw !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: 0.2s !important;
        }
        .mh-shop-cart-item-remove:hover {
          background: #ff3030 !important;
          color: #fff !important;
        }
        .mh-shop-cart-item-remove svg {
          width: 0.7vw !important;
          height: 0.7vw !important;
        }
        .mh-shop-cart-footer {
          padding: 1vw !important;
          background: rgba(255,255,255,0.02) !important;
          border-top: 0.1vw solid rgba(255,255,255,0.05) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.8vw !important;
        }
        .mh-shop-cart-total {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        .mh-shop-cart-total-label {
          font-size: 0.8vw !important;
          color: #aaa !important;
          font-weight: 700 !important;
        }
        .mh-shop-cart-total-val {
          font-size: 1.2vw !important;
          color: #f1c40f !important;
          font-weight: 900 !important;
          font-style: italic !important;
        }
        .mh-shop-cart-btns {
          display: flex !important;
          gap: 0.5vw !important;
        }
        .mh-shop-cart-btns button {
          flex: 1 !important;
          padding: 0.6vw !important;
          text-align: center !important;
          justify-content: center !important;
        }
        .mh-shop-hint {
          display: flex !important;
          align-items: center !important;
          gap: 0.5vw !important;
          position: absolute !important;
          right: 4vw !important;
          bottom: 4vw !important;
          z-index: 10 !important;
        }
        .mh-shop-hint .hint_icon {
          width: 1.5vw !important;
          height: 1.5vw !important;
          filter: brightness(0) saturate(100%) invert(81%) sepia(49%) saturate(1251%) hue-rotate(352deg) brightness(101%) contrast(105%) !important;
        }
        .mh-shop-hint .hint_text {
          color: #f1c40f !important;
          font-weight: 900 !important;
          font-style: italic !important;
          font-size: 0.8vw !important;
          text-transform: uppercase !important;
        }
      `}</style>

      {/* TITLE */}
      <div style={{ position: 'absolute', top: '3vw', left: '4vw', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '3.5vw', fontWeight: 900, color: '#f1c40f', fontStyle: 'italic', letterSpacing: '-0.2vw', lineHeight: 0.8, margin: 0, textShadow: '0 0.5vw 1.5vw rgba(0,0,0,0.5)' }}>MAGAZIN</h1>
        <h2 style={{ fontSize: '1.8vw', fontWeight: 900, color: '#fff', fontStyle: 'italic', margin: 0, letterSpacing: '0.1vw', textShadow: '0 0.5vw 1vw rgba(0,0,0,0.5)', paddingLeft: '0.5vw' }}>DE TATUAJE</h2>
      </div>

      <Hint className="mh-shop-hint" action="drag">
          Rotirea personajului
      </Hint>

      {/* SEMI-CIRCLE MENU */}
      <div className="mh-shop-arc-menu">
        {arcItems.map((cat, i) => {
          const angle = startAngle + i * angleStep;
          return (
            <div key={cat.id} className="mh-shop-arc-arm" style={{ transform: `rotate(${angle}deg)` }}>
              <div 
                className={`mh-shop-arc-item ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => changeCategory(cat.id)}
              >
                <cat.IconComponent />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mh-shop-shop-ui-container">
        <div className="mh-shop-selection-panel">
          {/* Model Selector */}
          <div className="mh-shop-control-group">
            <span className="mh-shop-control-label">Model</span>
            <div className="mh-shop-selector-box">
              <button className="mh-shop-arrow-btn" onClick={() => setVariationIndex(v => Math.max(0, v - 1))}>
                <Icons.ChevronLeft />
              </button>
              <input 
                type="text" 
                className="mh-shop-value-input" 
                value={variationIndex} 
                onChange={(e) => {
                  const val = Number(e.target.value.replace(/\D/g, ''));
                  setVariationIndex(Math.min(maxItems - 1, Math.max(0, val)));
                }}
              />
              <button className="mh-shop-arrow-btn" onClick={() => setVariationIndex(v => Math.min(maxItems - 1, v + 1))}>
                <Icons.ChevronRight />
              </button>
            </div>
          </div>

          <div className="mh-shop-control-group">
            <span className="mh-shop-control-label">Preț</span>
            <span style={{ fontSize: '1vw', fontWeight: 900, fontStyle: 'italic', color: '#f1c40f' }}>{(prices[activeCategory] || 0).toLocaleString()}</span>
          </div>

          <div className="mh-shop-action-buttons">
            <button 
              className={`mh-shop-shop-btn mh-shop-btn-yellow ${isExists ? 'mh-shop-btn-disabled' : ''}`} 
              onClick={addToCart}
              disabled={isExists}
            >
              {isExists ? 'DEȚINUT' : 'ADAUGĂ ÎN COȘ'}
            </button>
            <button className="mh-shop-btn-close-square" onClick={closeMenu}>
              <div className="mh-shop-x-icon">
                <Icons.Plus />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE CART PANEL */}
      <div className="mh-shop-cart-panel">
        <div className="mh-shop-cart-header">
          <Icons.Cart />
          <h2>COȘUL TĂU</h2>
        </div>
        
        <div className="mh-shop-cart-items">
          {cart.length === 0 ? (
            <span style={{color: '#666', fontSize: '0.8vw', textAlign: 'center', padding: '2vw 0', fontStyle: 'italic', fontWeight: 900}}>COȘUL ESTE GOL</span>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="mh-shop-cart-item">
                <div className="mh-shop-cart-item-info">
                   <span className="mh-shop-cart-item-title">{item.categoryName} {item.action === 'remove' ? '(Sterge)' : ''}</span>
                   <span className="mh-shop-cart-item-desc">Model: {item.index}</span>
                </div>
                <div className="mh-shop-cart-item-right">
                   <span className="mh-shop-cart-item-price">${item.price.toLocaleString()}</span>
                   <button className="mh-shop-cart-item-remove" onClick={() => removeFromCart(idx)}>
                      <Icons.Trash />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mh-shop-cart-footer">
          <div className="mh-shop-cart-total">
            <span className="mh-shop-cart-total-label">Subtotal</span>
            <span className="mh-shop-cart-total-val">${cart.reduce((acc, i) => acc + i.price, 0).toLocaleString()}</span>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5vw'}}>
              {paymentStatus && (
                <span style={{ color: '#f1c40f', fontWeight: 900, fontStyle: 'italic', fontSize: '0.8vw', textAlign: 'center' }}>{paymentStatus}</span>
              )}
              <div className="mh-shop-cart-btns">
                  <button className="mh-shop-shop-btn mh-shop-btn-yellow" onClick={() => handleCheckout('cash')}>CUMPĂRĂ (CASH)</button>
                  <button className="mh-shop-shop-btn mh-shop-btn-yellow" onClick={() => handleCheckout('bank')}>CUMPĂRĂ (CARD)</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withPayment(withRotation(TattooShop));
