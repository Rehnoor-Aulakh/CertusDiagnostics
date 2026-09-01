import styled from "styled-components";
import { useChat } from "../../contexts/ChatContext";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import Conversation from "./Conversation";
import ResizeHandle from "./ResizeHandle";

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: ${({ width }) => width}px;
  background: #24324a;
  transform: ${({ isOpen }) => (isOpen ? "translateX(0)" : "translateX(100%)")};
  transition: transform 0.1s ease;
  display: flex;
  flex-direction: column;
  z-index: 9998;
  margin-top: 80px;
`;

export default function ChatPanel() {
  const { isOpen, width } = useChat();
  return (
    <Panel isOpen={isOpen} width={width}>
      <ResizeHandle />
      <ChatHeader />
      <Conversation />
      <ChatInput />
    </Panel>
  );
}
