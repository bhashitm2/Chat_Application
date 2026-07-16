import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";
import { extractDayLabel } from "../../utils/extractTime";

const dayKey = (d) => new Date(d).toDateString();

const TypingBubble = () => (
	<motion.div
		initial={{ opacity: 0, y: 8, scale: 0.95 }}
		animate={{ opacity: 1, y: 0, scale: 1 }}
		className='flex items-end gap-[9px] mt-[10px]'
	>
		<div className='w-8 flex-none'></div>
		<div className='flex items-center gap-[5px] px-[15px] py-3 rounded-bubble bg-in-bubble shadow-bubble theme-fade'>
			<span className='w-2 h-2 rounded-full bg-ink-faint typing-dot'></span>
			<span className='w-2 h-2 rounded-full bg-ink-faint typing-dot' style={{ animationDelay: "0.2s" }}></span>
			<span className='w-2 h-2 rounded-full bg-ink-faint typing-dot' style={{ animationDelay: "0.4s" }}></span>
		</div>
	</motion.div>
);

const Messages = () => {
	const { messages, loading } = useGetMessages();
	useListenMessages();
	const { selectedConversation, typingUsers } = useConversation();
	const bottomRef = useRef();

	const peerTyping = selectedConversation && !!typingUsers[selectedConversation._id];

	useEffect(() => {
		setTimeout(() => {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages, peerTyping]);

	return (
		<div className='flex-1 overflow-y-auto chat-scroll px-4 md:px-[26px] pt-4 pb-2 flex flex-col'>
			{!loading &&
				messages.length > 0 &&
				messages.map((message, idx) => {
					const prev = messages[idx - 1];
					const next = messages[idx + 1];
					const newDay = !prev || dayKey(prev.createdAt) !== dayKey(message.createdAt);
					const firstOfGroup = newDay || prev.senderId !== message.senderId;
					const lastOfGroup =
						!next || next.senderId !== message.senderId || dayKey(next.createdAt) !== dayKey(message.createdAt);

					return (
						<div key={message._id}>
							{newDay && (
								<div className='self-center text-center my-3'>
									<span
										className='inline-block px-3.5 py-[5px] rounded-[14px] text-xs font-bold text-sep-text backdrop-blur'
										style={{ background: "var(--sep-bg)" }}
									>
										{extractDayLabel(message.createdAt)}
									</span>
								</div>
							)}
							<motion.div
								layout='position'
								initial={{ opacity: 0, y: 10, scale: 0.97 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{ type: "spring", stiffness: 500, damping: 38 }}
								className={firstOfGroup && !newDay ? "mt-[10px]" : "mt-[2px]"}
							>
								<Message message={message} lastOfGroup={lastOfGroup} />
							</motion.div>
						</div>
					);
				})}

			{peerTyping && !loading && <TypingBubble />}
			<div ref={bottomRef} />

			{loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
			{!loading && messages.length === 0 && (
				<p className='text-center text-sm text-ink-faint my-auto'>Send a message to start the conversation</p>
			)}
		</div>
	);
};
export default Messages;
