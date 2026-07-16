import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { IoCall, IoVideocam, IoEllipsisVertical, IoTrashOutline, IoPersonRemoveOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import { useCallContext } from "../../context/CallContext";
import useDeleteConversation from "../../hooks/useDeleteConversation";
import ConfirmModal from "../ConfirmModal";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

const HeaderButton = ({ title, onClick, children }) => (
	<motion.button
		whileHover={{ scale: 1.05 }}
		whileTap={{ scale: 0.9 }}
		transition={{ type: "spring", stiffness: 500, damping: 22 }}
		onClick={onClick}
		className='w-10 h-10 rounded-full flex items-center justify-center text-icon-dim hover:bg-surface hover:text-accent transition-colors'
		title={title}
	>
		{children}
	</motion.button>
);

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation, bumpSidebar, typingUsers } = useConversation();
	const { onlineUsers } = useSocketContext();
	const { startCall } = useCallContext();
	const { deleteConversation, deleting } = useDeleteConversation();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [unfriendOpen, setUnfriendOpen] = useState(false);
	const [unfriending, setUnfriending] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	const isOnline = selectedConversation && onlineUsers.includes(selectedConversation._id);
	const isTyping = selectedConversation && !!typingUsers[selectedConversation._id];

	const handleRemoveFriend = async () => {
		setUnfriending(true);
		try {
			const res = await fetch(`/api/friends/${selectedConversation._id}`, { method: "DELETE" });
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			toast.success("Friend removed");
			bumpSidebar();
			setSelectedConversation(null);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setUnfriending(false);
			setUnfriendOpen(false);
		}
	};

	useEffect(() => {
		// cleanup function (unmounts)
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	return (
		<div className='flex-1 min-w-0 flex flex-col bg-wall theme-fade'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<motion.div
					key={selectedConversation._id}
					className='flex flex-col flex-1 min-h-0'
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
				>
					{/* Header */}
					<div className='flex items-center gap-3 px-[18px] py-[11px] bg-panel border-b border-line theme-fade z-10'>
						<div className='relative flex-none'>
							<img
								src={resolveAvatar(selectedConversation.profilePic)}
								onError={onAvatarError}
								alt={selectedConversation.fullName}
								className='w-11 h-11 rounded-full object-cover'
							/>
							{isOnline && (
								<span
									className='absolute right-0 bottom-0 w-3 h-3 rounded-full bg-online online-ping'
									style={{ border: "2.5px solid var(--panel)" }}
								></span>
							)}
						</div>
						<div className='flex-1 min-w-0'>
							<div className='font-bold text-base text-ink tracking-tight truncate'>
								{selectedConversation.fullName}
							</div>
							<div className={`text-[13px] font-semibold ${isTyping || isOnline ? "text-accent" : "text-ink-faint"}`}>
								{isTyping ? "typing…" : isOnline ? "online" : "offline"}
							</div>
						</div>
						<div className='flex items-center gap-1'>
							<HeaderButton title='Voice call' onClick={() => startCall(selectedConversation, "audio")}>
								<IoCall size={19} />
							</HeaderButton>
							<HeaderButton title='Video call' onClick={() => startCall(selectedConversation, "video")}>
								<IoVideocam size={21} />
							</HeaderButton>
							<div className='relative'>
								<HeaderButton title='More options' onClick={() => setMenuOpen((o) => !o)}>
									<IoEllipsisVertical size={19} />
								</HeaderButton>
								{menuOpen && (
									<>
										<div className='fixed inset-0 z-20' onClick={() => setMenuOpen(false)}></div>
										<motion.ul
											initial={{ opacity: 0, y: -6, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											transition={{ type: "spring", stiffness: 500, damping: 30 }}
											className='absolute right-0 top-12 z-30 w-48 rounded-card bg-panel border border-line shadow-frame p-1.5'
										>
											<li>
												<button
													className='w-full flex items-center gap-2.5 px-3 py-2 rounded-row text-sm font-semibold text-red-400 hover:bg-surface theme-fade'
													onClick={() => {
														setMenuOpen(false);
														setConfirmOpen(true);
													}}
												>
													<IoTrashOutline size={16} />
													Delete Chat
												</button>
											</li>
											<li>
												<button
													className='w-full flex items-center gap-2.5 px-3 py-2 rounded-row text-sm font-semibold text-red-400 hover:bg-surface theme-fade'
													onClick={() => {
														setMenuOpen(false);
														setUnfriendOpen(true);
													}}
												>
													<IoPersonRemoveOutline size={16} />
													Remove Friend
												</button>
											</li>
										</motion.ul>
									</>
								)}
							</div>
						</div>
					</div>

					<Messages />
					<MessageInput />
				</motion.div>
			)}

			<ConfirmModal
				open={confirmOpen}
				title='Delete chat?'
				description={`The entire conversation with ${selectedConversation?.fullName} will be deleted for both of you. This cannot be undone.`}
				confirmLabel='Delete Chat'
				loading={deleting}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={async () => {
					await deleteConversation();
					setConfirmOpen(false);
				}}
			/>

			<ConfirmModal
				open={unfriendOpen}
				title='Remove friend?'
				description={`${selectedConversation?.fullName} will be removed from your friends. Neither of you will be able to message or call the other until you connect again.`}
				confirmLabel='Remove'
				loading={unfriending}
				onCancel={() => setUnfriendOpen(false)}
				onConfirm={handleRemoveFriend}
			/>
		</div>
	);
};
export default MessageContainer;

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	return (
		<motion.div
			className='flex items-center justify-center w-full h-full'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
		>
			<div className='px-4 text-center flex flex-col items-center gap-3'>
				<div className='w-16 h-16 rounded-[22px] bg-grad glow-send flex items-center justify-center rotate-6 mb-1'>
					<TiMessages className='text-3xl text-white' />
				</div>
				<p className='text-lg font-extrabold text-ink tracking-tight'>Welcome, {authUser.fullName} 👋</p>
				<p className='text-sm text-ink-dim'>Select a chat to start messaging</p>
			</div>
		</motion.div>
	);
};
