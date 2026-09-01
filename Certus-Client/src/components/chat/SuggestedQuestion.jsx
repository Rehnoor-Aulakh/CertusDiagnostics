import { useChat } from "../../contexts/ChatContext";
import styled from "styled-components";

const Container = styled.div`
  border: 1px solid #383737;
  border-radius: 12px;
  padding: 12px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: #3b4d6b;
  }
`;

export default function SuggestedQuestion({ question }) {
  const { setUserInput } = useChat();
  return (
    <Container
      className="bg-blue-500 text-gray-200"
      onClick={() => setUserInput(question)}
    >
      {question}
    </Container>
  );
}
