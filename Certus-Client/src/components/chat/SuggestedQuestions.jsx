import styled from "styled-components";
import SuggestedQuestion from "./SuggestedQuestion";
import { useChat } from "../../contexts/ChatContext";

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 14px 16px;
  gap: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 16px;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
`;

export default function SuggestedQuestions() {
  const { suggestedQuestions } = useChat();
  return (
    <>
      <QuestionsContainer>
        {suggestedQuestions.map((question, index) => (
          <SuggestedQuestion key={index} question={question} />
        ))}
      </QuestionsContainer>
    </>
  );
}
