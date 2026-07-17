import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useReactToMessage = () => {
	const { setMessages } = useConversation();

	const reactToMessage = async (messageId, emoji) => {
		try {
			const res = await fetch(`/api/messages/react/${messageId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ emoji }),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setMessages((prev) => prev.map((m) => (m._id === data.messageId ? { ...m, reactions: data.reactions } : m)));
		} catch (error) {
			toast.error(error.message);
		}
	};

	return { reactToMessage };
};
export default useReactToMessage;
