
// Types for user authentication and scheduling
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
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
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Calendar {
  id: string;
  name: string;
  provider: 'google' | 'outlook' | 'apple' | 'internal';
  color: string;
  isDefault: boolean;
  isConnected: boolean;
}
