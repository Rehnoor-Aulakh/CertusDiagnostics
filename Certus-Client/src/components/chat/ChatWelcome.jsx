import { Bot } from "lucide-react";
import styled from "styled-components";

const Header = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const TextContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 0.5rem;
`;

export default function ChatWelcome() {
  return (
    <Header>
      <Bot size={78} />
      <div className="mt-2 font-semibold" style={{ fontSize: "1.25rem" }}>
        Certus AI Assistant
      </div>
      <div>
        <div>Ask anything about your reports</div>
      </div>
    </Header>
  );
}
