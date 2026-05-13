import React from 'react';

type Props = {
	description: string;
	requirements: string;
};

export default function JobInfo({ description, requirements }: Props) {
	return (
		<div className="ujob-job-info">
			<h3 className="ujob-job-info-title">Informatii</h3>

			<p className="ujob-job-info-requirements">
				Cerinte: <strong>{requirements}</strong>.
			</p>

			<div className="ujob-job-info-descr">
				{description.split('\n').map((item, index) => (
					<p key={index}>{item}</p>
				))}
			</div>
		</div>
	);
}
