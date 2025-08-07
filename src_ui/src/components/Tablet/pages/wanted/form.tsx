import React from 'react';
import { Router } from 'framework7/types';
import { Page, Navbar, List, ListInput, ListButton } from 'framework7-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import rpc from 'utils/rpc';

type Props = {
	f7router: Router.Router;
	userId: string;
};

export default function WantedForm({ f7router, userId }: Props) {
	async function addItem(reason: string, priority: number) {
		await rpc.callServer('WantedList-AddItem', [userId, reason, priority]);

		f7router.back();
	}

	return (
		<Page>
			<Navbar title="Orientare" backLink="Inapoi" />

			<Formik
				initialValues={{ reason: '', priority: '' }}
				validationSchema={Yup.object({
					reason: Yup.string().required().min(2).max(32),
					priority: Yup.number().required().min(1).max(5)
				})}
				onSubmit={(values) => addItem(values.reason, +values.priority)}
			>
				{({ values, handleChange, submitForm }) => (
					<Form>
						<List inset>
							<ListInput
								clearButton
								name="reason"
								type="text"
								placeholder="Descriere"
								info="Descrieti pe scurt incalcarile cetateanului"								
								value={values.reason}
								onChange={handleChange}
								onInputClear={handleChange}
							/>
							<ListInput
								clearButton
								name="priority"
								type="number"
								placeholder="Prioritate"
								info="Specificati prioritatea cautarii de la 1 la 5"								
								value={values.priority}
								onChange={handleChange}
								onInputClear={handleChange}
							/>
						</List>

						<List inset>
							<ListButton title="Intocmeste" onClick={submitForm} />
						</List>
					</Form>
				)}
			</Formik>
		</Page>
	);
}
