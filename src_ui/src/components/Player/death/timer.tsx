import React, { Component } from 'react';

type Props = {
	duration: number;
	short?: boolean;
};
type State = {
	time: number;
};

export default class DeathTimer extends Component<Props, State> {
	interval?: NodeJS.Timeout;

	constructor(props: Props) {
		super(props);
		this.state = { time: props.duration };
	}

	componentDidMount() {
		this.startTimer(this.props.duration);
	}

	componentDidUpdate(prevProps: Props) {
		if (this.props.duration !== prevProps.duration) {
			this.startTimer(this.props.duration);
		}
	}

	componentWillUnmount() {
		if (this.interval) clearInterval(this.interval);
	}

	startTimer(newDuration: number) {
		if (this.interval) clearInterval(this.interval);
		this.setState({ time: newDuration });
		this.interval = setInterval(() => {
			this.setState((prev) => {
				if (prev.time <= 1) {
					if (this.interval) clearInterval(this.interval);
					return { time: 0 };
				}
				return { time: prev.time - 1 };
			});
		}, 1000);
	}

	getValue() {
		const { time } = this.state;
		const minutes = Math.floor(time / 60)
			.toString()
			.padStart(2, '0');
		const seconds = Math.floor(time % 60)
			.toString()
			.padStart(2, '0');
		return `${minutes}:${seconds}`;
	}

	render() {
		const { short } = this.props;

		if (short) {
			return <span>{this.getValue()}</span>;
		}
		return (
			<div className="death_timer">
				<div className="death_timer-container">
					<h3 className="death_timer-title">Esti lesinat...</h3>
					<span className="death_timer-value">{this.getValue()}</span>
				</div>
			</div>
		);
	}
}
