
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as ProfileUser } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Profile in DB
interface SupabaseProfile {
  id: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
interface AuthContextType {
  user: ProfileUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUserProfile: (profile: Partial<SupabaseProfile>) => Promise<void>;
}

// Helper
const getAvatarUrl = (avatar_url: string | undefined, name: string) =>
  avatar_url
    ? `${supabase.storage.from("avatars").getPublicUrl(avatar_url).data.publicUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000000&color=ffffff`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch profile from DB with session
  const fetchProfile = async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;

    return {
      id: userId,
      email,
      name: data?.name ?? email,
      avatar: getAvatarUrl(data?.avatar_url, data?.name ?? email),
      preferences: {
        timeZone: "America/New_York",
        workingHours: { start: "09:00", end: "17:00" },
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
  };

  // Keep the supabase session state in sync
  useEffect(() => {
    setIsLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
      } else {
        fetchProfile(session.user.id, session.user.email ?? "").then(setUser).finally(() => setIsLoading(false));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? "").then(setUser).finally(() => setIsLoading(false));
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  // Auth functions
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data.session?.user) throw new Error("No user session found");
      
      setUser(await fetchProfile(data.session.user.id, email));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Check if the email is already registered
      const { data: existingUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email);
      
      if (existingUsers && existingUsers.length > 0) {
        setIsLoading(false);
        toast({
          title: "Registration failed",
          description: "This email is already registered. Please use a different email or log in.",
          variant: "destructive",
        });
        return { success: false, error: "Email already registered" };
      }
      
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data: { name },
          emailRedirectTo: window.location.origin + "/auth/sign-in"
        } 
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      if (!data.session?.user && !data.user) {
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account",
        });
        return { success: true };
      }
      
      // Use fallback for non-auto sign-in
      const userId = data.user?.id ?? data.session?.user.id ?? "";
      setUser(await fetchProfile(userId, email));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created and you are now logged in.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const resetPassword = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/reset-password",
    });
    toast({
      title: "Password reset email sent",
      description: "Check your email for a link to reset your password.",
    });
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(await fetchProfile(session.user.id, session.user.email ?? ""));
    }
    setIsLoading(false);
  };

  const setUserProfile = async (profile: Partial<SupabaseProfile>) => {
    if (!user) return;
    const update: Record<string, string | null> = {};
    if ("name" in profile) update.name = profile.name!;
    if ("avatar_url" in profile) update.avatar_url = profile.avatar_url ?? null;
    const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    await refreshProfile();
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    refreshProfile,
    setUserProfile,
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
