import styled from "styled-components";
import { useChat } from "../../contexts/ChatContext";
import ChatHeader from "./ChatWelcome";
import ChatInput from "./ChatInput";
import Conversation from "./Conversation";
import ResizeHandle from "./ResizeHandle";
import ChatWelcome from "./ChatWelcome";

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: ${({ width }) => width}px;
  background: #24324a;
  display: flex;
  flex-direction: column;
  z-index: 9998;
  top: 80px;
  height: calc(100vh - 80px);
  overflow: hidden;
`;

export default function ChatPanel() {
  const { isOpen, width, messages } = useChat();
  return (
    <Panel isOpen={isOpen} width={width}>
      {messages.length === 0 ? <ChatWelcome /> : <ChatHeader />}
      {messages.length > 0 && <Conversation />}
      <ChatInput />
    </Panel>
  );
}
