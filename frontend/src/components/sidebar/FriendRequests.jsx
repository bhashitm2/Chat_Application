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
				whileTap={{ scale: 0.88 }}
				onClick={() => setOpen((o) => !o)}
				className='btn btn-circle bg-sky-500 text-white relative'
				title='Friend requests'
			>
				<IoPersonAdd className='w-5 h-5' />
				{requests.length > 0 && (
					<span className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center'>
						{requests.length}
					</span>
				)}
			</motion.button>

			{open && (
				<motion.div
					initial={{ opacity: 0, y: -8, scale: 0.97 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					className='absolute left-0 top-14 z-30 w-72 max-h-80 overflow-y-auto chat-scroll rounded-xl bg-gray-800 border border-gray-700 shadow-xl p-2'
				>
					<p className='text-gray-400 text-xs font-semibold px-2 py-1'>FRIEND REQUESTS</p>
					{requests.length === 0 && (
						<p className='text-gray-500 text-sm px-2 py-3 text-center'>No pending requests</p>
					)}
					{requests.map((request) => (
						<motion.div
							key={request._id}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700'
						>
							<img
								src={resolveAvatar(request.sender.profilePic)}
								onError={onAvatarError}
								alt={request.sender.fullName}
								className='w-9 h-9 rounded-full object-cover'
							/>
							<div className='flex-1 min-w-0'>
								<p className='text-gray-200 text-sm font-semibold truncate'>{request.sender.fullName}</p>
								<p className='text-gray-500 text-xs truncate'>@{request.sender.username}</p>
							</div>
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={() => acceptRequest(request._id)}
								className='w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center'
								title='Accept'
							>
								<IoCheckmark size={16} />
							</motion.button>
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={() => rejectRequest(request._id)}
								className='w-8 h-8 rounded-full bg-gray-600 hover:bg-red-500 text-white flex items-center justify-center'
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
