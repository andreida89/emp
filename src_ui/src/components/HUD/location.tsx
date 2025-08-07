import React, { Component } from 'react';
import classNames from 'classnames';
import rpc from 'utils/rpc';

type State = typeof initialState;

const initialState = {
	street: 'Robe Street',
	zone: 'La Puerta',
	greenZone: false
};

export default class Location extends Component<{}, State> {
	readonly state = initialState;

	componentDidMount() {
		rpc.register('HUD-SetLocation', (data) => this.setState(data));

		this.getCurrentLocation();
	}

	componentWillUnmount() {
		rpc.unregister('HUD-SetLocation');
	}

	async getCurrentLocation() {
		const location = await rpc.callClient('getPlayerLocation');

		this.setState(() => location);
	}

	render() {
		const { street, zone, greenZone } = this.state;

return (
	<div className={classNames('hud_location', { 'hud_location--green': greenZone })}>
		<i
			className="fa-solid fa-location-dot hud_location-icon"
			style={{ color: greenZone ? '#3ce845' : '#FFD43B' }}
		></i>&nbsp;TE AFLI PE STRADA:&nbsp; <span className="hud_location-street" style={{ color: greenZone ? '#3ce845' : '#FFD43B' }}>{street}</span>&nbsp;
		 DIN CARTIERUL:&nbsp; <span className="hud_location-zone" style={{ color: greenZone ? '#3ce845' : '#FFD43B' }}>{zone}</span>
	</div>
);

	}
}
