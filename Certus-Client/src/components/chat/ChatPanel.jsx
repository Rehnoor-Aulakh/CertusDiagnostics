import { useEffect } from "react";
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
  overscroll-behavior: contain;
  touch-action: auto;
  scrollbar-color: #4f8dfd transparent;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #4f8dfd;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    top: 64px;
    height: calc(100vh - 64px);
    width: ${({ isOpen }) => (isOpen ? "100vw" : "0")} !important;
    left: ${({ isOpen }) => (isOpen ? "0" : "100vw")};
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: auto;
  /* Add padding bottom to account for the height of the fixed input at the bottom */
  padding-bottom: 150px;
  display: flex;
  flex-direction: column;
  justify-content: ${({ centerContent }) =>
    centerContent ? "center" : "flex-start"};
`;

export default function ChatPanel() {
  const { isOpen, width, messages } = useChat();
  const isWelcome = messages.length === 0;

  useEffect(() => {
    const handleResize = () => {
      if (isOpen && window.innerWidth <= 768) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.style.touchAction = "none";
      } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.body.style.touchAction = "";
      }
    };

    handleResize(); // Check initially
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  return (
    <Panel isOpen={isOpen} width={width}>
      <MessagesContainer centerContent={isWelcome} className="mb-20">
        {isWelcome ? <ChatWelcome /> : <Conversation />}
      </MessagesContainer>
      <ChatInput />
    </Panel>
  );
}
