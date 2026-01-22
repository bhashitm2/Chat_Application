import { IoColorPaletteSharp } from "react-icons/io5";
import { THEMES } from "../../utils/themes";
import useTheme from "../../zustand/useTheme";

const ThemeSelector = () => {
	const { theme, setTheme } = useTheme();

	return (
		<div className="dropdown dropdown-end">
			<div tabIndex={0} role="button" className="btn btn-circle btn-ghost text-white">
				<IoColorPaletteSharp className="w-6 h-6" />
			</div>
			<ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-slate-800 rounded-box w-52 border border-slate-700">
				{Object.keys(THEMES).map((t) => (
					<li key={t}>
						<button
							className={`text-gray-200 hover:bg-slate-700 ${theme === t ? "bg-slate-700 font-bold" : ""}`}
							onClick={() => setTheme(t)}
						>
							<span className="w-4 h-4 rounded-full mr-2" style={{ background: THEMES[t].bgColor }}></span>
							{THEMES[t].name}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};
export default ThemeSelector;
