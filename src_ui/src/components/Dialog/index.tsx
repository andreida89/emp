import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';
import './meniu-interactiune.css';

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
        document.addEventListener('keydown', this.handleKeyDown);
	}

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
        }
    }

	sendAnswer(index: number) {
		rpc.callClient('Dialog-SendAnswer', index);
	}
    
    closeDialog = () => {
        rpc.callClient('Dialog-SendAnswer', -1);
    }

	render() {
		const { title, text, answers } = this.state;

		return (
			<div className="dialog-inter-overlay">
				<div className="dialog-inter-card">
                    <div className="dialog-inter-top-bar">
                        <div className="dialog-inter-title">{title}</div>
                        <button 
                            className="dialog-inter-close-btn" 
                            onClick={this.closeDialog}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <span style={{ transform: 'rotate(45deg)', display: 'inline-block' }}>+</span>
                        </button>
                    </div>
					<div className="dialog-inter-desc-box">
						<p className="dialog-inter-desc-text">{text}</p>
					</div>
					<div className="dialog-inter-buttons-row">
						{answers.map((item, index) => (
							<button
								key={index}
								type="button"
								className={`dialog-inter-btn ${index === answers.length - 1 ? 'dialog-inter-btn-refuz' : 'dialog-inter-btn-accept'}`}
								onClick={() => this.sendAnswer(index)}
								disabled={item.disabled}
							>
								{item.text}
							</button>
						))}
					</div>
				</div>
			</div>
		);
	}
}
