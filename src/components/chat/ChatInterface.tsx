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
import { addDays, format } from "date-fns";
import { Send, Mic, MicOff, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: (event: Event) => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hello! I'm your scheduling agent. I can help you manage your calendar, set up meetings, and organize your schedule. What would you like me to help you with today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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
  const isMobile = useIsMobile();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + ' ' + transcript);
        };
        
        recognitionRef.current.onerror = () => {
          setIsRecording(false);
          toast({
            title: "Speech Recognition Error",
            description: "There was an error with speech recognition. Please try again or type your message.",
            variant: "destructive",
          });
        };
        
        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please type your message.",
        variant: "destructive",
      });
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Speech recognition error:", error);
        toast({
          title: "Speech Recognition Error",
          description: "There was an error starting speech recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const parseEventDate = (dateHint: string): Date => {
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    
    const lowercaseHint = dateHint.toLowerCase();
    
    if (lowercaseHint.includes('tomorrow')) {
      return addDays(today, 1);
    }
    
    if (lowercaseHint.includes('today')) {
      return today;
    }
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lowercaseHint.includes(days[i])) {
        const targetDay = i;
        const currentDay = today.getDay();
        const daysToAdd = (targetDay + 7 - currentDay) % 7;
        return addDays(today, daysToAdd === 0 ? 7 : daysToAdd);
      }
    }
    
    return addDays(today, 1);
  };

  const suggestEventDetails = (calendarData: any) => {
    if (!calendarData || calendarData.intent !== 'create_event') return null;
    
    const details = calendarData.proposedDetails;
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);
    
    if (details.dateHint) {
      const suggestedDate = parseEventDate(details.dateHint);
      startTime.setFullYear(suggestedDate.getFullYear(), suggestedDate.getMonth(), suggestedDate.getDate());
    } else {
      startTime.setDate(startTime.getDate() + 1);
    }
    
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
      
      const typingId = uuidv4();
      setMessages(prev => [...prev, {
        id: typingId,
        content: "...",
        role: "assistant-typing",
        timestamp: new Date(),
      }]);
      
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
      
      setMessages(prev => prev.filter(msg => msg.id !== typingId));
      
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      if (data.calendarData) {
        console.log("Calendar data:", data.calendarData);
        if (data.calendarData.intent === 'create_event') {
          const suggestedEvent = suggestEventDetails(data.calendarData);
          if (suggestedEvent) {
            setEventDetails(suggestedEvent);
            setTimeout(() => setShowEventModal(true), 500);
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => prev.filter(msg => msg.role !== "assistant-typing"));
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Failed to get a response from the assistant. Please check your internet connection and try again.",
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
        is_virtual: event.isVirtual || false,
        location: event.location,
      });

      if (error) throw error;

      setShowEventModal(false);
      
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
              {isLoading && !messages.some(m => m.role === "assistant-typing") && (
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
                placeholder="Tell me what to schedule..."
                className="flex-1 min-h-[60px] resize-none"
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              {!isMobile && (
                <Button 
                  onClick={toggleSpeechRecognition} 
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                  className={isRecording ? "bg-primary/10" : ""}
                  title="Voice input"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading}
                size="icon"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {isMobile && (
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={toggleSpeechRecognition}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className={`w-full ${isRecording ? "bg-primary/10" : ""}`}
                >
                  {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isRecording ? "Stop recording" : "Voice input"}
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Try saying: "Schedule a meeting with John tomorrow at 2pm" or "Set up a team call for next Monday"
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
