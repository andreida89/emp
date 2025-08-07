import React from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';
import vehicles from 'data/vehicles.json';

type Props = {
	name: string;
	owner: string;
	owners: number;
};

export default function DatabaseVehicle(props: Props) {
	const { name, owner, owners } = props;

	return (
<Page>
    <Navbar title="Vehicul" backLink="Cautare" />

    <List inset>
        <ListItem title="Denumire" after={(vehicles as any)[name] ?? name} />
        <ListItem title="Proprietar" after={owner} />
        <ListItem title="Total proprietari" after={owners.toString()} />
    </List>
</Page>

	);
}
