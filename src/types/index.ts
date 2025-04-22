
export interface ChatMessage {
  id: string;
  content: string;
  role: "assistant" | "user" | "assistant-typing";
  timestamp: Date;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
}
