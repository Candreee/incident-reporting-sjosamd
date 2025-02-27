
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'principal';
  first_name?: string | null;
  last_name?: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string, 
    password: string, 
    role: 'admin' | 'teacher' | 'principal',
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          return;
        }
        
        if (session?.user) {
          console.log("Active session found for user:", session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log("No active session found");
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    console.log("Fetching profile for user:", userId);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Important: DON'T clear user or setProfile(null) on profile fetch errors
        // This is likely causing the logout issue
        return;
      }

      console.log("Profile fetched successfully:", data);
      setProfile(data);
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      // Don't clear user state on error
    }
  }

  const refreshProfile = async (userId: string) => {
    await fetchProfile(userId);
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Signing in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign-in error:", error);
        throw error;
      }

      console.log("Sign-in successful for user:", data.user?.id);

      // Fetch profile after successful login
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      
      // Navigation will be handled by auth state change listener in useEffect
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: 'admin' | 'teacher' | 'principal',
    firstName?: string,
    lastName?: string
  ) => {
    try {
      console.log("Starting signup process for:", email);
      
      // First, create the user in Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        throw signUpError;
      }

      if (!data.user) {
        console.error('No user data returned from signup');
        throw new Error('Failed to create user account');
      }

      console.log("Auth user created successfully:", data.user.id);

      // Then create the profile in the user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email,
          role,
          first_name: firstName || null,
          last_name: lastName || null,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // If profile creation fails, clean up by deleting the auth user
        try {
          // Admin only operation - would require a Supabase Edge Function in production
          // For now, just log that this would happen
          console.error('Would need to delete auth user due to profile creation failure');
        } catch (cleanupError) {
          console.error('Failed to clean up auth user after profile creation error:', cleanupError);
        }
        
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log("User profile created successfully");
      return;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setProfile(null);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
