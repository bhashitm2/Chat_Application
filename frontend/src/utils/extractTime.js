export function extractTime(dateString) {
	const date = new Date(dateString);
	const hours = padZero(date.getHours());
	const minutes = padZero(date.getMinutes());
	return `${hours}:${minutes}`;
}

// Helper function to pad single-digit numbers with a leading zero
function padZero(number) {
	return number.toString().padStart(2, "0");
}

// Sidebar-row style timestamp: "14:32" today, "Tue" this week, "12/03" older
export function extractListTime(dateString) {
	if (!dateString) return "";
	const date = new Date(dateString);
	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	if (date >= startOfToday) return extractTime(dateString);

	const daysAgo = (startOfToday - date) / 86400000;
	if (daysAgo < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
	return `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}`;
}

// Date-separator label inside the chat: "Today", "Yesterday", or a full date
export function extractDayLabel(dateString) {
	const date = new Date(dateString);
	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const diffDays = Math.round((startOfToday - startOfThat) / 86400000);
	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	return date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}
