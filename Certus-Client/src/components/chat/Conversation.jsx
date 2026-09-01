import { useChat } from "../../contexts/ChatContext";
import ChatMessage from "./ChatMessage";

export default function Conversation() {
  const { messages } = useChat();
  return (
    <>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </>
  );
}
