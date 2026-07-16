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
	// ephemeral, socket-driven: { [userId]: true } while that user is typing to me
	typingUsers: {},
	setTyping: (userId, isTyping) =>
		set((state) => {
			const typingUsers = { ...state.typingUsers };
			if (isTyping) typingUsers[userId] = true;
			else delete typingUsers[userId];
			return { typingUsers };
		}),
}));

export default useConversation;
