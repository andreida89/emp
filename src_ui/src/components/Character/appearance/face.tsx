import React from 'react';
import Slider from '../slider';

type Item = {
	id: number;
	name: string;
	max: number;
	gender?: number;
};

const items: Item[] = [
    {
        id: 0,
        name: 'Cosuri',
        max: 23
    },
    {
        id: 3,
        name: 'Imbatranire',
        max: 14
    },
    {
        id: 6,
        name: 'Nuanta fetei',
        max: 11
    },
    {
        id: 7,
        name: 'Daune solare',
        max: 10
    },
    {
        id: 9,
        name: 'Pistrui pe fata',
        max: 17
    }
];


type Props = {
	update: (id: number, value: number) => void;
	values: [number, number][];
};

export default function Other({ values, update }: Props) {
	return (
		<div>
			{items.map((item) => (
				<Slider
					key={item.name}
					title={item.name}
					value={values[item.id][0]}
					min={-1}
					max={item.max}
					onChange={(value) => update(item.id, value)}
				/>
			))}
		</div>
	);
}
