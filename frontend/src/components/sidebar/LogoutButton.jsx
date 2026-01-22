import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
	const { loading, logout } = useLogout();

	return (
		<div className='flex items-center'>
			{!loading ? (
				<BiLogOut className='w-6 h-6 text-white cursor-pointer hover:text-sky-500 transition-colors' onClick={logout} />
			) : (
				<span className='loading loading-spinner'></span>
			)}
		</div>
	);
};
export default LogoutButton;
