import styled, { keyframes } from "styled-components";

const bounce = keyframes`
0%,80%,100%{
    transform:scale(0.7);
    opacity:.4;
}
40%{
    transform:scale(1);
    opacity:1;
}
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  align-self: flex-start;
  padding: 12px 16px;
  border-radius: 10px;
  margin: 4px 16px;
  gap: 8px;
`;

const Label = styled.span`
  color: #8fa8ff;
  font-weight: 600;
  font-size: 14px;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8fa8ff;
  animation: ${bounce} 1.2s infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export default function TypingIndicator() {
  return (
    <MessageContainer>
      <Label>Certus AI: Typing Indicator</Label>
      <DotsContainer>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </DotsContainer>
    </MessageContainer>
  );
}
