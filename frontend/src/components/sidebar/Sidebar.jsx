import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ThemeSelector from "./ThemeSelector";

const Sidebar = () => {
	const { authUser } = useAuthContext();
	return (
		<div className='border-r border-slate-500 flex flex-col w-1/3 min-w-[300px]'>
			{/* Sidebar Header */}
			<div className="bg-slate-700/30 p-4 flex justify-between items-center h-16">
				<div className="flex items-center gap-2">
					<div className="avatar">
						<div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
							<img src={authUser.profilePic} alt="user avatar" />
						</div>
					</div>
					<div className="flex flex-col">
						<span className="text-white font-bold">{authUser.fullName}</span>
						<span className="text-xs text-gray-400 cursor-pointer hover:text-sky-500" onClick={() => navigator.clipboard.writeText(authUser.secretKey) && toast.success("Key Copied!")}>
							Key: {authUser.secretKey || "No Key"}
						</span>
					</div>
				</div>
                <div className="flex items-center gap-1">
                    <ThemeSelector />
                    <LogoutButton />
                </div>
			</div>
			
			<div className="p-4 flex flex-col flex-1 overflow-hidden">
				<SearchInput />
				<div className='divider px-3 my-2'></div>
				<Conversations />
			</div>
		</div>
	);
};
export default Sidebar;

// STARTER CODE FOR THIS FILE
// import Conversations from "./Conversations";
// import LogoutButton from "./LogoutButton";
// import SearchInput from "./SearchInput";

// const Sidebar = () => {
// 	return (
// 		<div className='border-r border-slate-500 p-4 flex flex-col'>
// 			<SearchInput />
// 			<div className='divider px-3'></div>
// 			<Conversations />
// 			<LogoutButton />
// 		</div>
// 	);
// };
// export default Sidebar;
