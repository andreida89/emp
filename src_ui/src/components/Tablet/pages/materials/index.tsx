import React, { Component } from 'react';
import * as Yup from 'yup';
import {
	Page,
	Navbar,
	BlockHeader,
	List,
	ListItem,
	ListButton,
	ListInput
} from 'framework7-react';
import { Formik, Form } from 'formik';
import { showNotification } from 'utils/notifications';
import rpc from 'utils/rpc';
import factions from 'data/factions.json';

type State = {
	materials: { [ faction: string ]: number };
};

export default class FactionMaterials extends Component<{}, State> {
	readonly state: State = {
		materials: {}
	};

	componentDidMount() {
		rpc
			.callServer( 'Faction-GetMaterials' )
			.then( ( data ) => this.setState( () => ( { materials: data } ) ) );
	}

	async createOrder( forArmy: boolean, amount: number ) {
		try {
			await rpc.callServer( 'Factions-OrderMaterials', [ forArmy, amount ] );

			showNotification( 'success', 'Ati plasat o comanda de materiale' );
		} catch ( err: any ) {
			if ( err.msg ) showNotification( 'error', err.msg );
		}
	}

	render() {
		const { materials } = this.state;

		return (
			<Page>
				<Navbar title="Materiale" />

				<BlockHeader>Balanta organizatiilor</BlockHeader>
				<List inset>
					{Object.entries( materials ).map( ( [ name, amount ] ) => (
						<ListItem
							key={name}
							title={( factions as any )[ name ]}
							after={amount.toString()}
						/>
					) )}
				</List>

				<BlockHeader>Livrare</BlockHeader>

				<Formik
					initialValues={{ army: false, amount: '' }}
					validationSchema={Yup.object( {
						amount: Yup.number().required().min( 1 ).max( 100000000 )
					} )}
					onSubmit={( values ) => this.createOrder( values.army, +values.amount )}
				>
					{( { values, handleChange, submitForm } ) => (
						<Form>
							<List inset>
								<ListInput
									clearButton
									name="amount"
									type="number"
									placeholder="Cantitate materiale"
									value={values.amount}
									onChange={handleChange}
									onInputClear={handleChange}
								/>
								<ListItem
									checkbox
									title="Armata"
									name="army"
									checked={values.army}
									onChange={handleChange}
								/>

								<ListButton title="Comanda" onClick={submitForm} />
							</List>
						</Form>
					)}
				</Formik>
			</Page>
		);
	}
}
