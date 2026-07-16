import { useState } from "react";
import { motion } from "framer-motion";
import { IoPersonAdd, IoCheckmark, IoClose } from "react-icons/io5";
import useFriendRequests from "../../hooks/useFriendRequests";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

const FriendRequests = () => {
	const [open, setOpen] = useState(false);
	const { requests, acceptRequest, rejectRequest } = useFriendRequests();

	return (
		<div className='relative'>
			<motion.button
				type='button'
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				transition={{ type: "spring", stiffness: 500, damping: 22 }}
				onClick={() => setOpen((o) => !o)}
				className='w-9 h-9 rounded-full flex items-center justify-center bg-surface text-accent theme-fade relative'
				title='Friend requests'
			>
				<IoPersonAdd size={17} />
				{requests.length > 0 && (
					<span className='absolute -top-[3px] -right-[3px] min-w-[17px] h-[17px] px-1 rounded-[9px] bg-grad text-white text-[10px] font-extrabold flex items-center justify-center'>
						{requests.length}
					</span>
				)}
			</motion.button>

			{open && (
				<motion.div
					initial={{ opacity: 0, y: -8, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: "spring", stiffness: 500, damping: 34 }}
					className='absolute -left-24 top-12 z-30 w-72 max-h-80 overflow-y-auto chat-scroll rounded-card bg-panel border border-line shadow-frame p-2'
				>
					<p className='text-accent text-[11px] font-bold uppercase tracking-wide px-2 py-1.5'>Friend requests</p>
					{requests.length === 0 && (
						<p className='text-ink-faint text-sm px-2 py-3 text-center'>No pending requests</p>
					)}
					{requests.map((request) => (
						<motion.div
							key={request._id}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className='flex items-center gap-2.5 p-2 rounded-row hover:bg-surface theme-fade'
						>
							<img
								src={resolveAvatar(request.sender.profilePic)}
								onError={onAvatarError}
								alt={request.sender.fullName}
								className='w-9 h-9 rounded-full object-cover'
							/>
							<div className='flex-1 min-w-0'>
								<p className='text-ink text-sm font-bold truncate'>{request.sender.fullName}</p>
								<p className='text-ink-faint text-xs truncate'>@{request.sender.username}</p>
							</div>
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={() => acceptRequest(request._id)}
								className='w-8 h-8 rounded-full bg-online text-white flex items-center justify-center'
								title='Accept'
							>
								<IoCheckmark size={16} />
							</motion.button>
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={() => rejectRequest(request._id)}
								className='w-8 h-8 rounded-full bg-surface text-ink-dim hover:text-red-400 flex items-center justify-center theme-fade'
								title='Decline'
							>
								<IoClose size={16} />
							</motion.button>
						</motion.div>
					))}
				</motion.div>
			)}
		</div>
	);
};

export default FriendRequests;
