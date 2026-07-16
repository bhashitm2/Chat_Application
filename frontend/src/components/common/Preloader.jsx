const Preloader = () => {
	return (
		<div className='fixed inset-0 z-50 flex flex-col items-center justify-center theme-fade' style={{ background: "var(--app-bg)" }}>
			<div className='relative flex flex-col items-center'>
				<div className='relative h-16 w-16 mb-5'>
					<div className='absolute inset-0 rounded-[22px] bg-grad glow-send flex items-center justify-center rotate-6'>
						<svg width='30' height='30' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
						</svg>
					</div>
					<div className='absolute inset-0 rounded-[22px] bg-grad opacity-30 animate-ping'></div>
				</div>

				<h2 className='text-lg font-extrabold tracking-tight text-ink'>ChatApp</h2>
				<p className='text-xs text-ink-faint mt-1 animate-pulse'>loading…</p>
			</div>
		</div>
	);
};

export default Preloader;
