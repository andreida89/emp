import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { StoreState } from 'store';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';

// Componente SVG interne
const Icons = {
  CreditCard: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  ),
  Plus: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  ArrowUpRight: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
  ),
  ArrowDownLeft: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>
  ),
  Settings: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  X: ({ size, color = "currentColor", strokeWidth = 2 }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
  ChevronDown: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  ),
  ChevronLeft: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  ChevronRight: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  Star: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  ),
  Shuffle: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
  ),
  Lock: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  Delete: ({ size, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>
  )
};

type Props = {} & RouteComponentProps & ReturnType<typeof mapStateToProps>;
type State = {
    isAuthenticated: boolean;
    pinInput: string;
    showPinError: boolean;
    activePage: string;
    prefNumber: string;
    changePinData: { old: string; new: string; confirm: string };
    
    // Server data
    name: string;
    account: string;
    comission: number;
    prices: { [name: string]: number };
    hasPin: boolean;
    history: { name: string; amount: number; date: string }[];

    // Local inputs
    withdrawAmount: string;
    depositAmount: string;
    transferTarget: string;
    transferAmount: string;
    currentPage: number;
};

class Bank extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const data = (props.location.state as any) || {};
        this.state = {
            isAuthenticated: !data.account || (data.account && data.hasPin ? false : true), 
            pinInput: '',
            showPinError: false,
            activePage: data.account ? (data.hasPin ? 'dashboard' : 'set_pin') : 'create_choice',
            prefNumber: '',
            changePinData: { old: '', new: '', confirm: '' },
            
            // Server data
            name: data.name || '',
            account: data.account || '',
            prices: data.prices || { account: 3000 },
            comission: data.comission || 2,
            hasPin: data.hasPin || false,
            history: data.history || [],

            // Local inputs
            withdrawAmount: '',
            depositAmount: '',
            transferTarget: '',
            transferAmount: '',
            currentPage: 1
        };
    }

    handlePinSubmit = async (e?: any) => {
        if (e) e.preventDefault();
        const { pinInput } = this.state;
        try {
            const success = await rpc.callServer('Bank-CheckPin', pinInput);
            if (success) {
                this.setState({ isAuthenticated: true, showPinError: false });
            } else {
                this.setState({ showPinError: true, pinInput: '' });
                setTimeout(() => this.setState({ showPinError: false }), 3000);
            }
        } catch (err: any) {
            this.setState({ showPinError: true, pinInput: '' });
            setTimeout(() => this.setState({ showPinError: false }), 3000);
        }
    };

    handleNumpadClick = (num: number) => {
        if (this.state.pinInput.length < 5) {
            this.setState(prev => ({ pinInput: prev.pinInput + num }));
        }
    };

    handleBackspace = () => {
        this.setState(prev => ({ pinInput: prev.pinInput.slice(0, -1) }));
    };

    createAccount = async (isPreferential: boolean) => {
        const { prefNumber } = this.state;
        const { points } = this.props.money;

        if (isPreferential) {
            if (points < 50) {
                showNotification('error', "NU AI EMP COINS. CUMPARA DE PE SHOP PENTRU NUMERE PREFERENTIALE!");
                return;
            }
        }

        try {
            const account = await rpc.callServer('Bank-CreateAccount', isPreferential ? prefNumber : undefined);
            this.setState({ account, activePage: 'set_pin' });
        } catch (err: any) {
            if (err.msg) showNotification('error', err.msg);
        }
    };

    handleSetPin = async () => {
        const { changePinData } = this.state;
        if (changePinData.new.length < 4 || changePinData.new.length > 5) {
            showNotification('error', "PIN-UL TREBUIE SA AIBA 4-5 CIFRE!");
            return;
        }
        if (changePinData.new !== changePinData.confirm) {
            showNotification('error', "CONFIRMAREA PIN-ULUI NU CORESPUNDE!");
            return;
        }

        try {
            await rpc.callServer('Bank-SetPin', changePinData.new);
            this.setState({ hasPin: true, isAuthenticated: true, activePage: 'dashboard', changePinData: { old: '', new: '', confirm: '' } });
            showNotification('success', "PIN-ul a fost setat cu succes!");
        } catch (err: any) {
            if (err.msg) showNotification('error', err.msg);
        }
    };

    handleUpdatePin = async () => {
        const { changePinData } = this.state;
        if (changePinData.new.length < 4 || changePinData.new.length > 5) {
            showNotification('error', "PIN-UL NOU TREBUIE SA AIBA 4-5 CIFRE!");
            return;
        }
        if (changePinData.new !== changePinData.confirm) {
            showNotification('error', "CONFIRMAREA PIN-ULUI NU CORESPUNDE!");
            return;
        }

        try {
            await rpc.callServer('Bank-UpdatePin', [changePinData.old, changePinData.new]);
            this.setState({ activePage: 'dashboard', changePinData: { old: '', new: '', confirm: '' } });
            showNotification('success', "PIN-ul a fost actualizat!");
        } catch (err: any) {
            if (err.msg) showNotification('error', err.msg);
        }
    };

    handleWithdraw = async () => {
        const { withdrawAmount } = this.state;
        if (!withdrawAmount || parseInt(withdrawAmount) <= 0) return;
        try {
            await rpc.callServer('Bank-CashOut', parseInt(withdrawAmount));
            this.setState({ withdrawAmount: '', activePage: 'dashboard' });
            showNotification('success', "Retragere efectuata cu succes!");
        } catch (err: any) {
            if (err.msg) showNotification('error', err.msg);
        }
    };

    handleReplenish = async () => {
        const { depositAmount } = this.state;
        if (!depositAmount || parseInt(depositAmount) <= 0) return;
        try {
            await rpc.callServer('Bank-Replenish', parseInt(depositAmount));
            this.setState({ depositAmount: '', activePage: 'dashboard' });
            showNotification('success', "Depunere efectuata cu succes!");
        } catch (err: any) {
            if (err.msg) showNotification('error', err.msg);
        }
    };

    handleTransfer = async () => {
        const { transferTarget, transferAmount } = this.state;
        if (!transferTarget || !transferAmount || parseInt(transferAmount) <= 0) return;
        try {
            await rpc.callServer('Bank-Transfer', [transferTarget, parseInt(transferAmount)]);
            this.setState({ transferTarget: '', transferAmount: '', activePage: 'dashboard' });
            showNotification('success', "Transfer efectuat cu succes!");
        } catch (err: any) {
            if (err.msg) showNotification('error', err.msg);
        }
    };

    close = () => {
        rpc.callClient('Browser-HidePage');
    };

    render() {
        const { isAuthenticated, pinInput, showPinError, activePage, account, prefNumber, changePinData, withdrawAmount, depositAmount, transferTarget, transferAmount } = this.state;
        const { money } = this.props;

        if (!isAuthenticated) {
            return (
                <div className="eb-app-container">
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
                        .eb-app-container { min-height: 100vh !important; background-color: rgba(10, 10, 10, 0.45) !important; color: #ffffff !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 2vw !important; width: 100vw !important; height: 100vh !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: 9999 !important; }
                        .eb-main-frame { width: 90vw !important; max-width: 95% !important; height: 90vh !important; background-color: #0d0d0d !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; border-radius: 3vw !important; box-shadow: 0 2vw 5vw rgba(0,0,0,0.5) !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; }
                        .eb-logo-box { display: flex !important; flex-direction: column !important; align-items: center !important; margin-bottom: 4vh !important; }
                        .eb-logo-empire { font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 3.5vw !important; color: #FACC15 !important; letter-spacing: -0.15vw !important; line-height: 0.9 !important; }
                        .eb-logo-bank { font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 1.4vw !important; color: #ffffff !important; letter-spacing: 0.6vw !important; margin-top: 0.5vh !important; }
                        .eb-pin-box { width: 22vw !important; display: flex !important; flex-direction: column !important; gap: 2.5vh !important; }
                        .eb-styled-input { background: #141414 !important; border: 0.1vw solid rgba(255,255,255,0.1) !important; color: white !important; padding: 1.2vw !important; border-radius: 1.2vw !important; font-size: 1.5vw !important; outline: none !important; transition: all 0.3s !important; width: 100% !important; text-align: center !important; letter-spacing: 1vw !important; }
                        .eb-styled-input:focus { border-color: #FACC15 !important; box-shadow: 0 0 2vw rgba(250,204,21,0.1) !important; }
                        .eb-numpad-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 0.8vw !important; width: 100% !important; }
                        .eb-num-btn { background: #141414 !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; color: white !important; padding: 1.2vw !important; border-radius: 1vw !important; font-size: 1.2vw !important; font-weight: 700 !important; cursor: pointer !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; border: none !important; }
                        .eb-num-btn:hover { background: #FACC15; color: black; transform: scale(1.05); }
                        .eb-num-btn:active { transform: scale(0.95); }
                        .eb-notification-pin-err { position: fixed; bottom: 4vh; right: 2vw; width: 22vw; background: #ef4444; color: white; padding: 1.5vw 2vw; border-radius: 1.5vw; box-shadow: 0 1vw 4vw rgba(0,0,0,0.8); z-index: 100; display: flex; flex-direction: column; gap: 0.3vh; border: 0.1vw solid rgba(255,255,255,0.1); animation: eb-tada 0.8s ease; }
                        @keyframes eb-tada { 0% { transform: scale(1); } 10%, 20% { transform: scale(0.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } 100% { transform: scale(1) rotate(0); } }
                    `}</style>
                    {showPinError && (
                        <div className="eb-notification-pin-err">
                            <span style={{fontSize: '1.4vw', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02vw'}}>EROARE</span>
                            <span style={{fontSize: '0.9vw', fontWeight: 700, textTransform: 'uppercase', opacity: 0.95}}>PIN GRESIT. ACCES REFUZAT!</span>
                        </div>
                    )}
                    <div className="eb-main-frame">
                        <div className="eb-logo-box">
                            <span className="eb-logo-empire">EMPIRE</span>
                            <span className="eb-logo-bank">Bank</span>
                        </div>
                        <div className="eb-pin-box">
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5vh', gap: '0.5vw', color: '#71717a'}}>
                                <Icons.Lock size="0.9vw" />
                                <span style={{fontSize: '0.7vw', fontWeight: 700, textTransform: 'uppercase'}}>Securitate Necesara</span>
                            </div>
                            <form onSubmit={this.handlePinSubmit}>
                                <input 
                                    type="password" 
                                    className="eb-styled-input" 
                                    placeholder="•••••" 
                                    maxLength={5} 
                                    value={pinInput}
                                    onChange={(e) => this.setState({ pinInput: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                                    autoFocus
                                />
                            </form>
                            <div className="eb-numpad-grid">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <button key={n} className="eb-num-btn" onClick={() => this.handleNumpadClick(n)}>{n}</button>
                                ))}
                                <button className="eb-num-btn" onClick={this.handleBackspace} style={{color: '#ef4444'}}>
                                    <Icons.Delete size="1.2vw" />
                                </button>
                                <button className="eb-num-btn" onClick={() => this.handleNumpadClick(0)}>0</button>
                                <button className="eb-num-btn" onClick={this.handlePinSubmit} style={{backgroundColor: '#FACC15', color: 'black'}}>OK</button>
                            </div>
                            <button className="eb-num-btn" style={{marginTop: '2vh', backgroundColor: '#ef4444', color: 'white'}} onClick={this.close}>INCHIDE</button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="eb-app-container">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
                    .eb-app-container { min-height: 100vh !important; background-color: rgba(10, 10, 10, 0.45) !important; color: #ffffff !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 2vw !important; width: 100vw !important; height: 100vh !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: 9999 !important; }
                    .eb-custom-scrollbar::-webkit-scrollbar { width: 0.3vw !important; }
                    .eb-custom-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
                    .eb-custom-scrollbar::-webkit-scrollbar-thumb { background: #FACC15 !important; border-radius: 1vw !important; }
                    .eb-main-frame { width: 90vw !important; max-width: 95% !important; height: 90vh !important; background-color: #0d0d0d !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; border-radius: 3vw !important; box-shadow: 0 2vw 5vw rgba(0,0,0,0.5) !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; }
                    header.eb-top-bar { width: 100% !important; padding: 1.5vw 2.5vw !important; border-bottom: 0.1vw solid rgba(255,255,255,0.05) !important; display: flex !important; align-items: center !important; justify-content: space-between !important; background-color: #0d0d0d !important; }
                    .eb-logo-box { display: flex !important; flex-direction: column !important; cursor: default !important; }
                    .eb-logo-empire { font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 3.5vw !important; color: #FACC15 !important; letter-spacing: -0.15vw !important; line-height: 0.9 !important; }
                    .eb-logo-bank { font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 1.4vw !important; color: #ffffff !important; letter-spacing: 0.6vw !important; margin-top: 0.5vh !important; }
                    .eb-exit-btn { background-color: #ef4444 !important; color: white !important; border: none !important; padding: 0.6vw !important; border-radius: 0.8vw !important; cursor: pointer !important; transition: all 0.3s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; }
                    .eb-exit-btn:hover { background-color: #dc2626 !important; transform: rotate(90deg) !important; }
                    .eb-content-wrapper { display: flex !important; flex: 1 !important; overflow: hidden !important; }
                    main.eb-dashboard { flex: 1 !important; overflow-y: auto !important; padding: 3vw !important; }
                    .eb-balance-section { margin-bottom: 6vh !important; display: flex !important; justify-content: space-between !important; align-items: flex-end !important; flex-wrap: wrap !important; gap: 2vw !important; }
                    .eb-balance-label { color: #71717a !important; font-size: 0.7vw !important; text-transform: uppercase !important; letter-spacing: 0.1vw !important; margin-bottom: 0.5vh !important; }
                    .eb-balance-amount { font-size: 2.5vw !important; font-weight: 700 !important; letter-spacing: -0.05vw !important; }
                    .eb-balance-amount .eb-currency { color: #FACC15 !important; font-size: 1.5vw !important; margin-left: 0.5vw !important; }
                    .eb-action-buttons { display: flex !important; gap: 0.8vw !important; }
                    .eb-btn-base { padding: 0.8vw 1.8vw !important; border-radius: 1vw !important; font-size: 1vw !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; border: none !important; cursor: pointer !important; transition: all 0.2s ease !important; }
                    .eb-btn-home { background-color: #27272a !important; color: white !important; }
                    .eb-btn-withdraw { background-color: #ef4444 !important; color: white !important; }
                    .eb-btn-deposit { background-color: #2563eb !important; color: white !important; }
                    .eb-btn-transfer { background-color: #FACC15 !important; color: black !important; }
                    .eb-btn-base:hover { transform: translateY(-0.1vw) !important; opacity: 0.9 !important; }
                    .eb-accounts-list { display: flex !important; gap: 4vw !important; margin-bottom: 8vh !important; align-items: center !important; }
                    .eb-account-item { display: flex !important; align-items: center !important; gap: 1.2vw !important; cursor: default !important; }
                    .eb-account-info-text { display: flex !important; flex-direction: column !important; line-height: 1.2 !important; }
                    .eb-acc-id { font-size: 0.7vw !important; font-weight: 700 !important; text-transform: uppercase !important; color: #71717a !important; }
                    .eb-acc-digits { font-size: 1.2vw !important; font-weight: 900 !important; letter-spacing: 0.2vw !important; color: #FACC15 !important; }
                    .eb-add-acc-btn { background: none !important; border: none !important; color: #71717a !important; display: flex !important; align-items: center !important; gap: 0.5vw !important; cursor: pointer !important; transition: color 0.2s ease !important; }
                    .eb-add-acc-btn:hover { color: #FACC15 !important; }
                    .eb-transactions-container { width: 100% !important; background-color: transparent !important; }
                    .eb-table-title { color: #a1a1aa !important; font-size: 1vw !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.1vw !important; margin-bottom: 3vh !important; }
                    table.eb-table { width: 100% !important; border-collapse: collapse !important; }
                    .eb-th { text-align: left !important; padding-bottom: 2vh !important; color: #52525b !important; font-size: 0.9vw !important; font-weight: 700 !important; text-transform: uppercase !important; border-bottom: 0.1vw solid rgba(255,255,255,0.05) !important; }
                    .eb-td { padding: 2vh 0.5vw !important; font-size: 1.1vw !important; border-bottom: 0.1vw solid rgba(255,255,255,0.05) !important; }
                    .eb-tr-row:hover { background-color: rgba(255,255,255,0.02) !important; }
                    .eb-service-cell { display: flex !important; align-items: center !important; gap: 1vw !important; }
                    .eb-icon-bg { padding: 0.4vw !important; border-radius: 0.6vw !important; display: flex !important; align-items: center !important; }
                    .eb-load-more-btn { width: 100% !important; margin-top: 4vh !important; background: none !important; border: none !important; color: #FACC15 !important; font-size: 0.9vw !important; font-weight: 700 !important; text-transform: uppercase !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 0.4vw !important; }
                    .eb-form-page-container { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; min-height: 50vh !important; width: 100% !important; }
                    .eb-styled-form-box { width: 40vw !important; background: transparent !important; display: flex !important; flex-direction: column !important; gap: 3vh !important; }
                    .eb-form-title { font-size: 2.5vw !important; color: #ffffff !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; margin-bottom: 2vh !important; text-align: center !important; }
                    .eb-styled-input { background: #141414 !important; border: 0.1vw solid rgba(255,255,255,0.1) !important; color: white !important; padding: 1.5vw !important; border-radius: 1.2vw !important; font-size: 1.2vw !important; outline: none !important; transition: all 0.3s !important; width: 100% !important; }
                    .eb-styled-input:focus { border-color: #FACC15 !important; box-shadow: 0 0 2vw rgba(250,204,21,0.1) !important; }
                    .eb-option-card { background: #141414 !important; border: 0.1vw solid rgba(255,255,255,0.05) !important; padding: 2vw !important; border-radius: 1.5vw !important; cursor: pointer !important; transition: all 0.3s !important; display: flex !important; align-items: center !important; gap: 1.5vw !important; width: 100% !important; }
                    .eb-option-card:hover { border-color: #FACC15 !important; background: rgba(250,204,21,0.02) !important; }
                    .eb-pagination { display: flex !important; align-items: center !important; justify-content: center !important; gap: 2vw !important; margin-top: 3vh !important; }
                    .eb-pay-btn { background: #FACC15 !important; color: black !important; border: none !important; border-radius: 0.5vw !important; cursor: pointer !important; font-weight: 700 !important; text-transform: uppercase !important; transition: all 0.2s !important; display: flex !important; align-items: center !important; justify-content: center !important; }
                    .eb-pay-btn:hover { transform: scale(1.05) !important; filter: brightness(1.1) !important; }
                    .eb-pay-btn:disabled { opacity: 0.3 !important; cursor: not-allowed !important; }
                `}</style>

                <div className="eb-main-frame">
                    <header className="eb-top-bar">
                        <div className="eb-logo-box">
                            <span className="eb-logo-empire">EMPIRE</span>
                            <span className="eb-logo-bank">Bank</span>
                        </div>
                        <button className="eb-exit-btn" onClick={this.close}>
                            <Icons.X size="1.2vw" strokeWidth={3} />
                        </button>
                    </header>

                    <div className="eb-content-wrapper">
                        <main className="eb-dashboard eb-custom-scrollbar">
                            <div className="eb-balance-section">
                                <div>
                                    <p className="eb-balance-label">Sold Total</p>
                                    <h1 className="eb-balance-amount">
                                        <span>{money.bank.toLocaleString()}</span>
                                        <span className="eb-currency">RON</span>
                                    </h1>
                                </div>
                                
                                <div className="eb-action-buttons">
                                    <button className="eb-btn-base eb-btn-home" onClick={() => this.setState({ activePage: 'dashboard' })}>Home</button>
                                    <button className="eb-btn-base eb-btn-withdraw" onClick={() => this.setState({ activePage: 'withdraw' })}>Retragere</button>
                                    <button className="eb-btn-base eb-btn-deposit" onClick={() => this.setState({ activePage: 'deposit' })}>Depozit</button>
                                    <button className="eb-btn-base eb-btn-transfer" onClick={() => this.setState({ activePage: 'transfer' })}>Transfer</button>
                                </div>
                            </div>

                            {activePage === 'dashboard' ? (
                                <>
                                    <section className="eb-accounts-list">
                                        {!account ? (
                                            <div style={{ display: 'flex', gap: '2vw' }}>
                                                <button onClick={() => this.setState({ activePage: 'create_choice' })} className="eb-add-acc-btn">
                                                    <Icons.Plus size="1.8vw" />
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <span style={{fontSize: '1.2vw', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic'}}>Creaza cont</span>
                                                        <span style={{fontSize: '0.7vw', opacity: 0.6}}>Alege un numar de cont pentru a incepe</span>
                                                    </div>
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '4vw', alignItems: 'center' }}>
                                                <div className="eb-account-item">
                                                    <Icons.CreditCard size="2vw" color="#FACC15" />
                                                    <div className="eb-account-info-text">
                                                        <span className="eb-acc-id">CONT BANCAR ACTIV</span>
                                                        <span className="eb-acc-digits">{account}</span>
                                                    </div>
                                                </div>
                                                
                                                <button onClick={() => this.setState({ activePage: 'change_pin' })} className="eb-add-acc-btn">
                                                    <Icons.Settings size="1.8vw" />
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <span style={{fontSize: '1.2vw', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic'}}>Schimbare PIN</span>
                                                        <span style={{fontSize: '0.7vw', opacity: 0.6}}>Schimba codul de securitate</span>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </section>

                                    <div className="eb-transactions-container">
                                        <h3 className="eb-table-title">Ultimele 5 tranzactii</h3>
                                        <table className="eb-table">
                                            <thead>
                                                <tr>
                                                    <th className="eb-th">Serviciu</th>
                                                    <th className="eb-th">Data si ora</th>
                                                    <th style={{ textAlign: 'right' }} className="eb-th">Suma tranzactie</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.history && this.state.history.length > 0 ? (
                                                    this.state.history.slice((this.state.currentPage - 1) * 5, this.state.currentPage * 5).map((tr: any, idx: number) => (
                                                        <tr className="eb-tr-row" key={idx}>
                                                            <td className="eb-td">
                                                                <div className="eb-service-cell">
                                                                    <div className="eb-icon-bg" style={{ backgroundColor: tr.amount < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}>
                                                                        {tr.amount < 0 ? 
                                                                            <Icons.ArrowUpRight size="1.6vw" color="#ef4444" /> : 
                                                                            <Icons.ArrowDownLeft size="1.6vw" color="#22c55e" />
                                                                        }
                                                                    </div>
                                                                    <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{tr.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="eb-td" style={{ color: '#71717a', fontSize: '1vw', fontWeight: 500 }}>{tr.date}</td>
                                                            <td className="eb-td" style={{ textAlign: 'right', fontWeight: 900, color: tr.amount < 0 ? '#ef4444' : '#22c55e' }}>{tr.amount.toLocaleString()} RON</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="eb-td" style={{ textAlign: 'center', color: '#71717a' }}>Nu exista tranzactii recente.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {this.state.history && this.state.history.length > 5 && (
                                            <div className="eb-pagination">
                                                <button 
                                                    className="eb-pay-btn" 
                                                    style={{ padding: '0.5vw 1vw', fontSize: '0.8vw', width: 'auto', gap: '0.3vw' }}
                                                    disabled={this.state.currentPage === 1}
                                                    onClick={() => this.setState({ currentPage: this.state.currentPage - 1 })}
                                                >
                                                    <Icons.ChevronLeft size="1.2vw" /> Inapoi
                                                </button>
                                                <span style={{ fontSize: '0.9vw', fontWeight: 700, color: '#71717a', minWidth: '8vw', textAlign: 'center' }}>
                                                    Pagina {this.state.currentPage} / {Math.ceil(this.state.history.length / 5)}
                                                </span>
                                                <button 
                                                    className="eb-pay-btn" 
                                                    style={{ padding: '0.5vw 1vw', fontSize: '0.8vw', width: 'auto', gap: '0.3vw' }}
                                                    disabled={this.state.currentPage === Math.ceil(this.state.history.length / 5)}
                                                    onClick={() => this.setState({ currentPage: this.state.currentPage + 1 })}
                                                >
                                                    Inainte <Icons.ChevronRight size="1.2vw" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : activePage === 'set_pin' ? (
                                <div className="eb-form-page-container">
                                    <div className="eb-styled-form-box" style={{ gap: '2vh' }}>
                                        <h2 className="eb-form-title" style={{ marginBottom: '1vh' }}>Setare Cod PIN</h2>
                                        <input 
                                            type="password" 
                                            className="eb-styled-input" 
                                            placeholder="NOUL PIN (4-5 CIFRE)" 
                                            maxLength={5}
                                            value={changePinData.new}
                                            style={{letterSpacing: '1vw', padding: '1.2vw'}}
                                            onChange={(e) => this.setState({ changePinData: {...changePinData, new: e.target.value.replace(/\D/g, '')} })}
                                        />
                                        <input 
                                            type="password" 
                                            className="eb-styled-input" 
                                            placeholder="CONFIRMA PIN" 
                                            maxLength={5}
                                            value={changePinData.confirm}
                                            style={{letterSpacing: '1vw', padding: '1.2vw'}}
                                            onChange={(e) => this.setState({ changePinData: {...changePinData, confirm: e.target.value.replace(/\D/g, '')} })}
                                        />
                                        <button className="eb-btn-base eb-btn-transfer" style={{padding: '1.8vw', fontSize: '1.2vw'}} onClick={this.handleSetPin}>Seteaza PIN</button>
                                    </div>
                                </div>
                            ) : activePage === 'change_pin' ? (
                                <div className="eb-form-page-container">
                                    <div className="eb-styled-form-box" style={{ gap: '2vh' }}>
                                        <h2 className="eb-form-title" style={{ marginBottom: '1vh' }}>Schimbare Cod PIN</h2>
                                        <input 
                                            type="password" 
                                            className="eb-styled-input" 
                                            placeholder="PIN ACTUAL" 
                                            maxLength={5}
                                            value={changePinData.old}
                                            style={{letterSpacing: '1vw', padding: '1.2vw'}}
                                            onChange={(e) => this.setState({ changePinData: {...changePinData, old: e.target.value.replace(/\D/g, '')} })}
                                        />
                                        <input 
                                            type="password" 
                                            className="eb-styled-input" 
                                            placeholder="PIN NOU" 
                                            maxLength={5}
                                            value={changePinData.new}
                                            style={{letterSpacing: '1vw', padding: '1.2vw'}}
                                            onChange={(e) => this.setState({ changePinData: {...changePinData, new: e.target.value.replace(/\D/g, '')} })}
                                        />
                                        <input 
                                            type="password" 
                                            className="eb-styled-input" 
                                            placeholder="CONFIRMA PIN" 
                                            maxLength={5}
                                            value={changePinData.confirm}
                                            style={{letterSpacing: '1vw', padding: '1.2vw'}}
                                            onChange={(e) => this.setState({ changePinData: {...changePinData, confirm: e.target.value.replace(/\D/g, '')} })}
                                        />
                                        <button className="eb-btn-base eb-btn-transfer" style={{padding: '1.8vw', fontSize: '1.2vw'}} onClick={this.handleUpdatePin}>Actualizeaza PIN</button>
                                        <button className="eb-btn-base eb-btn-home" style={{marginTop: '1vh'}} onClick={() => this.setState({ activePage: 'dashboard' })}>Inapoi</button>
                                    </div>
                                </div>
                            ) : activePage === 'create_choice' ? (
                                <div className="eb-form-page-container">
                                    <div className="eb-styled-form-box">
                                        <h2 className="eb-form-title">Alege tipul de cont</h2>
                                        
                                        <div className="eb-option-card" onClick={() => this.createAccount(false)}>
                                            <Icons.Shuffle size="2.5vw" color="#ffffff" />
                                            <div style={{display:'flex', flexDirection:'column'}}>
                                                <span style={{fontWeight: 900, fontSize: '1.4vw'}}>NUMAR ALEATORIU</span>
                                                <span style={{fontSize: '0.9vw', color: '#22c55e'}}>GRATUIT • 6 CIFRE</span>
                                            </div>
                                        </div>

                                        <div className="eb-option-card" onClick={() => this.setState({ activePage: 'create_pref' })}>
                                            <Icons.Star size="2.5vw" color="#FACC15" />
                                            <div style={{display:'flex', flexDirection:'column'}}>
                                                <span style={{fontWeight: 900, fontSize: '1.4vw'}}>NUMAR PREFERENTIAL</span>
                                                <span style={{fontSize: '0.9vw', color: '#FACC15'}}>COST: 50 POINTS</span>
                                            </div>
                                        </div>

                                        <button className="eb-btn-base eb-btn-home" style={{marginTop: '2vh'}} onClick={this.close}>Inchide Banca</button>
                                    </div>
                                </div>
                            ) : activePage === 'create_pref' ? (
                                <div className="eb-form-page-container">
                                    <div className="eb-styled-form-box">
                                        <h2 className="eb-form-title">Numar Preferential</h2>
                                        <p style={{textAlign:'center', color:'#71717a', fontSize:'1vw'}}>Introdu numarul dorit (exact 6 cifre).</p>
                                        <input 
                                            type="text" 
                                            className="eb-styled-input" 
                                            placeholder="Ex: 777777" 
                                            maxLength={6} 
                                            value={prefNumber}
                                            onChange={(e) => this.setState({ prefNumber: e.target.value.replace(/\D/g, '') })}
                                        />
                                        <button className="eb-btn-base eb-btn-transfer" style={{padding: '1.8vw', fontSize: '1.2vw'}} onClick={() => this.createAccount(true)}>Confirma Crearea</button>
                                        <button className="eb-btn-base eb-btn-home" onClick={() => this.setState({ activePage: 'create_choice' })}>Inapoi</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="eb-form-page-container">
                                    {activePage === 'withdraw' && (
                                        <div className="eb-styled-form-box">
                                            <h2 className="eb-form-title">Retragere Numerar</h2>
                                            <input type="number" className="eb-styled-input" placeholder="Suma de retras (RON)" value={withdrawAmount} onChange={(e) => this.setState({ withdrawAmount: e.target.value })} />
                                            <button className="eb-btn-base eb-btn-withdraw" style={{padding: '1.8vw', fontSize: '1.2vw'}} onClick={this.handleWithdraw}>Confirma Retragerea</button>
                                            <button className="eb-btn-base eb-btn-home" onClick={() => this.setState({ activePage: 'dashboard' })}>Inapoi</button>
                                        </div>
                                    )}
                                    {activePage === 'deposit' && (
                                        <div className="eb-styled-form-box">
                                            <h2 className="eb-form-title">Depozit Numerar</h2>
                                            <input type="number" className="eb-styled-input" placeholder="Suma de depozitat (RON)" value={depositAmount} onChange={(e) => this.setState({ depositAmount: e.target.value })} />
                                            <button className="eb-btn-base eb-btn-deposit" style={{padding: '1.8vw', fontSize: '1.2vw'}} onClick={this.handleReplenish}>Confirma Depozitul</button>
                                            <button className="eb-btn-base eb-btn-home" onClick={() => this.setState({ activePage: 'dashboard' })}>Inapoi</button>
                                        </div>
                                    )}
                                    {activePage === 'transfer' && (
                                        <div className="eb-styled-form-box">
                                            <h2 className="eb-form-title">Transfer Bancar</h2>
                                            <input type="text" className="eb-styled-input" placeholder="IBAN-ul persoanei" value={transferTarget} onChange={(e) => this.setState({ transferTarget: e.target.value })} />
                                            <input type="number" className="eb-styled-input" placeholder="Suma de transferat (RON)" value={transferAmount} onChange={(e) => this.setState({ transferAmount: e.target.value })} />
                                            <button className="eb-btn-base eb-btn-transfer" style={{padding: '1.8vw', fontSize: '1.2vw'}} onClick={this.handleTransfer}>Confirma Transferul</button>
                                            <button className="eb-btn-base eb-btn-home" onClick={() => this.setState({ activePage: 'dashboard' })}>Inapoi</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState) => ({
    money: state.player.money
});

export default connect(mapStateToProps, {})(Bank);
