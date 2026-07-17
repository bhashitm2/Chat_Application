// short one-line description of a message, for reply previews and quotes
export const messageSnippet = (message) => {
	if (!message) return "Deleted message";
	switch (message.messageType) {
		case "image":
			return message.message ? `📷 ${message.message}` : "📷 Photo";
		case "video":
			return message.message ? `🎬 ${message.message}` : "🎬 Video";
		case "audio":
			return "🎤 Voice message";
		case "gif":
			return "GIF";
		default:
			return message.message || "Message";
	}
};
