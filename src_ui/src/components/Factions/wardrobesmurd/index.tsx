import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';
import withRotation from 'components/Common/with-rotation';
import Selector from 'components/Common/selector';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';
import Hint from 'components/Common/hint';
import Categories from './categories';

type Props = {} & RouteComponentProps;
type State = {
	activeCategory: string;
	items: number;
	colors: number;
	currentItem: number;
	currentColor: number;
	price: number;
	onDuty: boolean;
};

class FactionWardrobe extends Component<Props, State> {
	readonly state: State = {
		activeCategory: 'hats',
		items: 0,
		colors: 1,
		currentItem: 0,
		currentColor: 0,
		price: 0,
		onDuty: false
	};

	componentDidMount() {
		this.setState(() => ({
			...this.props.location.state,
			price: 0 // 🔧 forțăm prețul la 0
		}));
		this.setCategory(this.state.activeCategory);
	}

	async setCategory(name: string) {
		const amount: number = await rpc.callClient('FactionWardrobe-ChangeType', name);

		this.setState(() => ({
			activeCategory: name,
			items: amount,
			currentItem: 0,
			currentColor: 0
		}));
	}

	async changeItem(index: number) {
		await this.setState(() => ({ currentItem: index }));

		await rpc.callClient('FactionWardrobe-ChangeItem', index);
	}

buy = async () => {
	const { activeCategory, currentItem, currentColor } = this.state;

	const data = {
		type: activeCategory,
		index: currentItem,
		color: currentColor
	};

	await rpc.callServer('FactionWardrobe-BuyFreeSmurd', data);
};



	async startWorkSmurd() {
		await rpc.callServer('Factions-StartWorkSmurd');
		this.setState(() => ({ onDuty: true }));
	}

	async finishWorkSmurd() {
		if (!this.state.onDuty) return;

		await rpc.callServer('Factions-FinishWorkSmurd');
		this.setState(() => ({ onDuty: false }));
	}
	render() {
		const { activeCategory, items, currentItem, onDuty } = this.state;

		return (
			<div className="faction-wardrobe">
				<Hint className="faction-wardrobe_hint" action="drag">
				Rotire personaj
				</Hint>

				<div className="faction-wardrobe_container">
					<Categories
						current={activeCategory}
						setCategory={this.setCategory.bind(this)}
					/>

					<div className="faction-wardrobe_main">
						<Selector
							className="faction-wardrobe_selector"
							value={currentItem}
							items={[...Array(items).keys()]}
							onChange={this.changeItem.bind(this)}
						/>
					</div>
				</div>

				<div className="faction-wardrobe_buttons">
					{onDuty ? (
						<GradientButton color="purple" onClick={this.finishWorkSmurd.bind(this)}>
							OFF DUTY
						</GradientButton>
					) : (
						<GradientButton onClick={this.startWorkSmurd.bind(this)}>
							ON DUTY
						</GradientButton>
					)}
<GradientButton onClick={this.buy}>
	IN INVENTAR
</GradientButton>

					<OutlineButton onClick={() => rpc.callClient('FactionWardrobe-CloseMenu')}>
						Inchide
					</OutlineButton>
				</div>
			</div>
		);
	}
}
export default withRotation(FactionWardrobe);
