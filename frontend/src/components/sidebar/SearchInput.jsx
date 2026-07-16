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
						className='w-8 h-8 rounded-full bg-grad text-white flex items-center justify-center glow-send'
						title='Message'
					>
						<IoChatbubbleEllipses size={15} />
					</motion.button>
				);
			case "outgoing":
				return (
					<span
						className='w-8 h-8 rounded-full bg-surface text-ink-faint flex items-center justify-center'
						title='Request pending'
					>
						<IoTime size={15} />
					</span>
				);
			case "incoming":
				return (
					<motion.button
						whileTap={{ scale: 0.85 }}
						onClick={() => handleAccept(user)}
						className='w-8 h-8 rounded-full bg-online text-white flex items-center justify-center'
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
						className='w-8 h-8 rounded-full bg-grad text-white flex items-center justify-center'
						title='Send friend request'
					>
						<IoPersonAdd size={14} />
					</motion.button>
				);
		}
	};

	return (
		<div className='relative'>
			<form onSubmit={(e) => e.preventDefault()}>
				<div className='flex items-center gap-2 h-10 px-[13px] rounded-pill bg-surface theme-fade'>
					<span className='text-ink-faint flex-none'>
						{searching ? (
							<span className='loading loading-spinner loading-xs'></span>
						) : (
							<IoSearchSharp size={17} />
						)}
					</span>
					<input
						id='user-search-input'
						type='text'
						placeholder='Search'
						className='flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</form>

			{search.trim().length >= 2 && (
				<motion.div
					initial={{ opacity: 0, y: -8, scale: 0.97 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: "spring", stiffness: 500, damping: 34 }}
					className='absolute left-0 right-0 top-12 z-30 max-h-80 overflow-y-auto chat-scroll rounded-card bg-panel border border-line shadow-frame p-2'
				>
					{!searching && results.length === 0 && (
						<p className='text-ink-faint text-sm px-2 py-3 text-center'>No users found</p>
					)}
					{results.map((user) => (
						<motion.div
							key={user._id}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className='flex items-center gap-2.5 p-2 rounded-row hover:bg-surface theme-fade'
						>
							<img
								src={resolveAvatar(user.profilePic)}
								onError={onAvatarError}
								alt={user.fullName}
								className='w-9 h-9 rounded-full object-cover'
							/>
							<div className='flex-1 min-w-0'>
								<p className='text-ink text-sm font-bold truncate'>{user.fullName}</p>
								<p className='text-ink-faint text-xs truncate'>@{user.username}</p>
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
