import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";
import notificationSound from "../assets/sounds/notification.mp3";

const useFriendRequests = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(false);
	const { bumpSidebar, sidebarVersion } = useConversation();
	const { socket } = useSocketContext();

	const fetchRequests = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/friends/requests");
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setRequests(data);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}, []);

	// refetch on sidebar bumps too, so accepting from the search dropdown
	// keeps the badge count in sync
	useEffect(() => {
		fetchRequests();
	}, [fetchRequests, sidebarVersion]);

	const acceptRequest = async (requestId) => {
		try {
			const res = await fetch(`/api/friends/accept/${requestId}`, { method: "POST" });
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setRequests((prev) => prev.filter((r) => r._id !== requestId));
			toast.success("Friend request accepted");
			bumpSidebar();
		} catch (error) {
			toast.error(error.message);
		}
	};

	const rejectRequest = async (requestId) => {
		try {
			const res = await fetch(`/api/friends/reject/${requestId}`, { method: "POST" });
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setRequests((prev) => prev.filter((r) => r._id !== requestId));
		} catch (error) {
			toast.error(error.message);
		}
	};

	// realtime friend events (this hook is mounted once, in the sidebar)
	useEffect(() => {
		if (!socket) return;

		const onFriendRequest = ({ requestId, sender }) => {
			setRequests((prev) =>
				prev.some((r) => r._id === requestId)
					? prev
					: [{ _id: requestId, sender, createdAt: new Date().toISOString() }, ...prev]
			);
			toast(`${sender.fullName} sent you a friend request`, { icon: "👋" });
			new Audio(notificationSound).play().catch(() => {});
		};

		const onAccepted = ({ user }) => {
			toast.success(`${user.fullName} accepted your friend request`);
			bumpSidebar();
		};

		const onRemoved = ({ userId }) => {
			bumpSidebar();
			// close the chat if it's the one that unfriended us
			const { selectedConversation, setSelectedConversation } = useConversation.getState();
			if (selectedConversation?._id === userId) setSelectedConversation(null);
		};

		socket.on("friendRequest", onFriendRequest);
		socket.on("friendRequestAccepted", onAccepted);
		socket.on("friendRemoved", onRemoved);

		return () => {
			socket.off("friendRequest", onFriendRequest);
			socket.off("friendRequestAccepted", onAccepted);
			socket.off("friendRemoved", onRemoved);
		};
	}, [socket, bumpSidebar]);

	return { requests, loading, acceptRequest, rejectRequest, fetchRequests };
};

export default useFriendRequests;
