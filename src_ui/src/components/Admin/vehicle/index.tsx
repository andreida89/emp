import React from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import Creator from './creator';
import Despawn from './despawn';

export default function AdminVehicle() {
	return (
		<div className="admin_vehicle">
			<Tabs prefixCls="admin_tabs">
				<TabPane tab="Spawneaza" key="create">
					<Creator />
				</TabPane>

				<TabPane tab="Sterge" key="despawn">
					<Despawn />
				</TabPane>
			</Tabs>
		</div>
	);
}
