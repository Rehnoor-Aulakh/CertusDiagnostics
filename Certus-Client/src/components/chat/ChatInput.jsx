import { Check, ChevronUp, CircleStop, SendHorizonal } from "lucide-react";
import styled from "styled-components";
import SuggestedQuestions from "./SuggestedQuestions";
import { useChat } from "../../contexts/ChatContext";
import { useEffect, useRef, useState } from "react";
const Container = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #24324a;
`;
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
  outline: none;
  background: transparent;
  color: white;
  font-size: 15px;
  line-height: 1.5;
  max-height: 250px;
  overflow-y: auto;
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
const StopButton = styled.button`
  width: 42px;
  height: 42px;

  border: none;
  border-radius: 50%;

  background: #f50303;

  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &:hover {
    background: #fd3b3b;
  }
`;
const ContextOptionsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-right: 18px;
`;
const Menu = styled.div`
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 220px;
  background: #24324a;
  border: 1px solid #3b4d6b;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  z-index: 1000;
`;
const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  &:hover {
    background-color: #3b4d6b;
  }
`;
const options = {
  LATEST_REPORT: "Latest Report",
  LAST_TWO_REPORTS: "Last 2 Reports",
  LAST_THREE_MONTHS: "Last 3 Months",
  LAST_SIX_MONTHS: "Last 6 Months",
  LAST_ONE_YEAR: "Last 1 Year",
  CUSTOM: "Custom",
};
const MENU_MODE = {
  OPTIONS: "OPTIONS",
  CUSTOM: "CUSTOM",
};
const CustomMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const CustomTitle = styled.div`
  color: white;
  font-size: 15px;
  font-weight: 600;
`;

const ReportsInput = styled.input`
  width: 100%;
  padding: 10px 12px;

  border: 1px solid #3b4d6b;
  border-radius: 8px;

  background: #1d2636;
  color: white;

  outline: none;

  &:focus {
    border-color: #4f8dfd;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const MenuButton = styled.button`
  padding: 8px 14px;

  border: none;
  border-radius: 8px;

  cursor: pointer;

  background: ${({ primary }) => (primary ? "#4f8dfd" : "#374151")};

  color: white;

  &:hover {
    background: ${({ primary }) => (primary ? "#3777f5" : "#4b5563")};
  }
`;
export default function ChatInput() {
  const {
    userInput,
    setUserInput,
    loading,
    selectedOption,
    setSelectedOption,
    customReports,
    setCustomReports,
    sendMessage,
  } = useChat();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuMode, setMenuMode] = useState("OPTIONS");
  const contextMenuRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (!userInput) {
        textarea.style.height = "24px";
      } else {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [userInput]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
        setMenuMode(MENU_MODE.OPTIONS);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Container>
      <SuggestedQuestions />
      <InputContainer className="mx-20 mb-10">
        <Input
          ref={textareaRef}
          rows={1}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(userInput, selectedOption, customReports);
            }
          }}
          placeholder="Ask anything about your reports"
          className="bg-transparent focus:outline-none w-full"
        />
        <ContextOptionsContainer ref={contextMenuRef}>
          {isMenuOpen && (
            <Menu>
              {menuMode === MENU_MODE.OPTIONS ? (
                <>
                  {Object.entries(options).map(([key, value]) => (
                    <MenuItem
                      key={key}
                      onClick={() => {
                        if (key === "CUSTOM") {
                          setMenuMode(MENU_MODE.CUSTOM);
                        } else {
                          setSelectedOption(key);
                          setIsMenuOpen(false);
                        }
                      }}
                    >
                      <span>{value}</span>

                      {selectedOption === key && (
                        <Check size={18} color="#bcb7b7" />
                      )}
                    </MenuItem>
                  ))}
                </>
              ) : (
                <CustomMenuContainer>
                  <CustomTitle>Enter number of latest reports</CustomTitle>

                  <ReportsInput
                    type="number"
                    min={1}
                    value={customReports}
                    onChange={(e) => setCustomReports(Number(e.target.value))}
                  />

                  <ButtonRow>
                    <MenuButton
                      onClick={() => {
                        setMenuMode(MENU_MODE.OPTIONS);
                      }}
                    >
                      Back
                    </MenuButton>

                    <MenuButton
                      primary
                      onClick={() => {
                        setSelectedOption("CUSTOM");
                        setIsMenuOpen(false);
                        setMenuMode(MENU_MODE.OPTIONS);
                      }}
                    >
                      Apply
                    </MenuButton>
                  </ButtonRow>
                </CustomMenuContainer>
              )}
            </Menu>
          )}
          <MenuItem
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ gap: "12px" }}
          >
            {options[selectedOption]} <ChevronUp size={20} color="#bcb7b7" />
          </MenuItem>
        </ContextOptionsContainer>
        {loading ? (
          <StopButton>
            <CircleStop size={18} />
          </StopButton>
        ) : (
          <SendButton
            onClick={() =>
              sendMessage(userInput, selectedOption, customReports)
            }
          >
            <SendHorizonal size={18} />
          </SendButton>
        )}
      </InputContainer>
    </Container>
  );
}
