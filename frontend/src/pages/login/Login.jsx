import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const { loading, login } = useLogin();

	const handleSubmit = async (e) => {
		e.preventDefault();
		await login(username, password);
	};

	return (
		<div className='flex flex-col items-center justify-center w-full max-w-md mx-auto'>
			<div className='w-full p-7 rounded-card bg-panel border border-line shadow-frame theme-fade'>
				<div className='flex flex-col items-center mb-6'>
					<div className='w-14 h-14 rounded-[18px] bg-grad glow-send flex items-center justify-center rotate-6 mb-3'>
						<svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
						</svg>
					</div>
					<h1 className='text-2xl font-extrabold tracking-tight text-ink'>
						Welcome back
					</h1>
					<p className='text-sm text-ink-dim mt-1'>Log in to ChatApp</p>
				</div>

				<form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
					<div>
						<label className='block text-[13px] font-bold text-ink-dim mb-1.5'>Username</label>
						<input
							type='text'
							placeholder='Enter username'
							className='w-full h-11 px-4 rounded-pill bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40 theme-fade'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>

					<div>
						<label className='block text-[13px] font-bold text-ink-dim mb-1.5'>Password</label>
						<input
							type='password'
							placeholder='Enter password'
							className='w-full h-11 px-4 rounded-pill bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40 theme-fade'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<button
						className='w-full h-11 mt-1 rounded-pill bg-grad glow-send text-white text-sm font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60'
						disabled={loading}
					>
						{loading ? <span className='loading loading-spinner loading-sm'></span> : "Log In"}
					</button>

					<Link to='/signup' className='text-[13px] text-ink-dim hover:text-accent transition-colors text-center'>
						{"Don't"} have an account? <span className='font-bold text-accent'>Sign up</span>
					</Link>
				</form>
			</div>
		</div>
	);
};
export default Login;
