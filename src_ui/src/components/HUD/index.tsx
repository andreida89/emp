import React, { Component } from 'react';
import { connect } from 'react-redux';
import rpc from 'utils/rpc';
import { StoreState } from 'store';
import PlayerCash from 'components/Player/cash';
import TargetMenu from 'components/Target';
import Location from './location';
//import Binds from './binds';
import Online from './online';
//import Money from './money';
//import Date from './date';
import Speedometer from './speedometer';
//import Tasks from './tasks';
import Mic from './mic';
//import Ammo from './ammo';
import Hunger from './hunger';
import Thirst from './thirst';
import Viata from './viata';
import Armura from './armura';
import Stamina from './stamina';
import Interact from './interact';
import Call from './call';
import Offer from './offer';
import Level from './level';
import Capture from './capture';
//import Bonus from './bonus';
//import Speedo from './speedo/speedoCircle';

import Notificari from './notificari';
import Scare from './scare';
import AnuntGlobal from './anuntglobal';
import Intro from './intro';
import Notifi from './notifi';
import AlertaPolitie from './notificaripolitie';
import AlertaSindicat from './alertasindicat';
import ArataSindicat from './aratasindicat';
import ArataPrimarie from './arataprimarie';
import ArataBuletin from './aratabuletin';
import ArataPolitie from './aratapolitie';
import ArataSmurd from './aratasmurd';

type Props = {} & ReturnType<typeof mapStateToProps>;
type State = {
	binds: {
		[name: string]: string;
	};
	position: {
		bottom: number;
		left: number;
	};
};

class HUD extends Component<Props, State> {
	readonly state: State = {
		binds: {},
		position: {
			bottom: 2,
			left: 10
		}
	};

	componentDidMount() {
		rpc.callClient('HUD-GetBinds').then((binds) => this.setState(() => ({ binds })));

		this.getDistToMinimap();
	}

	async getDistToMinimap() {
		const data = await rpc.callClient('HUD-GetMinimapAnchor');

		this.setState(() => ({
			position: { left: data.rightX * 100, bottom: (1 - data.bottomY) * 100 }
		}));
	}

	render() {
		const { binds, position } = this.state;
		const { app, hud, player, phone } = this.props;

		return (
			<div className="hud" style={{ display: hud.visible ? 'block' : 'none' }}>
				
				<Online playerId={player.id} count={app.online} />
				
				<Interact />
				<Offer />
				<Level />

				<div
					className="hud_minimap"
					style={{
						left: `calc(${position.left}% + 2%)`,
						bottom: `calc(${position.bottom}% + 2.5px)`
					}}
				>
					<Hunger amount={player.satiety} />
					<Thirst amount={player.thirst} />
					<Viata />
					<Armura />
					<Stamina />
					<Mic bind={binds.mic} />
					<Location />

					{phone.call?.type === 'incoming' && <Call info={phone.call} />}
				</div>

				<div className="hud_container">
					<Speedometer binds={binds} />
					
				</div>
				
				<AnuntGlobal />
				<Intro />
				<Scare />
				<Notificari />
				<Notifi />
				<AlertaPolitie />
				<AlertaSindicat />
				<ArataSindicat />
				<ArataBuletin />
				<ArataPrimarie />
				<ArataPolitie />
				<ArataSmurd />
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
