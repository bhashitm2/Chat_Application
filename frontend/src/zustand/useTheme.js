import { create } from "zustand";

// "Modern Soft" redesign: theme is strictly light or dark. Older builds stored
// wallpaper theme names under the same key — map anything unknown to light.
const stored = localStorage.getItem("chat-theme");
const initial = stored === "dark" || stored === "light" ? stored : "light";

const useTheme = create((set) => ({
	theme: initial,
	toggleTheme: () =>
		set((state) => {
			const theme = state.theme === "dark" ? "light" : "dark";
			localStorage.setItem("chat-theme", theme);
			return { theme };
		}),
}));

export default useTheme;
