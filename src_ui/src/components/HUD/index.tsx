import React, { Component } from 'react';
import { connect } from 'react-redux';
import rpc from 'utils/rpc';
import { StoreState } from 'store';
//import PlayerCash from 'components/Player/cash';
import TargetMenu from 'components/Target';
import Location from './location';
import Binds from './binds';
import Online from './online';
import Money from './money';
import Date from './date';
import Speedometer from './speedometer';
import Tasks from './tasks';
import Mic from './mic';
//import Ammo from './ammo';
import StatusIcons from './status-icons';
import Interact from './interact';
import Call from './call';
import Offer from './offer';
import Level from './level';
import Capture from './capture';
//import Bonus from './bonus';

import Scare from './scare';
import AnuntGlobal from './anuntglobal';
import Intro from './intro';
import AlertaPolitie from './notificaripolitie';
import AlertaSindicat from './alertasindicat';
import ArataSindicat from './aratasindicat';
import ArataPrimarie from './arataprimarie';
import ArataBuletin from './aratabuletin';
import ArataPolitie from './aratapolitie';
import ArataUMU from './arataumu';
import Notifications from './notifi';

type Props = {} & ReturnType<typeof mapStateToProps>;
type State = {
	binds: {
		[name: string]: string;
	};
	position: {
		bottom: number;
		left: number;
		minimapLeft?: number;
	};
	hudSettings: {
		showLogo: boolean;
		showIdUsers: boolean;
		showMoneyCash: boolean;
		showMissions: boolean;
		showSpeedometer: boolean;
		showHealthArmor: boolean;
		showFoodWater: boolean;
		showStamina: boolean;
		showMic: boolean;
		showLocation: boolean;
		showMinimap: boolean;
		showChat: boolean;
		showBinds: boolean;
	};
};

class HUD extends Component<Props, State> {
	readonly state: State = {
		binds: {},
		position: {
			bottom: 2,
			left: 10
		},
		hudSettings: {
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
		}
	};

	componentDidMount() {
		rpc.callClient('HUD-GetBinds').then((binds) => this.setState(() => ({ binds })));
		this.getDistToMinimap();

		if ((window as any).lastHudSettingsVisibility) {
			try {
				const settings = JSON.parse((window as any).lastHudSettingsVisibility);
				this.setState((prevState) => ({ hudSettings: { ...prevState.hudSettings, ...settings } }));
			} catch(e) {}
		}

		(window as any).updateHudUiSettings = (json: string) => {
			try {
				const settings = JSON.parse(json);
				if (settings.visibility) {
					this.setState((prevState) => ({ hudSettings: { ...prevState.hudSettings, ...settings.visibility } }));
				}
				if (settings.styles) {
					this.setState((prevState) => ({ hudSettings: { ...prevState.hudSettings, ...settings.styles } }));
				}
			} catch(e) {}
		};

		window.addEventListener('adminMenuToggled', this.handleAdminMenuToggled);
	}

	componentWillUnmount() {
		delete (window as any).updateHudUiSettings;
		window.removeEventListener('adminMenuToggled', this.handleAdminMenuToggled);
	}

	handleAdminMenuToggled = () => {
		this.forceUpdate();
	};

	async getDistToMinimap() {
		const data = await rpc.callClient('HUD-GetMinimapAnchor');

		this.setState(() => ({
			position: { 
				left: data.rightX * 100, 
				minimapLeft: data.leftX * 100,
				bottom: (1 - data.bottomY) * 100 
			}
		}));
	}

	render() {
		const { binds, position, hudSettings } = this.state;
		const { app, hud, player, phone } = this.props;

		const showMinimapContent = player.hasSmartwatch || player.inVehicle;

		return (
			<div className="hud" style={{ display: hud.visible ? 'block' : 'none' }}>
				<Online 
					playerId={player.id} 
					count={app.online} 
					showLogo={hudSettings.showLogo} 
					showIdUsers={hudSettings.showIdUsers} 
				/>				
				{hudSettings.showMoneyCash && <Money cash={player.money.cash} bank={player.money.bank} />}
				<Interact />
				<Offer />
				<Level />
				{hudSettings.showMissions && hud.tasks && <Tasks items={player.tasks} />}
				{hudSettings.showBinds && !(window as any).adminMenuOpen && <Binds items={binds} />}

				<div
					className="hud_minimap"
					style={{
						left: `calc(${position.left}% + 2%)`,
						bottom: `calc(${position.bottom}% + 2.5px)`,
						display: showMinimapContent ? 'block' : 'none'
					}}
				>
					{hudSettings.showLocation && <Location />}
					{phone.call?.type === 'incoming' && <Call info={phone.call} />}
				</div>

				<StatusIcons 
					showHealthArmor={hudSettings.showHealthArmor} 
					showFoodWater={hudSettings.showFoodWater} 
					showStamina={hudSettings.showStamina} 
				/>

				{hudSettings.showMic && (
					<div
						style={{
							position: 'absolute',
							left: showMinimapContent ? `calc(${position.left}% + 1vw)` : `calc(${position.minimapLeft || (position.left - 15)}% + 1vw)`,
							bottom: `calc(${position.bottom}% + 0.5vw)`,
							transition: 'left 0.3s ease',
							zIndex: 10
						}}
					>
						<Mic bind={binds.mic} />
					</div>
				)}
                
				{hudSettings.showSpeedometer && (
					<div className="hud_container">
						<Speedometer binds={binds} />
					</div>
				)}
				
				<AnuntGlobal />
				<Intro />
				<Scare />
				<AlertaPolitie />
				<AlertaSindicat />
				<ArataSindicat />
				<ArataBuletin />
				<ArataPrimarie />
				<ArataPolitie />
				<ArataUMU />
				<Notifications />
				<TargetMenu />

				{hud.capture && <Capture {...hud.capture} />}
			</div>
		);
	}
}

const mapStateToProps = (state: StoreState) => ({
	app: state.app,
	hud: state.hud,
	player: state.player,
	phone: state.phone
});

export default connect(mapStateToProps, {})(HUD);