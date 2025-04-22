
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types";
import ChatMessageComponent from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hi there! I'm your scheduling assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Example responses for different types of scheduling requests
  const mockResponses: Record<string, string> = {
    schedule: "I can schedule that for you. When would be a good time for this meeting?",
    move: "I'll move that meeting for you. Is 4pm still good for you?",
    query: "Let me check your calendar for tomorrow. You have 3 meetings scheduled: a team standup at 9:30am, a client call at 11am, and a planning session at 2pm.",
    preference: "I've noted your preference for meetings before lunch. I'll prioritize morning slots for future scheduling.",
    default: "I'm not sure I understand. Could you tell me more about what you need help with regarding your schedule?",
  };

  // Simulate AI response based on user input
  const getAIResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes("schedule") || lowerCaseMessage.includes("set up") || lowerCaseMessage.includes("create meeting")) {
      return mockResponses.schedule;
    } else if (lowerCaseMessage.includes("move") || lowerCaseMessage.includes("reschedule") || lowerCaseMessage.includes("change time")) {
      return mockResponses.move;
    } else if (lowerCaseMessage.includes("what") || lowerCaseMessage.includes("show") || lowerCaseMessage.includes("check")) {
      return mockResponses.query;
    } else if (lowerCaseMessage.includes("prefer") || lowerCaseMessage.includes("like to") || lowerCaseMessage.includes("don't want")) {
      return mockResponses.preference;
    } else {
      return mockResponses.default;
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get AI response
      const responseContent = getAIResponse(input);
      
      // Add AI response
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        content: responseContent,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full border rounded-lg shadow-sm">
      <CardContent className="flex flex-col h-full p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex items-end space-x-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[60px] resize-none"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
