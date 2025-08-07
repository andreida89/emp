import React, { Component } from 'react';
import * as Yup from 'yup';
import {
	Page,
	Navbar,
	BlockHeader,
	List,
	ListItem,
	ListInput,
	ListButton
} from 'framework7-react';
import { Formik, Form } from 'formik';
import rpc from 'utils/rpc';
import prettify from 'utils/prettify';

type State = {
	balance: number;
};

export default class FactionMoney extends Component<{}, State> {
	readonly state: State = {
		balance: 0
	};

	componentDidMount() {
		rpc.callServer('Faction-GetMoney').then(this.setCurrentBalance.bind(this));
	}

	setCurrentBalance(amount: number) {
		this.setState(() => ({ balance: amount }));
	}

	async moneyOperation(type: 'add' | 'withdraw', amount: number) {
		const balance: number = await rpc.callServer('FactionLeader-ChangeMoney', [
			type,
			amount
		]);

		this.setCurrentBalance(balance);
	}

	render() {
		const { balance } = this.state;

		return (
			<Page>
<Navbar title="Balanta organizatiei" />

<List inset>
    <ListItem title="Balanta curenta" after={prettify.price(balance)} />
</List>


<BlockHeader>Operatiuni financiare</BlockHeader>

				<Formik
					initialValues={{ sum: '', type: 'add' }}
					validationSchema={Yup.object({
						sum: Yup.number().required().min(1).max(100000000)
					})}
					onSubmit={(values) => this.moneyOperation(values.type as any, +values.sum)}
				>
					{({ values, handleChange, submitForm, setFieldValue }) => (
						<Form>
							<List inset>
								<ListInput
									clearButton
									name="sum"
									type="number"
									placeholder="Suma"
									value={values.sum}
									onChange={handleChange}
									onInputClear={handleChange}
								/>
							</List>

							<List inset>
								<ListButton
									title="Reincarca"
									onClick={() => {
										setFieldValue('type', 'add');
										submitForm();
									}}
								/>
								<ListButton
									title="Retrage"
									color="red"
									onClick={() => {
										setFieldValue('type', 'withdraw');
										submitForm();
									}}
								/>
							</List>
						</Form>
					)}
				</Formik>
			</Page>
		);
	}
}
