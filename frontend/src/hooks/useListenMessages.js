import { useEffect, useCallback } from "react";

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

  useEffect(() => {
    socket?.on("newMessage", handleNewMessage);

    return () => {
      socket?.off("newMessage", handleNewMessage);
    };
  }, [socket, handleNewMessage]);
};
export default useListenMessages;
