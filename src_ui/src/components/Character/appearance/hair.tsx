import React from 'react';
import Selector from '../selector';

type Props = {
	style: number;
	color: number;
	highlight: number;

	update: (prop: string, value: number) => void;
};

export default function Hair({ style, color, highlight, update }: Props) {
	return (
<div>
    <Selector
        title="Tunsoare"
        items={[...Array(74).keys()]}
        value={style}
        onChange={(value) => update('style', value)}
    />
    <Selector
        title="Culoare principala"
        items={[...Array(71).keys()]}
        value={color}
        onChange={(value) => update('color', value)}
    />
    <Selector
        title="Culoare suplimentara"
        items={[...Array(71).keys()]}
        value={highlight}
        onChange={(value) => update('highlight', value)}
    />
</div>

	);
}
