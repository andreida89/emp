import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import Navigation from '../../partials/navigation';
import Button from '../../partials/button';
import Group from '../../partials/group';
import List from './list';

const items: { [name: string]: string } = {
    cursor: 'Cursor',
    noHUD: 'Vizibilitate interfata',
    mic: 'Chat vocal',
    target: 'Meniu jucator',
    inventory: 'Inventar',
    tablet: 'Tableta organizatiei',
    engine: 'Motor',
    lock: 'Incuietoare vehicul',
    seatbelt: 'Centura de siguranta',
    cruise: 'Cruise control',
    left_ind: 'Semnal stanga',
    right_ind: 'Semnal dreapta',
    quick_1: 'Acces rapid 1',
    quick_2: 'Acces rapid 2',
    quick_3: 'Acces rapid 3',
    quick_4: 'Acces rapid 4'
};

type Props = {
	close: () => void;
};
type State = {
	binds: { [name in keyof typeof items]: string };
	selected?: string;
};

export default class SettingsKeys extends Component<Props, State> {
	readonly state: State = {
		binds: {}
	};

	componentDidMount() {
		this.getBindsFromClient();
	}

	getBindsFromClient() {
		rpc.callClient('HUD-GetBinds').then((data) => this.setState(() => ({ binds: data })));
	}

	selectKeyBind(name?: string) {
		this.setState(() => ({ selected: name }));
	}

	async saveKeyBind(key: string) {
		const { selected, binds } = this.state;

		if (!selected || binds[selected] === key) return;

		try {
			await rpc.callClient('Binder-Rebind', [selected, key]);

			this.setState(() => ({ binds: { ...binds, [selected]: key } }));
		} catch (error) {
			showNotification('error', 'Aceasta tasta este deja utilizata');
		}
	}

	render() {
		const { selected, binds } = this.state;

		return (
			<div className="settings_keys">
				{selected ? (
					<List
						name={items[selected]}
						current={binds[selected]}
						selectKey={this.saveKeyBind.bind(this)}
						close={this.selectKeyBind.bind(this, undefined)}
					/>
				) : (
					<>
						<Navigation
							title="Atribuire taste"
							close={{ title: '', onClick: this.props.close }}
						/>

						<Group className="settings_keys-list">
							{Object.entries(items).map(([name, title]) => (
								<Button
									icon="arrow"
									key={name}
									current={binds[name]}
									onClick={this.selectKeyBind.bind(this, name)}
								>
									{title}
								</Button>
							))}
						</Group>
					</>
				)}
			</div>
		);
	}
}
