
import React from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isTyping = message.role === "assistant-typing";

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : isTyping
              ? "bg-secondary/70 text-secondary-foreground"
              : "bg-secondary text-secondary-foreground"
        )}
      >
        {isTyping ? (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-foreground/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-foreground/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-foreground/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        ) : (
          <>
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessageComponent;
