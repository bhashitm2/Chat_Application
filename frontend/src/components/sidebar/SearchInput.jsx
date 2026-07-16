import { useState } from "react";
import { IoSearchSharp, IoPersonAdd, IoCheckmark, IoChatbubbleEllipses, IoTime } from "react-icons/io5";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useConversation from "../../zustand/useConversation";
import useSearchUsers from "../../hooks/useSearchUsers";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

const SearchInput = () => {
	const [search, setSearch] = useState("");
	const { setSelectedConversation, bumpSidebar } = useConversation();
	const { results, searching, updateStatus } = useSearchUsers(search);

	const closeSearch = () => setSearch("");

	const handleAdd = async (user) => {
		const res = await fetch(`/api/friends/request/${user._id}`, { method: "POST" });
		const data = await res.json();
		if (data.error) return toast.error(data.error);
		if (data.status === "friend") {
			// they had already requested us — instant friends
			toast.success(`You and ${user.fullName} are now friends!`);
			bumpSidebar();
			updateStatus(user._id, "friend");
		} else {
			toast.success("Friend request sent");
			updateStatus(user._id, "outgoing");
		}
	};

	const handleAccept = async (user) => {
		const res = await fetch(`/api/friends/accept/${user.requestId}`, { method: "POST" });
		const data = await res.json();
		if (data.error) return toast.error(data.error);
		toast.success(`You and ${user.fullName} are now friends!`);
		bumpSidebar();
		updateStatus(user._id, "friend");
	};

	const handleMessage = (user) => {
		setSelectedConversation({ _id: user._id, fullName: user.fullName, profilePic: user.profilePic });
		closeSearch();
	};

	const actionFor = (user) => {
		switch (user.status) {
			case "friend":
				return (
					<motion.button
						whileTap={{ scale: 0.85 }}
						onClick={() => handleMessage(user)}
						className='w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center'
						title='Message'
					>
						<IoChatbubbleEllipses size={15} />
					</motion.button>
				);
			case "outgoing":
				return (
					<span className='w-8 h-8 rounded-full bg-gray-600 text-gray-300 flex items-center justify-center' title='Request pending'>
						<IoTime size={15} />
					</span>
				);
			case "incoming":
				return (
					<motion.button
						whileTap={{ scale: 0.85 }}
						onClick={() => handleAccept(user)}
						className='w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center'
						title='Accept their request'
					>
						<IoCheckmark size={16} />
					</motion.button>
				);
			default:
				return (
					<motion.button
						whileTap={{ scale: 0.85 }}
						onClick={() => handleAdd(user)}
						className='w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center'
						title='Send friend request'
					>
						<IoPersonAdd size={14} />
					</motion.button>
				);
		}
	};

	return (
		<div className='relative flex-1'>
			<form onSubmit={(e) => e.preventDefault()} className='flex items-center gap-2'>
				<div className='relative flex-1'>
					<input
						type='text'
						placeholder='Find people…'
						className='input input-bordered rounded-full w-full pe-10'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<span className='absolute inset-y-0 end-3 flex items-center text-gray-400'>
						{searching ? <span className='loading loading-spinner loading-xs'></span> : <IoSearchSharp className='w-5 h-5' />}
					</span>
				</div>
			</form>

			{search.trim().length >= 2 && (
				<motion.div
					initial={{ opacity: 0, y: -8, scale: 0.97 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					className='absolute left-0 right-0 top-14 z-30 max-h-80 overflow-y-auto chat-scroll rounded-xl bg-gray-800 border border-gray-700 shadow-xl p-2'
				>
					{!searching && results.length === 0 && (
						<p className='text-gray-500 text-sm px-2 py-3 text-center'>No users found</p>
					)}
					{results.map((user) => (
						<motion.div
							key={user._id}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700'
						>
							<img src={resolveAvatar(user.profilePic)} onError={onAvatarError} alt={user.fullName} className='w-9 h-9 rounded-full object-cover' />
							<div className='flex-1 min-w-0'>
								<p className='text-gray-200 text-sm font-semibold truncate'>{user.fullName}</p>
								<p className='text-gray-500 text-xs truncate'>@{user.username}</p>
							</div>
							{actionFor(user)}
						</motion.div>
					))}
				</motion.div>
			)}
		</div>
	);
};
export default SearchInput;
