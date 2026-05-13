import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { RouteComponentProps } from 'react-router-dom';
import withPayment, { WrappedProps } from 'components/Common/with-payment';
import withRotation from 'components/Common/with-rotation';
import Appearance from 'components/Character/appearance';
import TotalPrice from 'components/Common/total-price';
import Hint from 'components/Common/hint';

type Props = {} & WrappedProps & RouteComponentProps;
type State = {
	price: number;
};

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>
);

class Barbershop extends Component<Props, State> {
	readonly state: State = {
		price: 0
	};

	handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' || e.keyCode === 27) {
			e.stopPropagation();
			e.preventDefault();
		}
	}

	componentDidMount() {
		this.setState(() => this.props.location.state);
		document.addEventListener('keydown', this.handleKeyDown, true);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown, true);
	}

	async buy(payment: string) {
		const data = await rpc.callClient('Barbershop-GetData');

		await rpc.callServer('Barbershop-Buy', [data, payment]);
	}

	close() {
		rpc.callClient('Barbershop-CloseMenu');
	}

	render() {
		const { price } = this.state;

		return (
<div className="barbershop">
    <style>{`
      .hud, .hud_minimap, #minimap { display: none !important; visibility: hidden !important; }
      .barbershop .character_options { 
          position: absolute !important; 
          left: -58vw !important; 
          top: 50% !important; 
          width: 0 !important; 
          height: 0 !important; 
          z-index: 10 !important; 
          margin: 0 !important;
      }
      .barbershop .character_options-list { 
          position: relative !important; 
          width: 0 !important; 
          height: 0 !important; 
          list-style: none !important; 
          padding: 0 !important; 
          margin: 0 !important; 
      }
      .barbershop .character_options-item { 
          position: absolute !important; 
          right: 0 !important; 
          top: 0 !important; 
          width: 18vw !important; 
          height: 0 !important; 
          display: flex !important; 
          align-items: center !important; 
          justify-content: flex-start !important; 
          transform-origin: right center !important; 
          background: none !important; 
          border: none !important; 
          cursor: pointer !important; 
          transition: all 0.3s !important; 
          margin: 0 !important; 
      }
      .barbershop .character_options-item > span { display: none !important; }
      
      .barbershop .character_options-item:nth-child(1) { transform: rotate(45deg); }
      .barbershop .character_options-item:nth-child(2) { transform: rotate(22.5deg); }
      .barbershop .character_options-item:nth-child(3) { transform: rotate(0deg); }
      .barbershop .character_options-item:nth-child(4) { transform: rotate(-22.5deg); }
      .barbershop .character_options-item:nth-child(5) { transform: rotate(-45deg); }
      
      .barbershop .character_options-item .icon {
          width: 3.5vw !important;
          height: 3vw !important;
          background: #141414 !important;
          border: 0.1vw solid rgba(255,255,255,0.05) !important;
          border-radius: 0.4vw !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: 0.3s !important;
          clip-path: polygon(0 0, 100% 15%, 100% 85%, 0 100%) !important;
      }

      .barbershop .character_options-item.active .icon {
          background: #f1c40f !important;
          transform: scale(1.05) !important;
          z-index: 2 !important;
      }

      .barbershop .character_options-item .icon img { 
          width: 1.6vw !important; 
          height: 1.6vw !important; 
          display: block !important; 
          filter: brightness(0) saturate(100%) invert(81%) sepia(49%) saturate(1251%) hue-rotate(352deg) brightness(101%) contrast(105%) !important; 
      }
      .barbershop .character_options-item.active .icon img { 
          filter: brightness(0) !important; 
      }
      
      .barbershop .hint_icon { filter: brightness(0) saturate(100%) invert(81%) sepia(49%) saturate(1251%) hue-rotate(352deg) brightness(101%) contrast(105%) !important; }
      .barbershop .hint_text { color: #f1c40f !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; }
      
      .barbershop .mh-shop-shop-btn { padding: 0.8vw 1.5vw !important; border-radius: 0.5vw !important; font-weight: 900 !important; font-style: italic !important; font-size: 0.8vw !important; text-transform: uppercase !important; border: none !important; cursor: pointer !important; transition: 0.3s !important; margin-left: auto !important; }
      .barbershop .mh-shop-btn-yellow { background: #f1c40f !important; color: #000 !important; }
      .barbershop .mh-shop-btn-yellow:hover { background: #dfb30a !important; }

      .barbershop .mh-shop-action-buttons { display: flex !important; gap: 0.5vw !important; align-items: center !important; width: 100% !important; }

      .barbershop .mh-shop-btn-close-square {
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
      .barbershop .mh-shop-btn-close-square:hover {
          background: #e62222 !important;
          transform: rotate(360deg) !important;
      }
      .barbershop .mh-shop-x-icon {
          transform: rotate(45deg) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
      }
      .barbershop .mh-shop-x-icon svg {
          width: 1.8vw !important;
          height: 1.8vw !important;
          stroke: white !important;
          stroke-width: 3 !important;
      }

      .barbershop .character_right_panel {
          position: fixed !important;
          right: 4vw !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 1.5vw !important;
          align-items: flex-end !important;
          width: 15vw !important;
      }
      .barbershop .character_hint {
          position: absolute !important;
          right: 4vw !important;
          bottom: 4vw !important;
      }
    `}</style>
    <Hint className="character_hint" action="drag">
        Rotirea personajului
    </Hint>

    <button className="mh-shop-btn-close-square" onClick={this.close.bind(this)} style={{ position: 'fixed', top: '4vw', right: '4vw', zIndex: 100 }}>
        <div className="mh-shop-x-icon">
            <PlusIcon />
        </div>
    </button>

    <div className="barbershop_container">
        <div className="character_right_panel">
            <Appearance />

            <TotalPrice className="barbershop_price" title="Pret:" value={price} />

            <div className="mh-shop-action-buttons">
                <button className="mh-shop-shop-btn mh-shop-btn-yellow" onClick={() => this.props.showPayment(this.buy.bind(this))}>
                    PLĂTEȘTE
                </button>
            </div>
        </div>
    </div>
</div>
		);
	}
}

export default withPayment(withRotation(Barbershop));

