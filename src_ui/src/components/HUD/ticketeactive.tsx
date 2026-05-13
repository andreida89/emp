import React, { useEffect, useState } from 'react';
import rpc from 'utils/rpc';

export default function AdminTicketCount() {
	const [reportCount, setReportCount] = useState(-1);

	useEffect(() => {
		const getReportCount = async () => {
			const count = await rpc.callServer('Admin-GetReportCount');
			setReportCount(count);
		};

		getReportCount();
		const interval = setInterval(getReportCount, 10000);
		(window as any).AdminTickets = (newCount: number) => setReportCount(newCount);
		(window as any).AdminTicketsUpdate = getReportCount;
		return () => clearInterval(interval);
	}, []);

	if (Number(reportCount) < 0) return null;

	return (
		<span className="hud_tickets" style={{ color: '#fff' }}>
			TICKETE: <strong style={{ color: '#BA2000' }}>{reportCount}</strong>
		</span>
	);
}
