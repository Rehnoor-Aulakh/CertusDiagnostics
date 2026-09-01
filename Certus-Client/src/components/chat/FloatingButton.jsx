import { useChat } from "../../contexts/ChatContext";
import { Bot } from "lucide-react";

export default function FloatingButton() {
  const { toggleChat } = useChat();
  return (
    <button onClick={toggleChat}>
      <Bot size={"30"} />
    </button>
  );
}
