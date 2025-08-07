import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';
import Cell from './cell';

type Action = {
	title: string;
	icon?: string;
};

const actionList: { [name: string]: Action } = {
    invite: {
        title: 'Invita in organizatie',
        icon: 'handshake'
    },
    docs: {
        title: 'Arata legitimatia'
    },
    cuff: {
        title: 'Pune catuse',
        icon: 'handcuffs'
    },
    uncuff: {
        title: 'Scoate catusele',
        icon: 'handcuffs'
    },
    tie: {
        title: 'Foloseste legaturi',
        icon: 'cable_tie'
    },
    untie: {
        title: 'Taie legaturile',
        icon: 'cable_tie'
    },
    follow: {
        title: 'Trage dupa tine',
        icon: 'detain'
    },
    unfollow: {
        title: 'Elibereaza',
        icon: 'detain'
    },
    headsack_enable: {
        title: 'Pune sac pe cap',
        icon: 'sack'
    },
    headsack_disable: {
        title: 'Scoate sacul',
        icon: 'sack'
    },
    unmask: {
        title: 'Scoate masca',
        icon: 'mask'
    },
    frisk: {
        title: 'Perchezitioneaza',
        icon: 'backpack'
    },
    vehicle: {
        title: 'Baga in vehicul'
    },
    heal: {
        title: 'Ofera tratament',
        icon: 'pill'
    },
    reanimate: {
        title: 'Reanimeaza'
    },
    medcard_physical: {
        title: 'Emite adeverinta de sanatate fizica',
        icon: 'medcard'
    },
    medcard_mental: {
        title: 'Emite adeverinta de sanatate psihica',
        icon: 'medcard'
    },
    military_id: {
        title: 'Elibereaza livret militar',
        icon: 'licenses'
    }
};


export default function TargetOrganization() {
	const [actions, setActions] = useState<string[]>([]);

	useEffect(() => {
		rpc.callClient('FactionActions-GetItems').then(setActions);
	}, []);

	function callAction(action: string) {
		rpc.callClient('FactionActions-Call', action);
	}

	return (
		<>
			{actions.map((item) => {
				const action = actionList[item];

				return (
					<Cell
						key={item}
						label={action.icon ?? item}
						title={action.title}
						onClick={() => callAction(item)}
					/>
				);
			})}
		</>
	);
}
