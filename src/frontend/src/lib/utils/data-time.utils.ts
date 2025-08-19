export function formatTimestamp(timestamp: number): string {
	const date = new Date(timestamp);

	// const months = [
	//   "January",
	//   "February",
	//   "March",
	//   "April",
	//   "May",
	//   "June",
	//   "July",
	//   "August",
	//   "September",
	//   "October",
	//   "November",
	//   "December",
	// ];
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	const month = months[date.getMonth()];
	const year = date.getFullYear();

	return `${date.getDate()} ${month} ${year}`;
}

export const formatBigIntNanoSecTimestamp = (timestamp: bigint): string => {
	const millisec = Number(timestamp) / 1_000_000;
	return formatTimestamp(millisec);
};