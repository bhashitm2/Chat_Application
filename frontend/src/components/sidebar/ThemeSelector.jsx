import { motion } from "framer-motion";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import useTheme from "../../zustand/useTheme";

// sun/moon light-dark toggle (design: sidebar header, 36px surface circle)
const ThemeSelector = () => {
	const { theme, toggleTheme } = useTheme();
	const isDark = theme === "dark";

	return (
		<motion.button
			type='button'
			whileHover={{ scale: 1.1, rotate: -15 }}
			whileTap={{ scale: 0.9 }}
			transition={{ type: "spring", stiffness: 500, damping: 22 }}
			onClick={toggleTheme}
			className='w-9 h-9 rounded-full flex items-center justify-center bg-surface text-icon-dim theme-fade'
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{isDark ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={17} />}
		</motion.button>
	);
};
export default ThemeSelector;
