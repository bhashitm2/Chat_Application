import { useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages, selectedConversation } = useConversation();

  const handleNewMessage = useCallback(
    (newMessage) => {
      // Only add message if it belongs to the currently selected conversation
      if (
        selectedConversation &&
        (newMessage.senderId === selectedConversation._id ||
          newMessage.receiverId === selectedConversation._id)
      ) {
        // Create a copy to avoid mutation
        const messageWithShake = { ...newMessage, shouldShake: true };

        const sound = new Audio(notificationSound);
        sound.play().catch((e) => console.log("Audio play failed:", e));

        setMessages((prevMessages) => [...prevMessages, messageWithShake]);
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
    socket?.on("messageDeleted", handleMessageDeleted);
    socket?.on("conversationDeleted", handleConversationDeleted);

    return () => {
      socket?.off("newMessage", handleNewMessage);
      socket?.off("messageDeleted", handleMessageDeleted);
      socket?.off("conversationDeleted", handleConversationDeleted);
    };
  }, [socket, handleNewMessage, handleMessageDeleted, handleConversationDeleted]);
};
export default useListenMessages;
