
export interface ChatMessage {
  id: string;
  content: string;
  role: "assistant" | "user" | "assistant-typing";
  timestamp: Date;
}
