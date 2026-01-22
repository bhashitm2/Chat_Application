import { create } from "zustand";

const useTheme = create((set) => ({
    theme: localStorage.getItem("chat-theme") || "default",
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);
        set({ theme });
    },
}));

export default useTheme;
