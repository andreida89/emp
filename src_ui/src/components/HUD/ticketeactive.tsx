import React, { useEffect, useState } from 'react';
import rpc from 'utils/rpc';

export default function AdminTicketCount() {
	const [reportCount, setReportCount] = useState(0);

	useEffect(() => {
		const getReportCount = async () => {
			const count = await rpc.callServer('Admin-GetReportCount');
			setReportCount(count);
		};

		getReportCount();
		const interval = setInterval(getReportCount, 10000);
		(window as any).AdminTickets = (newCount: number) => setReportCount(newCount);
		return () => clearInterval(interval);
	}, []);

	if (reportCount === 0) return null;

	return (
		<span className="hud_tickets">
			TICKETE: <strong>{reportCount}</strong>
		</span>
	);
}
