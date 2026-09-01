import React from "react";
import FloatingButton from "./FloatingButton";
import ChatPanel from "./ChatPanel";
import ResizeHandle from "./ResizeHandle";

export default function Chatbot() {
  return (
    <>
      <ResizeHandle />
      <ChatPanel />
    </>
  );
}
