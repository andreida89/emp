import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';
import PrimaryTitle from 'components/Common/primary-title';
import TotalPrice from 'components/Common/total-price';
import GradientButton from 'components/Common/gradient-button';
import OutlineButton from 'components/Common/outline-button';
import vehicleList from 'data/vehicles.json';

type Props = {} & RouteComponentProps;
type State = {
	model: string;
	price: number;
};

export default class VehicleDump extends Component<Props, State> {
	readonly state: State = {
		model: '',
		price: 0
	};

	componentDidMount() {
		this.setState(() => this.props.location.state);
	}

	async recycleVehicle() {
		await rpc.callServer('VehicleDump-Recycle');
		rpc.callClient('Browser-HidePage');
	}

	render() {
		const { model, price } = this.state;

		return (
			<div className="vehicle-dump">
				<PrimaryTitle className="vehicle-dump_title">R.E.M.A.T</PrimaryTitle>

				<div className="vehicle-dump_container">
					<div className="vehicle-dump_info">
						<div className="vehicle-dump_info-item">
							Marca si modelul: <b>{(vehicleList as any)[model] || model}</b>
						</div>
					</div>

					<TotalPrice className="vehicle-dump_price" title="Primesti:" value={price} />
				</div>

				<div className="vehicle-dump_footer">
					<OutlineButton isClose>Anulare</OutlineButton>
					<GradientButton onClick={this.recycleVehicle.bind(this)}>
						Comfirma
					</GradientButton>
				</div>
			</div>
		);
	}
}
