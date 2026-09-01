import React, { useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import styled from "styled-components";

const Handle = styled.div`
  position: fixed;
  top: 80px;
  right: ${({ width }) => width - 3}px;
  width: 6px;
  height: calc(100vh - 80px);
  cursor: col-resize;
  z-index: 10001;
  background: ${({ $isResizing }) => ($isResizing ? "#3b82f6" : "transparent")};
  &:hover {
    background: #3b82f6;
  }
`;

export default function ResizeHandle() {
  const { setWidth, width, MIN_WIDTH } = useChat();
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e) => {
    const MAX_WIDTH = window.innerWidth * 0.8;
    const startX = e.clientX;
    const initialWidth = width;

    setIsResizing(true);
    document.body.style.userSelect = "none";
    let isDragging = false;
    let finalWidth = initialWidth;

    const handleMouseMove = (ev) => {
      isDragging = true;
      const newWidth = window.innerWidth - ev.clientX;
      finalWidth = Math.max(0, Math.min(newWidth, MAX_WIDTH));
      setWidth(finalWidth);
    };

    const handleMouseUp = (ev) => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";

      if (!isDragging || Math.abs(ev.clientX - startX) < 5) {
        // It was a click
        if (initialWidth === 0) {
          setWidth(MIN_WIDTH);
        } else {
          setWidth(initialWidth);
        }
      } else {
        // It was a drag. Apply snapping logic on release.
        if (finalWidth < MIN_WIDTH / 2) {
          setWidth(0); // Snap close
        } else if (finalWidth < MIN_WIDTH) {
          setWidth(MIN_WIDTH); // Snap to minimum width
        } else {
          setWidth(finalWidth); // Keep the dragged width
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Handle
      width={width}
      $isResizing={isResizing}
      onMouseDown={handleMouseDown}
    ></Handle>
  );
}
