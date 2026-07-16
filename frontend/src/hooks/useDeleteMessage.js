import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useDeleteMessage = () => {
	const [deleting, setDeleting] = useState(false);
	const { setMessages } = useConversation();

	const deleteMessage = async (messageId) => {
		setDeleting(true);
		try {
			const res = await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setMessages((prev) => prev.filter((m) => m._id !== messageId));
		} catch (error) {
			toast.error(error.message);
		} finally {
			setDeleting(false);
		}
	};

	return { deleteMessage, deleting };
};
export default useDeleteMessage;
