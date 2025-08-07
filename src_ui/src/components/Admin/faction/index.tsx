import React from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import Leader from './leader';
import FortWar from './fort';
import GangZone from './gang-zone';

export default function AdminFaction() {
	return (
		<div className="admin_faction">
			<Tabs prefixCls="admin_tabs">
				<TabPane tab="Evenimente" key="fort">
					<FortWar />
				</TabPane>

				<TabPane tab="Teritoriile organizatiilor" key="zones">
					<GangZone />
				</TabPane>

				<TabPane tab="Lider" key="leader">
					<Leader />
				</TabPane>
			</Tabs>
		</div>
	);
}
