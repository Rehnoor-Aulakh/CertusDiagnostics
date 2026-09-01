import { useChat } from "../../contexts/ChatContext";
import styled from "styled-components";
const Handle = styled.div`
  position: absolute;
  top: 0;
  left: -3px;

  width: 6px;
  height: 100%;

  cursor: col-resize;

  z-index: 10000;
  &:hover {
    background: rgba(61, 132, 255, 0.25);
  }
`;
export default function ResizeHandle() {
  const { setWidth, closeChat, openChat } = useChat();
  const handleMouseDown = () => {
    document.body.style.userSelect = "none";
    openChat(); // Ensure the chat is open when resizing
    // Handle mouse down event for resizing
    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      const MIN_WIDTH = 320;
      const CLOSE_THRESHOLD = 250; // Width below which the chat will close
      const MAX_WIDTH = window.innerWidth * 0.7;

      if (newWidth < CLOSE_THRESHOLD) {
        closeChat();
        return;
      }
      setWidth(Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };
  return <Handle onMouseDown={handleMouseDown}></Handle>;
}
