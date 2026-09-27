import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Compare my last two reports",
    "What are the key findings in my latest report?",
    "Summarize the trends in my reports over the last 6 months",
    "What are the most common issues found in my reports?",
    "Suggest diet plan based on my latest report",
  ]);
  const [messages, setMessages] = useState([]);
  const MIN_WIDTH = 600;
  const [width, setWidth] = useState(0);
  const isOpen = width > 0;
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("LATEST_REPORT");
  const [customReports, setCustomReports] = useState(1);

  const sendMessage = async (message) => {
    if (message.trim() === "") return;
    if (!user?.token) {
      // alert the user to log in
      toast.error("Please log in to use Certus AI.");
      return;
    }
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      currentConversationId = crypto.randomUUID();
      setConversationId(currentConversationId);
    }
    // add message here
    addMessage({
      role: "user",
      content: message,
    });
    setUserInput("");
    setLoading(true);
    const request = {
      conversationId: currentConversationId,
      message,
      selectedOption,
      customReports,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log(data);
      addMessage({
        role: "assistant",
        content: data.answer,
        references: data.references || [],
        suggestedQuestions: data.suggestedQuestions || [],
      });

      if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
        setSuggestedQuestions(data.suggestedQuestions);
      }
    } catch (error) {
      addMessage({
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
      });
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => setWidth(MIN_WIDTH);
  const closeChat = () => setWidth(0);
  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };
  const addMessage = ({
    role,
    content,
    references = [],
    suggestedQuestions = [],
  }) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: crypto.randomUUID(),
        role,
        content,
        references,
        suggestedQuestions,
        timestamp: new Date(),
      },
    ]);
  };

  const clearChat = () => setMessages([]);

  const value = {
    MIN_WIDTH,
    isOpen,
    openChat,
    closeChat,
    toggleChat,

    messages,
    addMessage,
    clearChat,
    suggestedQuestions,
    setSuggestedQuestions,

    width,
    setWidth,

    loading,
    setLoading,

    userInput,
    setUserInput,

    conversationId,
    setConversationId,
    selectedOption,
    setSelectedOption,
    customReports,
    setCustomReports,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChat() {
  return useContext(ChatContext);
}
