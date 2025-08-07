import React from 'react';
import images from 'utils/images';
import rpc from 'utils/rpc';
import Timer from './timer';

type Props = {
	duration?: number; // ms
};

type State = {
	respawnCountdown: number;
	showDeathButton: boolean;
};

export default class Death extends React.Component<Props, State> {
	private respawnInterval?: NodeJS.Timeout;

	readonly state: State = {
		respawnCountdown: 180, // 3 min
		showDeathButton: false
	};

	componentDidMount() {
		this.startRespawnCountdown();
	}

	componentWillUnmount() {
		if (this.respawnInterval) clearInterval(this.respawnInterval);
	}

	startRespawnCountdown() {
		if (this.respawnInterval) clearInterval(this.respawnInterval);
		this.setState({ respawnCountdown: 180, showDeathButton: false }); // asigură reset

		this.respawnInterval = setInterval(() => {
this.setState((prev) => {
    const next = prev.respawnCountdown - 1;
    if (next <= 0) {
        clearInterval(this.respawnInterval!);
        return {
            respawnCountdown: 0,
            showDeathButton: true
        };
    }
    return {
        respawnCountdown: next,
        showDeathButton: prev.showDeathButton // păstrezi mereu tipul corect
    };
});

		}, 1000);
	}

	die = () => {
		rpc.callClient('Player-ClientDie');
	};

	render() {
		const { respawnCountdown, showDeathButton } = this.state;
		const minutes = String(Math.floor(respawnCountdown / 60)).padStart(2, '0');
		const seconds = String(respawnCountdown % 60).padStart(2, '0');

		const deathDuration = this.props.duration ? Math.floor(this.props.duration / 1000) : 600; // default 10 minute

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
