const Preloader = () => {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm transition-opacity duration-700">
			<div className="relative flex flex-col items-center">
				{/* Animation Wrapper */}
				<div className="relative h-16 w-16 mb-4">
					{/* Spinner */}
					<div className="absolute inset-0 animate-spin rounded-full border-t-2 border-b-2 border-sky-500"></div>
					{/* Pulse Effect */}
					<div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping"></div>
				</div>
				
                <h2 className="text-xl font-semibold text-white tracking-widest animate-pulse">
					LOADING
				</h2>
			</div>
		</div>
	);
};

export default Preloader;
