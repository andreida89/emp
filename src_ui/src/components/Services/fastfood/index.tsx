import React, { useState, useMemo, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StoreState } from 'store';
import rpc from 'utils/rpc';
import images from 'utils/images';
import inventoryItems from 'data/inventory.json';

const Icon = ({ children, size = "1vw", color = "currentColor", strokeWidth = 2, className = "" }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

const Icons = {
  ShoppingBasket: (props: any) => (
    <Icon {...props}>
      <path d="m5 11 4-7" /><path d="m19 11-4-7" /><path d="M2 11h20" /><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4" /><path d="M9 11v1" /><path d="M15 11v1" />
    </Icon>
  ),
  Trash2: (props: any) => (
    <Icon {...props}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
    </Icon>
  ),
  Plus: (props: any) => (
    <Icon {...props}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </Icon>
  ),
  Minus: (props: any) => (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  ),
  Wallet: (props: any) => (
    <Icon {...props}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </Icon>
  ),
  Pizza: (props: any) => (
    <Icon {...props}>
      <path d="m20.5 15.5-1.5-1M15.5 20.5l-1-1.5M12 2l-7 16a2 2 0 0 0 1.7 2.3L20 22a2 2 0 0 0 2-1.7L22 7l-10-5" /><path d="M7 11v.01" /><path d="M11 15v.01" /><path d="M15 11v.01" /><path d="M11 11v.01" />
    </Icon>
  ),
  UtensilsCrossed: (props: any) => (
    <Icon {...props}>
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" /><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" /><path d="m2.1 21.8 6.4-6.3" /><path d="m19 5-7 7" />
    </Icon>
  ),
  CreditCard: (props: any) => (
    <Icon {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </Icon>
  ),
  X: (props: any) => (
    <Icon {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </Icon>
  ),
  CheckCircle2: (props: any) => (
    <Icon {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
    </Icon>
  ),
  Banknote: (props: any) => (
    <Icon {...props}>
      <rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" />
    </Icon>
  ),
  XCircle: (props: any) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </Icon>
  )
};

type Props = RouteComponentProps;

const FastFood: React.FC<Props> = (props) => {
  const [activeCategory, setActiveCategory] = useState('TOATE');
  const [cart, setCart] = useState<any[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState('IDLE');
  const [lastMethod, setLastMethod] = useState('');
  const [errorMessage, setErrorMessage] = useState('FONDURI INSUFICIENTE');
  
  const [balanceCash, setBalanceCash] = useState<number>(0);
  const balanceBank = useSelector((state: StoreState) => state.player.money.bank);
  
  const [locationStr, setLocationStr] = useState('PENTRU CEI INFOMETATI');

  useEffect(() => {
    rpc.callClient('getPlayerLocation').then((loc: any) => {
      if(loc && loc.street) {
        setLocationStr(loc.street);
      }
    }).catch(() => {});

    rpc.callServer('FastFood-GetCash').then((cash: any) => {
      if(typeof cash === 'number') {
        setBalanceCash(cash);
      }
    }).catch(() => {});
  }, []);

  const categories = [
    { id: 'TOATE', label: 'FAST FOOD', icon: <Icons.Pizza size="0.9vw" /> },
  ];

  const prices = (props.location?.state as any)?.prices || {};

  const products = useMemo(() => {
    return Object.entries(prices).map(([name, price]) => {
      const itemData = (inventoryItems as any)[name] || {};
      let category = 'FAST FOOD';

      return {
        id: name,
        name: itemData?.name || name,
        price: price as number,
        category,
        stock: 99, 
        img: images.getImage(`${name}.png`, 'inventory')
      };
    });
  }, [prices]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = (method: string) => {
    if (cart.length === 0) return;
    
    const paymentMethod = method === 'CASH' ? 'cash' : 'bank';
    const hasEnoughFunds = paymentMethod === 'cash' ? balanceCash >= totalPrice : balanceBank >= totalPrice;

    setLastMethod(method);
    setCheckoutStatus('PROCESSING');
    
    setTimeout(async () => {
      try {
        let hasError = false;
        for(const item of cart) {
          const response = await rpc.callServer('FastFood-Buy', [{ name: item.id, amount: item.qty }, paymentMethod]);
          
          if (typeof response === 'string') {
            setErrorMessage(response);
            setCheckoutStatus('ERROR_FUNDS');
            setTimeout(() => setCheckoutStatus('IDLE'), 3000);
            hasError = true;
            break;
          }
        }
        
        if (!hasError) {
          setCheckoutStatus('SUCCESS');
          setCart([]);
          setTimeout(() => setCheckoutStatus('IDLE'), 3000);
          
          rpc.callServer('FastFood-GetCash').then((cash: any) => {
            if(typeof cash === 'number') {
              setBalanceCash(cash);
            }
          }).catch(() => {});
        }
      } catch (err: any) {
        setErrorMessage(err.msg ? String(err.msg).toUpperCase() : 'TRANZACTIE REFUZATA');
        setCheckoutStatus('ERROR_FUNDS');
        setTimeout(() => setCheckoutStatus('IDLE'), 3000);
      }
    }, 1500);
  };

  return (
    <div className="magazin-nou-container">
    <div className="magazin-nou-wrapper">
      <style>{`
        .magazin-nou-container {
          width: 100vw;
          height: 100vh;
          background-color: rgba(10, 10, 10, 0.5) !important;
          display: flex;
          justify-content: center;
          align-items: center;
          user-select: none;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
          background-image: radial-gradient(circle at 50% 50%, rgba(26, 26, 26, 0.4) 0%, rgba(5, 5, 5, 0.5) 100%) !important;
        }

        .magazin-nou-wrapper {
          width: 80vw;
          height: 85vh;
          display: flex;
          flex-direction: column;
          padding: 1.1vw;
          overflow: hidden;
          position: relative;
          color: white;
        }

        .magazin-nou-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .magazin-nou-wrapper .header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2vw;
          flex-shrink: 0;
        }

        .magazin-nou-wrapper .header-title-box {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .magazin-nou-wrapper .header-title {
          font-size: 5vw;
          font-weight: 900;
          color: #f1c40f;
          font-style: italic;
          letter-spacing: -0.2vw;
          line-height: 0.8;
          text-shadow: none;
        }

        .magazin-nou-wrapper .header-subtitle {
          color: #f1c40f;
          font-weight: 900;
          font-style: italic;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-top: 0.5vh;
          font-size: 1.4vw;
        }

        .magazin-nou-wrapper .wallet-container {
          display: flex;
          align-items: center;
          gap: 1.1vw;
        }

        .magazin-nou-wrapper .wallet-card {
          background-color: #141414;
          padding: 0.5vw 1vw;
          border-radius: 1vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          gap: 0.75vw;
        }

        .magazin-nou-wrapper .wallet-icon-bg {
          color: #f1c40f;
          background-color: rgba(255, 255, 255, 0.05);
          padding: 0.45vw;
          border-radius: 0.5vw;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .magazin-nou-wrapper .wallet-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .magazin-nou-wrapper .wallet-label {
          font-size: 0.5vw;
          color: #6b7280;
          font-weight: 900;
        }

        .magazin-nou-wrapper .wallet-amount {
          font-size: 0.8vw;
          font-weight: 900;
          color: #f1c40f;
        }

        .magazin-nou-wrapper .main-layout {
          flex: 1;
          display: flex;
          gap: 1.5vw;
          overflow: hidden;
          min-height: 0;
        }

        /* PRODUCTS SIDE */
        .magazin-nou-wrapper .products-section {
          flex: 2.5;
          display: flex;
          flex-direction: column;
          gap: 1.1vw;
          min-height: 0;
        }

        .magazin-nou-wrapper .categories-bar {
          display: flex;
          gap: 0.35vw;
          flex-shrink: 0;
        }

        .magazin-nou-wrapper .category-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8vw;
          padding: 0.75vw 0;
          border-radius: 0.8vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
          background-color: #141414;
          color: #6b7280;
          font-family: inherit;
        }

        .magazin-nou-wrapper .category-btn.active {
          background-color: #f1c40f;
          border-color: #f1c40f;
          color: black !important;
        }

        .magazin-nou-wrapper .category-btn:hover:not(.active) {
          color: white;
        }

        .magazin-nou-wrapper .category-label {
          font-size: 0.55vw;
          font-weight: 900;
          font-style: italic;
          letter-spacing: 0.05em;
        }

        .magazin-nou-wrapper .products-grid {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75vw;
          padding-right: 0.5vw;
          align-content: start;
          align-items: start;
        }

        .magazin-nou-wrapper .products-grid::-webkit-scrollbar { display: none; }

        .magazin-nou-wrapper .product-card {
          background-color: #141414;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          border-radius: 1vw;
          padding: 0.6vw;
          display: flex;
          flex-direction: column;
          gap: 0.4vw;
          cursor: pointer;
          transition: all 0.2s ease;
          height: fit-content;
        }

        .magazin-nou-wrapper .product-card:hover {
          border-color: rgba(241, 196, 15, 0.5);
        }

        .magazin-nou-wrapper .product-card:active {
          transform: scale(0.95);
        }

        .magazin-nou-wrapper .product-image-container {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: 0.8vw;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .magazin-nou-wrapper .product-img {
          width: 45%;
          height: 45%;
          object-fit: contain;
          opacity: 0.8;
          transition: all 0.5s ease;
        }

        .magazin-nou-wrapper .product-card:hover .product-img {
          opacity: 1;
          transform: scale(1.1);
        }

        .magazin-nou-wrapper .price-tag {
          position: absolute;
          top: 0.5vw;
          right: 0.5vw;
          background-color: rgba(0, 0, 0, 0.9);
          padding: 0.2vw 0.6vw;
          border-radius: 0.5vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.2);
          font-weight: 900;
          color: #f1c40f;
          font-size: 0.7vw;
          font-style: italic;
          box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.5);
          z-index: 10;
        }

        .magazin-nou-wrapper .stock-tag {
          position: absolute;
          bottom: 0.5vw;
          left: 0.5vw;
          background-color: rgba(0, 0, 0, 0.9);
          padding: 0.2vw 0.6vw;
          border-radius: 0.5vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.2);
          font-weight: 900;
          font-size: 0.7vw;
          font-style: italic;
          box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.5);
          z-index: 10;
        }

        .magazin-nou-wrapper .stock-high { color: #22c55e; }
        .magazin-nou-wrapper .stock-low { color: #ef4444; }

        .magazin-nou-wrapper .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 0.2vw;
        }

        .magazin-nou-wrapper .product-name {
          font-weight: 900;
          font-style: italic;
          font-size: 0.6vw;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
          text-transform: uppercase;
        }

        .magazin-nou-wrapper .add-btn {
          width: 1.35vw;
          height: 1.35vw;
          background-color: #f1c40f;
          border-radius: 0.4vw;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black !important;
          box-shadow: 0 0.5vw 1vw rgba(241, 196, 15, 0.2);
        }

        /* CART SIDE */
        .magazin-nou-wrapper .cart-section {
          flex: 1;
          background-color: #141414;
          border-radius: 1.5vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 2vw 5vw rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .magazin-nou-wrapper .cart-header {
          padding: 1.1vw;
          background-color: rgba(255, 255, 255, 0.05);
          border-bottom: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .magazin-nou-wrapper .cart-title-box {
          display: flex;
          align-items: center;
          gap: 0.8vw;
          color: #f1c40f;
        }

        .magazin-nou-wrapper .cart-title {
          font-weight: 900;
          font-style: italic;
          font-size: 0.45vw;
        }

        .magazin-nou-wrapper .clear-cart {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }

        .magazin-nou-wrapper .clear-cart:hover { color: #ef4444; }

        .magazin-nou-wrapper .cart-items-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.75vw;
          display: flex;
          flex-direction: column;
          gap: 0.8vw;
          min-height: 0;
        }

        .magazin-nou-wrapper .cart-items-list::-webkit-scrollbar { display: none; }

        .magazin-nou-wrapper .empty-cart {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0.2;
          font-style: italic;
          font-weight: 900;
          text-align: center;
          padding: 0 1vw;
        }

        .magazin-nou-wrapper .empty-cart p { font-size: 0.7vw; }

        .magazin-nou-wrapper .cart-item {
          background-color: rgba(255, 255, 255, 0.05);
          padding: 0.75vw;
          border-radius: 1vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          gap: 0.75vw;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(2vw); }
          to { opacity: 1; transform: translateX(0); }
        }

        .magazin-nou-wrapper .cart-item-img {
          width: 3vw;
          height: 3vw;
          border-radius: 0.5vw;
          object-fit: cover;
        }

        .magazin-nou-wrapper .cart-item-info { flex: 1; }
        .magazin-nou-wrapper .cart-item-name { font-weight: 900; font-style: italic; font-size: 0.45vw; line-height: 1; margin-bottom: 0.5vh; text-transform: uppercase; }
        .magazin-nou-wrapper .cart-item-price { color: #f1c40f; font-weight: 900; font-size: 0.8vw; }

        .magazin-nou-wrapper .qty-controls {
          display: flex;
          align-items: center;
          gap: 0.35vw;
          background-color: rgba(0, 0, 0, 0.4);
          border-radius: 0.5vw;
          padding: 0.2vw;
        }

        .magazin-nou-wrapper .qty-btn {
          width: 1.35vw;
          height: 1.35vw;
          border-radius: 0.3vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }

        .magazin-nou-wrapper .qty-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
        .magazin-nou-wrapper .qty-val { width: 1.1vw; text-align: center; font-weight: 900; font-style: italic; font-size: 0.7vw; }

        .magazin-nou-wrapper .cart-footer {
          padding: 1.1vw;
          background-color: rgba(255, 255, 255, 0.05);
          border-top: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.75vw;
          flex-shrink: 0;
        }

        .magazin-nou-wrapper .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .magazin-nou-wrapper .total-label { color: #6b7280; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 0.55vw; }
        .magazin-nou-wrapper .total-amount { color: #f1c40f; font-weight: 900; font-style: italic; font-size: 1.5vw; filter: drop-shadow(0 0 1vw rgba(241, 196, 15, 0.3)); }

        .magazin-nou-wrapper .checkout-btns { display: flex; gap: 0.8vw; }

        .magazin-nou-wrapper .btn-pay {
          flex: 1;
          padding: 0.9vw 0;
          border-radius: 1vw;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8vw;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .magazin-nou-wrapper .btn-pay:not(:disabled) {
          background-color: #f1c40f;
          color: black !important;
          box-shadow: 0 1vw 3vw rgba(241, 196, 15, 0.2);
        }

        .magazin-nou-wrapper .btn-pay:disabled {
          background-color: rgba(255, 255, 255, 0.05);
          color: #4b5563;
          filter: grayscale(1);
          cursor: not-allowed;
        }

        .magazin-nou-wrapper .btn-pay:hover:not(:disabled) { transform: scale(1.02); }
        .magazin-nou-wrapper .btn-pay:active:not(:disabled) { transform: scale(0.98); }
        .magazin-nou-wrapper .btn-text { font-weight: 900; font-style: italic; font-size: 0.65vw; text-transform: uppercase; letter-spacing: -0.02em; }

        /* OVERLAY */
        .magazin-nou-wrapper .overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 60;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .magazin-nou-wrapper .spinner {
          width: 3vw;
          height: 3vw;
          border: 0.4vw solid rgba(241, 196, 15, 0.2);
          border-top-color: #f1c40f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.1vw;
        }

        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        .magazin-nou-wrapper .status-text { font-weight: 900; font-style: italic; color: #f1c40f; animation: pulse 1.5s infinite; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.45vw; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .magazin-nou-wrapper .result-box { display: flex; flex-direction: column; align-items: center; animation: zoomIn 0.3s ease; }
        @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .magazin-nou-wrapper .icon-wrapper { position: relative; margin-bottom: 1.1vw; }
        .magazin-nou-wrapper .glow { position: absolute; inset: 0; border-radius: 50%; filter: blur(3vw); opacity: 0.3; animation: pulse 1.5s infinite; }
        .magazin-nou-wrapper .icon-main { position: relative; padding: 0.75vw; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        .magazin-nou-wrapper .success-bg { background-color: #22c55e; }
        .magazin-nou-wrapper .success-text { color: #22c55e; filter: drop-shadow(0 0.5vw 2vw rgba(34, 197, 94, 0.4)); }
        .magazin-nou-wrapper .error-bg { background-color: #ef4444; }
        .magazin-nou-wrapper .error-text { color: #ef4444; filter: drop-shadow(0 0.5vw 2vw rgba(239, 68, 68, 0.4)); }

        .magazin-nou-wrapper .result-title { font-weight: 900; font-style: italic; font-size: 1.5vw; text-align: center; line-height: 1.2; text-transform: uppercase; margin-bottom: 0.5vw; }
        .magazin-nou-wrapper .result-bar { height: 0.3vh; width: 3vw; margin-bottom: 1vw; }
        .magazin-nou-wrapper .result-subtitle { color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.55vw; text-align: center; }

        /* FOOTER */
        .magazin-nou-wrapper .footer {
          margin-top: 1.1vw;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .magazin-nou-wrapper .location-card {
          background-color: #141414;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          border-radius: 1vw;
          padding: 0.5vw 1vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 10vw;
        }

        .magazin-nou-wrapper .loc-label { font-size: 0.45vw; color: #6b7280; font-weight: 900; margin-bottom: 0.15vw; text-transform: uppercase; letter-spacing: 0.05em; }
        .magazin-nou-wrapper .loc-val { font-size: 0.8vw; font-weight: 900; font-style: italic; color: #f1c40f; text-transform: uppercase; }

        .magazin-nou-wrapper .close-btn {
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

        .magazin-nou-wrapper .close-btn:hover { 
          background-color: #dc2626;
          transform: rotate(90deg);
        }
      `}</style>
      
      {/* HEADER */}
      <div className="header">
        <div className="header-title-box">
          <h1 className="header-title">FAST FOOD</h1>
          <p className="header-subtitle">MENIURI DELICIOASE</p>
        </div>
        <div className="wallet-container">
          <div className="wallet-card">
            <div className="wallet-icon-bg"><Icons.Wallet size="1vw"/></div>
            <div className="wallet-info">
              <span className="wallet-label">PORTOFEL</span>
              <span className="wallet-amount">{balanceCash.toLocaleString('ro-RO')} RON</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => rpc.callClient('Browser-HidePage')}>
            <Icons.X size="1.2vw" />
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="main-layout">
        
        {/* LEFT SIDE: PRODUCTS */}
        <div className="products-section">
          <div className="categories-bar">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.icon}
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} onClick={() => addToCart(product)} className="product-card">
                <div className="product-image-container">
                  <img src={product.img} className="product-img" alt={product.name} />
                  <div className="price-tag">${product.price}</div>
                  <div className={`stock-tag ${product.stock > 20 ? 'stock-high' : 'stock-low'}`}>
                    STOC: {product.stock}
                  </div>
                </div>
                <div className="product-footer">
                  <h4 className="product-name">{product.name}</h4>
                  <div className="add-btn">
                    <Icons.Plus size="0.7vw" strokeWidth={4} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: CART */}
        <div className="cart-section">
          <div className="cart-header">
            <div className="cart-title-box">
              <Icons.ShoppingBasket size="1vw" />
              <span className="cart-title">COSUL TAU ({cart.length})</span>
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="clear-cart">
                <Icons.Trash2 size="1vw" />
              </button>
            )}
          </div>

          <div className="cart-items-list">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <Icons.ShoppingBasket size="3vw" style={{marginBottom: '2vh'}} />
                <p>COSUL ESTE GOL.<br/>SELECTEAZA PRODUSE.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.img} className="cart-item-img" alt="" />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">${item.price * item.qty}</p>
                  </div>
                  <div className="qty-controls">
                    <button onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }} className="qty-btn"><Icons.Minus size="0.7vw"/></button>
                    <span className="qty-val">{item.qty}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }} className="qty-btn"><Icons.Plus size="0.7vw"/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="total-row">
              <span className="total-label">Total de plata</span>
              <span className="total-amount">${totalPrice}</span>
            </div>
            <div className="checkout-btns">
              <button 
                disabled={cart.length === 0 || checkoutStatus !== 'IDLE'}
                onClick={() => handleCheckout('CASH')}
                className="btn-pay"
              >
                <Icons.Banknote size="1.1vw" />
                <span className="btn-text">CASH</span>
              </button>
              <button 
                disabled={cart.length === 0 || checkoutStatus !== 'IDLE'}
                onClick={() => handleCheckout('CARD')}
                className="btn-pay"
              >
                <Icons.CreditCard size="1.1vw" />
                <span className="btn-text">CARD</span>
              </button>
            </div>
          </div>

          {/* OVERLAY */}
          {checkoutStatus !== 'IDLE' && (
            <div className="overlay">
              {checkoutStatus === 'PROCESSING' && (
                <>
                  <div className="spinner" />
                  <p className="status-text">SE PROCESEAZA...</p>
                </>
              )}

              {checkoutStatus === 'SUCCESS' && (
                <div className="result-box">
                  <div className="icon-wrapper">
                    <div className="glow success-bg"></div>
                    <div className="icon-main success-bg">
                      <Icons.CheckCircle2 size="2.5vw" color="black" strokeWidth={3} />
                    </div>
                  </div>
                  <h2 className="result-title success-text">POFTA BUNA!</h2>
                  <div className="result-bar success-bg"></div>
                  <p className="result-subtitle">PRODUSELE SUNT IN INVENTAR</p>
                </div>
              )}

              {checkoutStatus === 'ERROR_FUNDS' && (
                <div className="result-box">
                  <div className="icon-wrapper">
                    <div className="glow error-bg"></div>
                    <div className="icon-main error-bg">
                      <Icons.XCircle size="2.5vw" color="black" strokeWidth={3} />
                    </div>
                  </div>
                  <h2 className="result-title error-text">
                    {errorMessage}
                  </h2>
                  <div className="result-bar error-bg"></div>
                  <p className="result-subtitle">TRANZACTIE REFUZATA</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
          <div className="location-card">
            <span className="loc-label">LOCATIE</span>
            <span className="loc-val">{locationStr} FASTFOOD</span>
          </div>
      </div>
    </div>
  </div>
  );
};

export default FastFood;
