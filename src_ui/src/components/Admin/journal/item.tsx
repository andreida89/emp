import React from 'react';
import moment from 'moment-timezone';

const actions: { [name: string]: string } = {
	ban: 'Ban',
	unban: 'Debanare',
	kick: 'Kick',
	demorgan: 'Jail',
	prison_release: 'Eliberare',
	house_add: 'Casa +',
	house_delete: 'Casa -',
	vehicle_create: 'Vehicul +',
	money: 'Valuta',
	skin: 'Skin',
	notify: 'Notificare'
};


type Props = {
	admin: string;
	action: string;
	message: string;
	time: string;
};

export default function AdminReportsItem({ admin, action, message, time }: Props) {
	return (
		<div className="admin_reports-item">
			<span className="admin_reports-sender">{admin}</span>
			<p className="admin_reports-message">{message}</p>

			<span className="admin_reports-time">
				<strong>{actions[action]} | </strong> {moment(time).format('DD.MM.YY, HH:mm')}
			</span>
		</div>
	);
}
