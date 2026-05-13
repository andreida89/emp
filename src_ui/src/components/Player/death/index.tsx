import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import images from 'utils/images';
import rpc from 'utils/rpc';
import Timer from './timer';

type Props = RouteComponentProps<{}, {}, { duration?: number; medics?: number }>;

type State = {
	respawnCountdown: number;
	showDeathButton: boolean;
};

export default class Death extends React.Component<Props, State> {
	private respawnInterval?: NodeJS.Timeout;

	constructor(props: Props) {
		super(props);
		this.state = {
			respawnCountdown: 180, // 3 min default
			showDeathButton: false
		};
	}

	componentDidMount() {
		this.startRespawnCountdown();
	}

	componentDidUpdate(prevProps: Props) {
		if (this.props.location.state?.duration !== prevProps.location.state?.duration) {
			this.startRespawnCountdown();
		}
	}

	componentWillUnmount() {
		if (this.respawnInterval) clearInterval(this.respawnInterval);
	}

	startRespawnCountdown() {
		if (this.respawnInterval) clearInterval(this.respawnInterval);

		const totalDeathTime = 600; // 10 minutes (matching this.deathTimeout in server)
		const waitBeforeButton = 180; // 3 minutes
		
		const duration = this.props.location.state?.duration;
		const remaining = duration !== undefined ? Math.floor(duration / 1000) : totalDeathTime;
		const elapsed = Math.max(0, totalDeathTime - remaining);
		const currentWait = Math.max(0, waitBeforeButton - elapsed);

		this.setState({ 
			respawnCountdown: currentWait, 
			showDeathButton: currentWait <= 0 
		});

		if (currentWait > 0) {
			this.respawnInterval = setInterval(() => {
				this.setState((prev) => {
					const next = prev.respawnCountdown - 1;
					if (next <= 0) {
						if (this.respawnInterval) clearInterval(this.respawnInterval);
						return {
							respawnCountdown: 0,
							showDeathButton: true
						};
					}
					return {
						respawnCountdown: next,
						showDeathButton: false
					};
				});
			}, 1000);
		}
	}

	die = () => {
		rpc.callClient('Player-ClientDie');
	};

	render() {
		const { respawnCountdown, showDeathButton } = this.state;
		const minutes = String(Math.floor(respawnCountdown / 60)).padStart(2, '0');
		const seconds = String(respawnCountdown % 60).padStart(2, '0');

		const duration = this.props.location.state?.duration;
		const deathDuration = duration !== undefined ? Math.floor(duration / 1000) : 600; // default 10 minute

		return (
			<div className="death death--cover">
				<img src={images.getImage('schelet.png')} alt="schelet" className="death_schelet" />

				<div className="death_block">
					<h1 className="death_title">
						<span className="death_title-main">ESTI IN STARE</span>
						<br />
						<span className="death_title-de">DE</span>{' '}
						<span className="death_title-lesin">LESIN</span>
					</h1>

					<div className="death_autotext">
						RESPAWN AUTOMAT IN{' '}
						<span className="death_autotext-timer">
							<Timer duration={deathDuration} short />
						</span>
					</div>

					<div className="death_button">
						{showDeathButton ? (
							<button className="death_btn" onClick={this.die}>
								ALEG MOARTEA
							</button>
						) : (
							<button className="death_btn disabled" disabled>
								RESPAWN IN <span className="death_btn-timer">{minutes}:{seconds}</span>
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}
}
