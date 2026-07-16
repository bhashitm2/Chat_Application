import { useState } from "react";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import FriendRequests from "./FriendRequests";
import ProfileModal from "../ProfileModal";
import { useAuthContext } from "../../context/AuthContext";
import { resolveAvatar, onAvatarError } from "../../utils/avatar";

const Sidebar = () => {
	const { authUser } = useAuthContext();
	const [profileOpen, setProfileOpen] = useState(false);

	return (
		<div className='border-r border-slate-500 p-4 flex flex-col'>
			<div className='flex items-center gap-2'>
				<SearchInput />
				<FriendRequests />
			</div>
			<div className='divider px-3'></div>
			<Conversations />

			<div className='mt-auto pt-3 flex items-center justify-between gap-2'>
				<button
					onClick={() => setProfileOpen(true)}
					className='flex items-center gap-2 group min-w-0'
					title='Your profile'
				>
					<img
						src={resolveAvatar(authUser.profilePic)}
						onError={onAvatarError}
						alt={authUser.fullName}
						className='w-9 h-9 rounded-full object-cover shrink-0'
					/>
					<span className='text-gray-200 text-sm font-medium truncate group-hover:text-white'>
						{authUser.fullName}
					</span>
				</button>
				<LogoutButton />
			</div>

			<ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
		</div>
	);
};
export default Sidebar;
