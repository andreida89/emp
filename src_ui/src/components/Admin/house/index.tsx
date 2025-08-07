import React from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import Creator from './creator';
import Destroyer from './destroyer';

export default function AdminHouse() {
	return (
		<div className="admin_house">
			<Tabs prefixCls="admin_tabs">
				<TabPane tab="Creeaza" key="create">
					<Creator />
				</TabPane>

				<TabPane tab="Sterge" key="delete">
					<Destroyer />
				</TabPane>
			</Tabs>
		</div>
	);
}
