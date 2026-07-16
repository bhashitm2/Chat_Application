import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { setMessages, selectedConversation } = useConversation();

	const sendMessage = async ({ message = "", files = [], waveform = null, duration = 0 }) => {
		setLoading(true);
		try {
			let options;
			if (files.length > 0) {
				const formData = new FormData();
				files.forEach((file) => formData.append("files", file));
				if (message) formData.append("message", message);
				if (waveform) formData.append("waveform", JSON.stringify(waveform));
				if (duration) formData.append("duration", String(duration));
				// let the browser set the multipart Content-Type with its boundary
				options = { method: "POST", body: formData };
			} else {
				options = {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ message }),
				};
			}

			const res = await fetch(`/api/messages/send/${selectedConversation._id}`, options);
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setMessages((prev) => [...prev, data]);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};
export default useSendMessage;
