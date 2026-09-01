import { SendHorizonal } from "lucide-react";
import styled from "styled-components";
import SuggestedQuestions from "./SuggestedQuestions";
import { useChat } from "../../contexts/ChatContext";

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 32px);
  border-radius: 16px;
  border: 1px solid #3b4d6b;
  margin: 16px;
  padding: 12px 16px;
  min-height: 64px;
  background: #2d3b56;
  flex-shrink: 0;
`;

const Input = styled.textarea`
  flex: 1;
  resize: none;
  border: none;
  align-items: center;
  outline: none;
  background: transparent;
  color: white;
  font-size: 15px;
  line-height: 1.5;
  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  width: 42px;
  height: 42px;

  border: none;
  border-radius: 50%;

  background: #4f8dfd;

  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &:hover {
    background: #3777f5;
  }
`;
export default function ChatInput() {
  const { userInput, setUserInput } = useChat();
  return (
    <>
      <SuggestedQuestions />
      <InputContainer className="mx-20 mb-10">
        <Input
          rows={1}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask anything about your reports"
          className="bg-transparent focus:outline-none w-full"
        />
        <SendButton>
          <SendHorizonal size={18} />
        </SendButton>
      </InputContainer>
    </>
  );
}
