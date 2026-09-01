import styled from "styled-components";

const MessageContainer = styled.div``;
const Bubble = styled.div``;
export default function ChatMessage({ message }) {
  return (
    <MessageContainer role={message.role}>
      <Bubble>{message.content}</Bubble>
    </MessageContainer>
  );
}
