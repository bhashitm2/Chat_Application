import { create } from "zustand";

const useConversation = create((set) => ({
	selectedConversation: null,
	setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
	messages: [],
	setMessages: (messages) =>
		set((state) => ({
			messages: typeof messages === "function" ? messages(state.messages) : messages,
		})),
	// bump to make useGetConversations refetch the sidebar (friend added/removed)
	sidebarVersion: 0,
	bumpSidebar: () => set((state) => ({ sidebarVersion: state.sidebarVersion + 1 })),
}));

export default useConversation;
