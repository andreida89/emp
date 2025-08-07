import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';

type Answer = {
	text: string;
	callback?: any;
	disabled?: boolean;
};

type Props = {} & RouteComponentProps;
type State = {
	title: string;
	text: string;
	answers: Answer[];
};

export default class Dialog extends Component<Props, State> {
	readonly state: State = {
		title: '',
		text: '',
		answers: []
	};

	componentDidMount() {
		this.setState(() => this.props.location.state);
	}

	sendAnswer(index: number) {
		rpc.callClient('Dialog-SendAnswer', index);
	}

	render() {
		const { title, text, answers } = this.state;

		return (
			<div className="dialog-overlay">
				<div className="dialog-bottom-wrapper">
					<div className="dialog_container">
						<h2 className="dialog_title">{title}</h2>
						<p className="dialog_text">{text}</p>
						<div className="dialog_answers inventory-card-actions2">
							{answers.map((item, index) => (
								<button
									key={index}
									type="button"
									onClick={() => this.sendAnswer(index)}
									disabled={item.disabled}
								>
									{item.text}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
