
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
import { supabase } from "@/integrations/supabase/client";
import EventModal from "../calendar/EventModal";
import { addDays, format, parse, parseISO } from "date-fns";

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
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDetails, setEventDetails] = useState<{
    title: string;
    startTime: Date;
    endTime: Date;
    attendees: string;
    description?: string;
  } | null>(null);
  const [hasApiError, setHasApiError] = useState(false);

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

  // Function to parse a date hint from the AI response
  const parseEventDate = (dateHint: string): Date => {
    const today = new Date();
    today.setHours(9, 0, 0, 0); // Default to 9 AM
    
    const lowercaseHint = dateHint.toLowerCase();
    
    if (lowercaseHint.includes('tomorrow')) {
      return addDays(today, 1);
    }
    
    if (lowercaseHint.includes('today')) {
      return today;
    }
    
    // Handle day of week mentions
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lowercaseHint.includes(days[i])) {
        const targetDay = i;
        const currentDay = today.getDay();
        const daysToAdd = (targetDay + 7 - currentDay) % 7;
        return addDays(today, daysToAdd === 0 ? 7 : daysToAdd);
      }
    }
    
    // Default to tomorrow if we can't parse it
    return addDays(today, 1);
  };
  
  // Function to suggest event details based on AI response
  const suggestEventDetails = (calendarData: any) => {
    if (!calendarData || calendarData.intent !== 'create_event') return null;
    
    const details = calendarData.proposedDetails;
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0); // Default to 9 AM
    
    if (details.dateHint) {
      const suggestedDate = parseEventDate(details.dateHint);
      startTime.setFullYear(suggestedDate.getFullYear(), suggestedDate.getMonth(), suggestedDate.getDate());
    } else {
      // Default to tomorrow if no date provided
      startTime.setDate(startTime.getDate() + 1);
    }
    
    // Set default end time to 1 hour after start
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);
    
    return {
      title: details.title || "New Meeting",
      startTime,
      endTime,
      attendees: "",
      description: ""
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;
    
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
      console.log("Sending message to edge function...");
      
      // Call our Supabase Edge Function for AI processing
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: { 
          message: input, 
          userId: user.id 
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data returned from Edge Function");
      }
      
      console.log("Received response:", data);
      
      // Reset API error state if we got a successful response
      if (hasApiError) {
        setHasApiError(false);
      }
      
      // Add AI response
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Handle calendar operations if present in the response
      if (data.calendarData) {
        console.log("Calendar data:", data.calendarData);
        if (data.calendarData.intent === 'create_event') {
          const suggestedEvent = suggestEventDetails(data.calendarData);
          if (suggestedEvent) {
            setEventDetails(suggestedEvent);
            // Add a small delay to let the user read the AI response first
            setTimeout(() => setShowEventModal(true), 500);
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      // Check if it's an API quota error from the error message
      const isQuotaError = error.message?.includes('quota') || error.message?.includes('rate limit');
      
      if (isQuotaError) {
        setHasApiError(true);
      }
      
      // Add a fallback message when the AI service is unavailable
      const errorContent = isQuotaError 
        ? "I'm sorry, but my AI service has reached its quota limit. The administrator needs to check the OpenAI account billing status. In the meantime, I can still help with basic calendar operations."
        : "I'm having trouble connecting to my backend services right now. Please try again in a moment.";
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: errorContent,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Show appropriate toast based on error type
      toast({
        title: isQuotaError ? "AI Service Quota Exceeded" : "Connection Error",
        description: isQuotaError 
          ? "The OpenAI API quota has been exceeded. Please check your billing details in the OpenAI dashboard."
          : "Failed to get a response from the assistant. Please check your internet connection and try again.",
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

  const handleSaveEvent = async (event: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendees: string;
    description?: string;
    isVirtual?: boolean;
    location?: string;
  }) => {
    try {
      // Save the event to Supabase
      const { error } = await supabase.from("meetings").insert({
        user_id: user?.id,
        title: event.title,
        description: event.description,
        start_time: event.startTime.toISOString(),
        end_time: event.endTime.toISOString(),
        attendees: event.attendees
          ? event.attendees
              .split(",")
              .map(a => a.trim())
              .filter(Boolean)
          : [],
        is_virtual: false,
      });

      if (error) throw error;

      setShowEventModal(false);
      
      // Add a confirmation message from the assistant
      const confirmMessage: ChatMessage = {
        id: uuidv4(),
        content: `I've added "${event.title}" to your calendar for ${format(event.startTime, 'EEEE, MMMM d')} at ${format(event.startTime, 'h:mm a')}. Is there anything else you'd like me to help you with?`,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, confirmMessage]);
      
      toast({
        title: "Event Created",
        description: "Your event has been added to the calendar.",
      });
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
              {hasApiError && !isLoading && (
                <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-md text-sm mt-4">
                  <p className="font-medium">OpenAI API Quota Exceeded</p>
                  <p className="mt-1">The OpenAI API quota has been exceeded. The administrator needs to check the OpenAI account billing status or upgrade the plan.</p>
                  <a 
                    href="https://platform.openai.com/account/billing/overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline mt-2 inline-block"
                  >
                    Check OpenAI Billing
                  </a>
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
      
      {eventDetails && (
        <EventModal
          open={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
          date={eventDetails.startTime}
          isLoading={false}
        />
      )}
    </>
  );
};

export default ChatInterface;
