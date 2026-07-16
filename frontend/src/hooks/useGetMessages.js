import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/${selectedConversation._id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMessages(data);
        // opening the chat marked its messages read server-side — refresh
        // the sidebar so this conversation's unread badge clears
        useConversation.getState().bumpSidebar();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) {
      getMessages();
    } else {
      // Clear messages when no conversation is selected
      setMessages([]);
    }
  }, [selectedConversation?._id, setMessages]);

  return { messages, loading };
};
export default useGetMessages;
