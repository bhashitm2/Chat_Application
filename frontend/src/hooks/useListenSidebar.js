import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

// Mounted ONCE (Sidebar): keeps conversation previews / unread badges fresh
// no matter which chat is open, and plays the ding for background chats
// (useListenMessages plays it for the open one).
const useListenSidebar = () => {
	const { socket } = useSocketContext();

	useEffect(() => {
		if (!socket) return;

		const onNewMessage = (newMessage) => {
			const { selectedConversation, bumpSidebar, setTyping } = useConversation.getState();
			// a message from them means they're no longer typing
			setTyping(newMessage.senderId, false);
			bumpSidebar();

			const isForOpenChat =
				selectedConversation &&
				(newMessage.senderId === selectedConversation._id ||
					newMessage.receiverId === selectedConversation._id);
			if (!isForOpenChat) {
				new Audio(notificationSound).play().catch(() => {});
			}
		};

		const onBump = () => useConversation.getState().bumpSidebar();

		socket.on("newMessage", onNewMessage);
		socket.on("messageDeleted", onBump);
		socket.on("conversationDeleted", onBump);
		socket.on("messagesRead", onBump);

		return () => {
			socket.off("newMessage", onNewMessage);
			socket.off("messageDeleted", onBump);
			socket.off("conversationDeleted", onBump);
			socket.off("messagesRead", onBump);
		};
	}, [socket]);
};

export default useListenSidebar;
