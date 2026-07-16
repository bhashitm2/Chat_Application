import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = () => {
	const { messages, loading } = useGetMessages();
	useListenMessages();
	const bottomRef = useRef();

	useEffect(() => {
		setTimeout(() => {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages]);

	return (
		<div className='px-4 flex-1 overflow-auto chat-scroll'>
			{!loading &&
				messages.length > 0 &&
				messages.map((message) => (
					<motion.div
						key={message._id}
						layout='position'
						initial={{ opacity: 0, y: 14, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ type: "spring", stiffness: 500, damping: 38 }}
					>
						<Message message={message} />
					</motion.div>
				))}
			<div ref={bottomRef} />

			{loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
			{!loading && messages.length === 0 && (
				<p className='text-center'>Send a message to start the conversation</p>
			)}
		</div>
	);
};
export default Messages;
