import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";
import { fetchPatientHistory } from "../lib/apiClient";
import { useAuth } from "./AuthContext";

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
  // Tracks whether the current logged-in user has health history
  const [hasHistory, setHasHistory] = useState(false);

  const sendMessage = async (message) => {
    if (message.trim() === "") return;
    if (!user?.token) {
      toast.error("Please log in to use Certus AI.");
      return;
    }
    // Block if we know they have no history
    if (!hasHistory) {
      toast.error("You need to get a blood test done to access Certus AI.");
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

  const queryClient = useQueryClient();

  const handleOpenChat = async () => {
    if (!user?.token) {
      toast.error("Please log in to use Certus AI.");
      return;
    }

    const toastId = toast.loading("Checking your health history...");
    try {
      // Use queryClient to get the data (it will instantly return if cached!)
      const historyData = await queryClient.fetchQuery({
        queryKey: ["patient-history", user.token],
        queryFn: () => fetchPatientHistory(user.token),
        staleTime: 5 * 60 * 1000,
      });

      toast.dismiss(toastId);

      // The backend always returns a summary object even for empty patients,
      // so we must check totalTests > 0, not just object existence.
      const hasGraphs = historyData?.graphs && historyData.graphs.length > 0;
      const hasSummary = (historyData?.summary?.totalTests ?? 0) > 0;

      if (!hasGraphs && !hasSummary) {
        setHasHistory(false);
        toast.error("You need to get a blood test done to access Certus AI.");
        return;
      }

      setHasHistory(true);
      setWidth(MIN_WIDTH);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to verify your records. Please try again.");
    }
  };

  const openChat = () => handleOpenChat();
  const closeChat = () => setWidth(0);
  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      handleOpenChat();
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
