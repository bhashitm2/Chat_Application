import { useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

import notificationSound from "../assets/sounds/notification.mp3";

// Mounted while a conversation is OPEN (inside Messages). Handles events for
// the visible chat; useListenSidebar handles the always-on sidebar updates.
const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages, selectedConversation } = useConversation();

  const handleNewMessage = useCallback(
    (newMessage) => {
      if (!selectedConversation) return;

      if (
        newMessage.senderId === selectedConversation._id ||
        newMessage.receiverId === selectedConversation._id
      ) {
        const messageWithShake = { ...newMessage, shouldShake: true };

        const sound = new Audio(notificationSound);
        sound.play().catch(() => {});

        setMessages((prevMessages) => [...prevMessages, messageWithShake]);

        // the chat is on screen, so the sender's checks should turn read now
        if (newMessage.senderId === selectedConversation._id) {
          fetch(`/api/messages/read/${selectedConversation._id}`, { method: "POST" }).catch(() => {});
        }
      }
    },
    [setMessages, selectedConversation]
  );

  const handleMessagesRead = useCallback(
    ({ readerId }) => {
      // the friend opened our chat — flip every outgoing message to read
      if (selectedConversation && selectedConversation._id === readerId) {
        setMessages((prev) => prev.map((m) => (m.read ? m : { ...m, read: true })));
      }
    },
    [setMessages, selectedConversation]
  );

  const handleMessageDeleted = useCallback(
    ({ messageId }) => {
      setMessages((prevMessages) => prevMessages.filter((m) => m._id !== messageId));
    },
    [setMessages]
  );

  const handleConversationDeleted = useCallback(
    ({ peerId }) => {
      if (selectedConversation && selectedConversation._id === peerId) {
        setMessages([]);
      }
      toast("A chat was deleted", { icon: "🗑️" });
    },
    [setMessages, selectedConversation]
  );

  useEffect(() => {
    socket?.on("newMessage", handleNewMessage);
    socket?.on("messagesRead", handleMessagesRead);
    socket?.on("messageDeleted", handleMessageDeleted);
    socket?.on("conversationDeleted", handleConversationDeleted);

    return () => {
      socket?.off("newMessage", handleNewMessage);
      socket?.off("messagesRead", handleMessagesRead);
      socket?.off("messageDeleted", handleMessageDeleted);
      socket?.off("conversationDeleted", handleConversationDeleted);
    };
  }, [socket, handleNewMessage, handleMessagesRead, handleMessageDeleted, handleConversationDeleted]);
};
export default useListenMessages;
