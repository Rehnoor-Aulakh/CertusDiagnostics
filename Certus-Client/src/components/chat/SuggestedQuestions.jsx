import styled from "styled-components";
import SuggestedQuestion from "./SuggestedQuestion";

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 14px 16px;
  gap: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
`;

const suggestedQuestions = [
  "Compare my last two reports",
  "What are the key findings in my latest report?",
  "Summarize the trends in my reports over the last 6 months",
  "What are the most common issues found in my reports?",
  "Suggest diet plan based on my latest report",
];

export default function SuggestedQuestions() {
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
