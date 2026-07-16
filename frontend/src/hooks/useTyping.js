import { useCallback, useEffect, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

// Listener half — mount ONCE (Sidebar). Tracks who is typing to me, with a
// safety timeout so a dropped "stop" can't leave the indicator stuck.
export const useListenTyping = () => {
	const { socket } = useSocketContext();
	const { setTyping } = useConversation();
	const timersRef = useRef({});

	useEffect(() => {
		if (!socket) return;

		const onStart = ({ from }) => {
			setTyping(from, true);
			clearTimeout(timersRef.current[from]);
			timersRef.current[from] = setTimeout(() => setTyping(from, false), 3000);
		};
		const onStop = ({ from }) => {
			clearTimeout(timersRef.current[from]);
			setTyping(from, false);
		};

		socket.on("typing:start", onStart);
		socket.on("typing:stop", onStop);
		const timers = timersRef.current;
		return () => {
			socket.off("typing:start", onStart);
			socket.off("typing:stop", onStop);
			Object.values(timers).forEach(clearTimeout);
		};
	}, [socket, setTyping]);
};

// Emitter half — used by the composer. Emits start on keystrokes (throttled)
// and stop after 1.5s idle or explicitly on send.
export const useTypingEmitter = () => {
	const { socket } = useSocketContext();
	const { selectedConversation } = useConversation();
	const idleTimerRef = useRef(null);
	const activeRef = useRef(false);

	const stopTyping = useCallback(() => {
		clearTimeout(idleTimerRef.current);
		if (activeRef.current && socket && selectedConversation) {
			socket.emit("typing:stop", { to: selectedConversation._id });
		}
		activeRef.current = false;
	}, [socket, selectedConversation]);

	const notifyTyping = useCallback(() => {
		if (!socket || !selectedConversation) return;
		if (!activeRef.current) {
			socket.emit("typing:start", { to: selectedConversation._id });
			activeRef.current = true;
		}
		clearTimeout(idleTimerRef.current);
		idleTimerRef.current = setTimeout(stopTyping, 1500);
	}, [socket, selectedConversation, stopTyping]);

	// stop when switching chats / unmounting
	useEffect(() => stopTyping, [stopTyping]);

	return { notifyTyping, stopTyping };
};
