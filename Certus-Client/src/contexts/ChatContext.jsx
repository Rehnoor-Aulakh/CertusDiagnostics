import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const suggestedQuestions = [
    "Compare my last two reports",
    "What are the key findings in my latest report?",
    "Summarize the trends in my reports over the last 6 months",
    "What are the most common issues found in my reports?",
    "Suggest diet plan based on my latest report",
  ];
  const [messages, setMessages] = useState([]);
  const MIN_WIDTH = 600;
  const [width, setWidth] = useState(0);
  const isOpen = width > 0;
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState("");

  const openChat = () => setWidth(MIN_WIDTH);
  const closeChat = () => setWidth(0);
  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
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

    width,
    setWidth,

    loading,
    setLoading,

    userInput,
    setUserInput,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChat() {
  return useContext(ChatContext);
}
