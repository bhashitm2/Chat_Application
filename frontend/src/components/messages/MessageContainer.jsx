import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { IoCall, IoVideocam, IoEllipsisVertical, IoTrashOutline, IoPersonRemoveOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { useCallContext } from "../../context/CallContext";
import useDeleteConversation from "../../hooks/useDeleteConversation";
import ConfirmModal from "../ConfirmModal";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation, bumpSidebar } = useConversation();
	const { startCall } = useCallContext();
	const { deleteConversation, deleting } = useDeleteConversation();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [unfriendOpen, setUnfriendOpen] = useState(false);
	const [unfriending, setUnfriending] = useState(false);

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
		<div className='flex-1 flex flex-col md:min-w-[450px]'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<motion.div
					key={selectedConversation._id}
					className='flex flex-col flex-1 min-h-0'
					initial={{ opacity: 0, x: 24 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
				>
						{/* Header */}
						<div className='bg-slate-500 px-4 py-2 mb-2 flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={resolveAvatar(selectedConversation.profilePic)} onError={onAvatarError} alt='user avatar' />
									</div>
								</div>
								<span className='text-gray-900 font-bold'>{selectedConversation.fullName}</span>
							</div>
							<div className='flex items-center gap-4'>
								<motion.button
									whileTap={{ scale: 0.85 }}
									onClick={() => startCall(selectedConversation, "audio")}
									className='text-gray-900 hover:text-white transition-colors'
									title='Voice call'
								>
									<IoCall size={20} />
								</motion.button>
								<motion.button
									whileTap={{ scale: 0.85 }}
									onClick={() => startCall(selectedConversation, "video")}
									className='text-gray-900 hover:text-white transition-colors'
									title='Video call'
								>
									<IoVideocam size={22} />
								</motion.button>
								<div className='dropdown dropdown-end'>
									<motion.button
										whileTap={{ scale: 0.85 }}
										tabIndex={0}
										className='text-gray-900 hover:text-white transition-colors'
										title='More options'
									>
										<IoEllipsisVertical size={19} />
									</motion.button>
									<ul
										tabIndex={0}
										className='dropdown-content menu bg-gray-800 rounded-xl z-20 w-44 p-1.5 shadow-xl mt-2'
									>
										<li>
											<button
												className='text-red-400 hover:bg-gray-700 rounded-lg'
												onClick={(e) => {
													e.currentTarget.blur(); // close the dropdown
													setConfirmOpen(true);
												}}
											>
												<IoTrashOutline size={16} />
												Delete Chat
											</button>
										</li>
										<li>
											<button
												className='text-red-400 hover:bg-gray-700 rounded-lg'
												onClick={(e) => {
													e.currentTarget.blur(); // close the dropdown
													setUnfriendOpen(true);
												}}
											>
												<IoPersonRemoveOutline size={16} />
												Remove Friend
											</button>
										</li>
									</ul>
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
			<div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
				<p>Welcome 👋 {authUser.fullName} ❄</p>
				<p>Select a chat to start messaging</p>
				<TiMessages className='text-3xl md:text-6xl text-center' />
			</div>
		</motion.div>
	);
};
