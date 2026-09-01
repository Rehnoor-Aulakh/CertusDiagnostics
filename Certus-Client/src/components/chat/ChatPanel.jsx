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

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  /* Add padding bottom to account for the height of the fixed input at the bottom */
  padding-bottom: 150px; 
  display: flex;
  flex-direction: column;
  justify-content: ${({ centerContent }) => (centerContent ? "center" : "flex-start")};
`;

export default function ChatPanel() {
  const { isOpen, width, messages } = useChat();
  const isWelcome = messages.length === 0;
  return (
    <Panel isOpen={isOpen} width={width}>
      <MessagesContainer centerContent={isWelcome}>
        {isWelcome ? <ChatWelcome /> : <Conversation />}
      </MessagesContainer>
      <ChatInput />
    </Panel>
  );
}
