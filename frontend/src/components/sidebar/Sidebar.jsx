import { useState } from "react";
import { motion } from "framer-motion";
import { IoPencil } from "react-icons/io5";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import FriendRequests from "./FriendRequests";
import ThemeSelector from "./ThemeSelector";
import ProfileModal from "../ProfileModal";
import { useAuthContext } from "../../context/AuthContext";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";
import { useListenTyping } from "../../hooks/useTyping";
import useListenSidebar from "../../hooks/useListenSidebar";

const FILTERS = ["All", "Unread", "Groups", "Personal"];

const Sidebar = () => {
	const { authUser } = useAuthContext();
	const [profileOpen, setProfileOpen] = useState(false);
	const [filter, setFilter] = useState("All");
	useListenTyping();
	useListenSidebar();

	return (
		<div className='w-[300px] lg:w-[366px] flex-none flex flex-col bg-panel border-r border-line theme-fade'>
			<div className='px-3.5 pt-3.5 pb-2.5 flex flex-col gap-3'>
				{/* header row */}
				<div className='flex items-center gap-2.5'>
					<div className='w-[30px] h-[18px] ms-1 flex flex-col justify-between text-icon-dim' aria-hidden='true'>
						<span className='h-[2px] rounded-full bg-current'></span>
						<span className='h-[2px] rounded-full bg-current'></span>
						<span className='h-[2px] w-[70%] rounded-full bg-current'></span>
					</div>
					<span className='flex-1 text-[19px] font-extrabold tracking-tight text-ink'>Chats</span>
					<FriendRequests />
					<ThemeSelector />
					<motion.button
						type='button'
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						transition={{ type: "spring", stiffness: 500, damping: 22 }}
						onClick={() => document.getElementById("user-search-input")?.focus()}
						className='w-9 h-9 rounded-full flex items-center justify-center bg-surface text-icon-dim theme-fade'
						title='New message — search for people'
					>
						<IoPencil size={16} />
					</motion.button>
				</div>

				<SearchInput />

				{/* filter tabs */}
				<div className='flex gap-2'>
					{FILTERS.map((f) => {
						const active = filter === f;
						return (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`relative px-[15px] py-[7px] rounded-pill text-[12.5px] leading-none ${
									active ? "font-bold text-white" : "font-semibold text-ink-dim bg-surface theme-fade"
								}`}
							>
								{active && (
									<motion.span
										layoutId='filter-pill'
										className='absolute inset-0 rounded-pill bg-grad shadow-row-active'
										transition={{ type: "spring", stiffness: 500, damping: 35 }}
									/>
								)}
								<span className='relative'>{f}</span>
							</button>
						);
					})}
				</div>
			</div>

			<Conversations filter={filter} />

			{/* self row */}
			<div className='mt-auto px-2.5 py-2 border-t border-line flex items-center gap-2.5 theme-fade'>
				<button
					onClick={() => setProfileOpen(true)}
					className='flex items-center gap-2.5 group min-w-0 flex-1 text-left'
					title='Your profile'
				>
					<img
						src={resolveAvatar(authUser.profilePic)}
						onError={onAvatarError}
						alt={authUser.fullName}
						className='w-[38px] h-[38px] rounded-full object-cover shrink-0'
					/>
					<span className='min-w-0'>
						<span className='block text-[13.5px] font-bold text-ink truncate group-hover:text-accent transition-colors'>
							{authUser.fullName}
						</span>
						<span className='block text-xs text-ink-faint truncate'>@{authUser.username} · online</span>
					</span>
				</button>
				<div className='flex items-center gap-1 shrink-0'>
					<LogoutButton />
				</div>
			</div>

			<ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
		</div>
	);
};
export default Sidebar;
