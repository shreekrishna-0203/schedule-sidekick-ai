
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
  name?: string;
  avatar?: string;
  avatar_url?: string;
  created_at?: string;
  preferences?: {
    timeZone: string;
    workingHours: {
      start: string;
      end: string;
    };
    meetingPreferences: {
      preferredMeetingDuration: number;
      bufferTime: number;
      preferMornings: boolean;
      preferAfternoons: boolean;
    };
    notifications: {
      email: boolean;
      push: boolean;
      reminderTime: number;
    };
  };
}
