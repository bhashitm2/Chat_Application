import { motion } from "framer-motion";
import useGetConversations from "../../hooks/useGetConversations";
import Conversation from "./Conversation";

const Conversations = ({ filter = "All" }) => {
	const { loading, conversations } = useGetConversations();

	// Groups aren't supported yet — the tab shows an honest empty state
	const filtered =
		filter === "Unread"
			? conversations.filter((c) => (c.unreadCount || 0) > 0)
			: filter === "Groups"
			? []
			: conversations; // All & Personal (every chat is 1:1 today)

	return (
		<div className='flex-1 overflow-y-auto chat-scroll px-2 pb-2 pt-1 flex flex-col gap-[2px]'>
			{filtered.map((conversation, idx) => (
				<motion.div
					key={conversation._id}
					initial={{ opacity: 0, x: -16 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.2, ease: "easeOut" }}
				>
					<Conversation conversation={conversation} />
				</motion.div>
			))}

			{!loading && filtered.length === 0 && (
				<p className='text-center text-[13px] text-ink-faint mt-8 px-4'>
					{filter === "Groups"
						? "Group chats are coming soon"
						: filter === "Unread"
						? "No unread chats — all caught up ✨"
						: "Find people with the search above to start chatting"}
				</p>
			)}
			{loading && <span className='loading loading-spinner mx-auto mt-6 text-accent'></span>}
		</div>
	);
};
export default Conversations;
