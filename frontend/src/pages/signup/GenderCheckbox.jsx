const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
	const pill = (value, label) => {
		const active = selectedGender === value;
		return (
			<button
				type='button'
				onClick={() => onCheckboxChange(value)}
				className={`flex-1 h-10 rounded-pill text-sm transition-all ${
					active ? "bg-grad text-white font-bold shadow-row-active" : "bg-surface text-ink-dim font-semibold theme-fade"
				}`}
			>
				{label}
			</button>
		);
	};

	return (
		<div>
			<label className='block text-[13px] font-bold text-ink-dim mb-1.5'>Gender</label>
			<div className='flex gap-2'>
				{pill("male", "Male")}
				{pill("female", "Female")}
			</div>
		</div>
	);
};
export default GenderCheckbox;
