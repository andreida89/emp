import React from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';

export default function Database() {
	return (
		<Page>
<Navbar title="Baza de date" />

<List inset>
    <ListItem link="users/" title="Cetateni" />
    <ListItem link="vehicles/" title="Vehicule" />
    <ListItem link="/wanted/" title="Cautare" />
</List>

		</Page>
	);
}
