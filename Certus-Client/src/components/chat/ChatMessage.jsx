import { useChat } from "../../contexts/ChatContext";
import styled from "styled-components";
import TypingIndicator from "./TypingIndicator";

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ role }) => (role === "user" ? "flex-end" : "flex-start")};
  background-color: ${({ role }) => role === "user" && "#184eac"};
  max-width: ${({ role }) => (role === "user" ? "70%" : "100%")};
  align-self: ${({ role }) => (role === "user" ? "flex-end" : "flex-start")};
  padding: 12px 16px;
  border-radius: 10px;
  margin: 4px 16px;
  width: ${({ role }) => role === "assistant" && "90%"};
  border: ${({ role }) => role === "assistant" && "1px solid #3b4d6b"};
`;
const Bubble = styled.div``;
const CertusLabel = styled.span`
  font-weight: bold;
  color: #4f8dfd;
  margin-right: 8px;
`;
export default function ChatMessage({ message }) {
  const { loading } = useChat();
  return (
    <MessageContainer role={message.role}>
      <Bubble>
        {message.role === "assistant" && <CertusLabel>Certus AI:</CertusLabel>}
        {message.content}
      </Bubble>
    </MessageContainer>
  );
}
