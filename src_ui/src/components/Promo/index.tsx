import React from 'react';
import rpc from 'utils/rpc';
import GradientButton from 'components/Common/gradient-button';
import PrimaryTitle from 'components/Common/primary-title';

export default function Promo() {
	return (
		<div className="promo">
			<div className="promo_container">
				<PrimaryTitle className="promo_title">Primii pasi</PrimaryTitle>

				<div className="promo_remark">
				Pentru o experienta completa, nu uitati sa activati sunetul in joc
				</div>

				<div className="promo_video">
					<iframe
						title="Empire"
						src="https://www.youtube.com/embed/PBnjkfUZ2vs"
					></iframe>
				</div>

				<GradientButton onClick={() => rpc.callServer('Character-ShowCreator')}>
					Incepe
				</GradientButton>
			</div>
		</div>
	);
}
