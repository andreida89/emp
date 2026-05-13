import React, { useState, useEffect } from 'react';

type Props = {
	current: number;
	progress: number;
	selectLeveL: (level: number) => void;
};

export default function JobLevel({ current, progress, selectLeveL }: Props) {
	const [levels, setLevels] = useState<number[]>([]);

	useEffect(() => {
		if (current > levels.length) setLevels([...Array(current + 1).keys()]);
	}, [current, levels.length]);

	return (
		<div className="ujob-job-level">
			<div className="ujob-job-level-current">
				<span>Nivel {current + 1}</span>
			</div>

			<div className="ujob-job-level-progress-container">
                <div 
                    className="ujob-job-level-progress-bar" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
		</div>
	);
}
