import React, { Component } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import images from 'utils/images';
import items from 'data/inventory.json';

type Props = {
	id: number;
	name: string;
	use?: (id: number) => void;
	separate: () => void;
	loadAmmo?: () => void;
	close: () => void;
	onRemoveAttachments?: (cell: number) => void;
};

type State = {
	position: {
		x: number;
		y: number;
	};
};

export default class InventorySelected extends Component<Props, State> {
	readonly state: State = {
		position: {
			x: 0,
			y: 0
		}
	};

	componentDidMount() {
		this.getPosition();
	}

	getPosition() {
		const rect = document
			.getElementById(`item-${this.props.id}`)
			?.getBoundingClientRect();

		if (rect) {
			const cardWidth = 320;
			const cardHeight = 120;
			const pointerHeight = 18;
			let x = rect.left + rect.width / 2 - cardWidth / 2;
			let y = rect.top + window.scrollY - cardHeight - pointerHeight + 6;
			const minX = 8, minY = 8;
			const maxX = window.innerWidth - cardWidth - 8;
			const maxY = window.innerHeight - cardHeight - 8;
			x = Math.max(minX, Math.min(x, maxX));
			y = Math.max(minY, Math.min(y, maxY));
			this.setState({ position: { x, y } });
		}
	}

	handleRemoveAttachments = () => {
		if (this.props.onRemoveAttachments)
			this.props.onRemoveAttachments(this.props.id);
		this.props.close();
	};

	getItemInfo() {
		return (items as any)[this.props.name] ?? { name: this.props.name, weight: 1 };
	}

	render() {
		const { id, use, separate, close } = this.props;
		const { position } = this.state;
		const info = this.getItemInfo();
		const imgSrc = images.getImage(`${this.props.name}.png`, 'inventory');

		return (
			<OutsideClickHandler onOutsideClick={close}>
				<div
					className="inventory-card"
					style={{ top: position.y, left: position.x, position: 'absolute' }}
				>
					<div className="inventory-card-pointer"></div>
					<div className="inventory-card-top">
						<div className="inventory-card-image-wrap">
							<img src={imgSrc} alt={info.name} className="inventory-card-image" />
							<span className="inventory-card-badge"></span>
						</div>
						<div className="inventory-card-content">
							<div className="inventory-card-title">{info.name.toUpperCase()}</div>
							<div className="inventory-card-weight">{info.weight}KG</div>
						</div>
					</div>
					<div className="inventory-card-actions">
						{info.type === 'ammo' || info.type === 'munitie' ? (
							<button className="use-btn" disabled={!use} onClick={() => use && use(id)}>
								INCARCA
							</button>
						) : (
							<button className="use-btn" disabled={!use} onClick={() => use && use(id)}>
								FOLOSESTE
							</button>
						)}
						<span className="divider"></span>
						<button className="separate-btn" onClick={separate}>
							SEPARA
						</button>
						{info.type === 'weapon' && (
							<>
								<span className="divider"></span>
								<button
									className="remove-attachments-btn"
									onClick={this.handleRemoveAttachments}
								>
									SCOATE ATASAMENTE
								</button>
							</>
						)}
					</div>
				</div>
			</OutsideClickHandler>
		);
	}
}
