import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useDeleteConversation = () => {
	const [deleting, setDeleting] = useState(false);
	const { setMessages, selectedConversation } = useConversation();

	const deleteConversation = async () => {
		if (!selectedConversation) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/messages/conversation/${selectedConversation._id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setMessages([]);
			toast.success("Chat deleted");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setDeleting(false);
		}
	};

	return { deleteConversation, deleting };
};
export default useDeleteConversation;
