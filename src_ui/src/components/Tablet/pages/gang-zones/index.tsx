import React, { Component } from 'react';
import {
	Page,
	Navbar,
	BlockHeader,
	BlockFooter,
	List,
	ListItem,
	ListButton
} from 'framework7-react';
import { showNotification } from 'utils/notifications';
import rpc from 'utils/rpc';
import prettify from 'utils/prettify';

type State = {
	zones: number;
	income: number;
};

export default class GangZones extends Component<{}, State> {
	readonly state: State = {
		zones: 0,
		income: 0
	};

	componentDidMount() {
		rpc.callServer( 'GangZones-GetInfo' ).then( ( data ) => this.setState( () => data ) );
	}

	async startWar() {
		try {
			await rpc.callServer('ZoneCapture-StartWar');
			showNotification('success', 'Ati inceput razboiul pentru teritoriu');			
		} catch ( err: any ) {
			if ( err.msg ) showNotification( 'error', err.msg );
		}
	}

	render() {
		const { zones, income } = this.state;

		return (
			<Page>
<Navbar title="Teritorii" />

<BlockHeader>Teritoriile dvs.</BlockHeader>
<List inset>
    <ListItem title="Sub control" after={zones.toString()} />
    <ListItem title="Venit pe ora" after={prettify.price(income)} />
</List>

<BlockHeader>Capturare</BlockHeader>

<List inset>
    <ListButton title="Incepe capturarea" onClick={this.startWar.bind(this)} />
</List>
<BlockFooter>Marcati teritoriul pe harta pentru a incepe capturarea</BlockFooter>

			</Page>
		);
	}
}
