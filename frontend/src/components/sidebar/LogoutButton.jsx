import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
	const { loading, logout } = useLogout();

	return (
		<div className='shrink-0'>
			{!loading ? (
				<button
					onClick={logout}
					className='w-9 h-9 rounded-full flex items-center justify-center text-icon-dim hover:bg-surface hover:text-red-400 spring'
					title='Log out'
				>
					<BiLogOut className='w-5 h-5' />
				</button>
			) : (
				<span className='loading loading-spinner loading-sm text-accent'></span>
			)}
		</div>
	);
};
export default LogoutButton;
