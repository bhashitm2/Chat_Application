import { Link } from "react-router-dom";
import GenderCheckbox from "./GenderCheckbox";
import { useState } from "react";
import useSignup from "../../hooks/useSignup";

const field =
	"w-full h-11 px-4 rounded-pill bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40 theme-fade";

const SignUp = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		password: "",
		confirmPassword: "",
		gender: "",
	});

	const { loading, signup } = useSignup();

	const handleCheckboxChange = (gender) => {
		setInputs({ ...inputs, gender });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await signup(inputs);
	};

	return (
		<div className='flex flex-col items-center justify-center w-full max-w-md mx-auto'>
			<div className='w-full max-h-[92vh] overflow-y-auto chat-scroll p-7 rounded-card bg-panel border border-line shadow-frame theme-fade'>
				<div className='flex flex-col items-center mb-5'>
					<div className='w-14 h-14 rounded-[18px] bg-grad glow-send flex items-center justify-center rotate-6 mb-3'>
						<svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
						</svg>
					</div>
					<h1 className='text-2xl font-extrabold tracking-tight text-ink'>Create your account</h1>
					<p className='text-sm text-ink-dim mt-1'>Join ChatApp in seconds</p>
				</div>

				<form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
					<div>
						<label className='block text-[13px] font-bold text-ink-dim mb-1.5'>Full Name</label>
						<input
							type='text'
							placeholder='John Doe'
							className={field}
							value={inputs.fullName}
							onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
						/>
					</div>

					<div>
						<label className='block text-[13px] font-bold text-ink-dim mb-1.5'>Username</label>
						<input
							type='text'
							placeholder='johndoe'
							className={field}
							value={inputs.username}
							onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
						/>
					</div>

					<div>
						<label className='block text-[13px] font-bold text-ink-dim mb-1.5'>Password</label>
						<input
							type='password'
							placeholder='Enter password'
							className={field}
							value={inputs.password}
							onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
						/>
					</div>

					<div>
						<label className='block text-[13px] font-bold text-ink-dim mb-1.5'>Confirm Password</label>
						<input
							type='password'
							placeholder='Confirm password'
							className={field}
							value={inputs.confirmPassword}
							onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
						/>
					</div>

					<GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />

					<button
						className='w-full h-11 mt-1 rounded-pill bg-grad glow-send text-white text-sm font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60'
						disabled={loading}
					>
						{loading ? <span className='loading loading-spinner loading-sm'></span> : "Sign Up"}
					</button>

					<Link to='/login' className='text-[13px] text-ink-dim hover:text-accent transition-colors text-center'>
						Already have an account? <span className='font-bold text-accent'>Log in</span>
					</Link>
				</form>
			</div>
		</div>
	);
};
export default SignUp;
