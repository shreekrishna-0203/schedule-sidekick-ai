import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as ProfileUser } from "@/types";

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
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUserProfile: (profile: Partial<SupabaseProfile>) => Promise<void>;
}

// Helper
const getAvatarUrl = (avatar_url: string | undefined, name: string) =>
  avatar_url
    ? `${supabase.storage.from("avatars").getPublicUrl(avatar_url).data.publicUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    const { error, data } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    if (!data.session?.user && !data.user) throw new Error("No user session found");
    // Use fallback for non-auto sign-in
    const userId = data.user?.id ?? data.session?.user.id ?? "";
    setUser(await fetchProfile(userId, email));
    setIsLoading(false);
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email);
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
    if (error) throw error;
    await refreshProfile();
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
