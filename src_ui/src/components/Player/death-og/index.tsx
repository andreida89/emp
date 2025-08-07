import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { RouteComponentProps } from 'react-router-dom';
import { showNotification } from 'utils/notifications';
import PrimaryTitle from 'components/Common/primary-title';
import Timer from './timer';

type Props = {} & RouteComponentProps;
type State = {
	duration: number;
	medics: number;
	showDeathButton: boolean;
};

export default class Death extends Component<Props, State> {
	readonly state: State = {
		duration: 0,
		medics: 0,
		showDeathButton: false // Initially hide the button
	};

	componentDidMount() {
		this.setState(() => this.props.location.state);

		// Show the "Alege moartea" button after 3 minutes (180000ms)
		setTimeout(() => {
			this.setState({ showDeathButton: true });
		}, 180000);
	}

	die() {
		rpc.callClient('Player-ClientDie');
	}

	callMedic() {
		rpc
			.callServer('EmsCalls-Create')
			.then(() => showNotification('info', 'Apelul dumneavoastra a fost inregistrat'));
	}

	render() {
		const { duration, medics, showDeathButton } = this.state;

		return (
			<div className="death">
				<div className="death_section death_section--danger">
					<PrimaryTitle className="death_title">Moarte (Respawn)</PrimaryTitle>

					<div className="death_section-container">
						{/* Hide the button for 3 minutes */}
						{showDeathButton ? (
							<button className="death_btn" onClick={this.die}>
								<span>Aleg moartea</span>
							</button>
						) : (
							<p className="death_descr">Butonul va fi disponibil in 3 minute...</p>
						)}

						<p className="death_descr">Vei fi declarat decedat si vei primi respawn</p>
					</div>
				</div>

				<Timer duration={duration / 1000} />

				<div className="death_section death_section--safe">
					<PrimaryTitle className="death_title">Ajutor medical</PrimaryTitle>

					<div className="death_section-container">
						<button className="death_btn" onClick={this.callMedic}>
							<span>Semnal de ajutor</span>
						</button>

						<p className="death_descr">
							Sunt <b>{medics}</b> medici disponibili pentru apel.
						</p>
					</div>
				</div>
			</div>
		);
	}
}
