import React from 'react';
import PrimaryTitle from 'components/Common/primary-title';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';

type Props = {
	submit: () => void;
	cancel: () => void;
};

export default function HouseConfirm({ submit, cancel }: Props) {
	return (
		<div className="house_confirm">
			<div className="house_confirm-container">
				<PrimaryTitle className="house_confirm-title">
					Vinde casa agentiei imobiliare
				</PrimaryTitle>

				<p className="house_confirm-remark">
				Sunteti sigur ca doriti <b>sa vindeti casa agentiei imobiliare</b>?
				</p>

				<div className="house_confirm-buttons">
					<OutlineButton onClick={cancel}>Anuleaza</OutlineButton>
					<GradientButton onClick={submit}>Vinde</GradientButton>
				</div>
			</div>
		</div>
	);
}
