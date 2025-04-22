
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app this would be fetched from an API
const mockUser: User = {
  id: "1",
  email: "demo@example.com",
  name: "Demo User",
  avatar: "https://ui-avatars.com/api/?name=Demo+User",
  preferences: {
    timeZone: "America/New_York",
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    meetingPreferences: {
      preferredMeetingDuration: 30,
      bufferTime: 15,
      preferMornings: true,
      preferAfternoons: false,
    },
    notifications: {
      email: true,
      push: true,
      reminderTime: 15,
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth state in localStorage
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would make an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate successful login with mock user
      if (email === "demo@example.com" && password === "password") {
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would make an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate successful signup
      const newUser = {
        ...mockUser,
        id: Math.random().toString(36).substring(2, 9),
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(" ", "+")}`,
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const resetPassword = async (email: string) => {
    try {
      // In a real app, this would make an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Just simulate success for now
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
