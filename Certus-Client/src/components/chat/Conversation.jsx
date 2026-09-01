import { useEffect, useRef } from "react";
import styled from "styled-components";
import { useChat } from "../../contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
const Container = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
export default function Conversation() {
  const { messages, loading } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <Container>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {loading && <TypingIndicator />}
      <div ref={bottomRef} />
    </Container>
  );
}
