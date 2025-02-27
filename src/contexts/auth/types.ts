
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'principal';
  first_name?: string | null;
  last_name?: string | null;
};

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (
    email: string, 
    password: string, 
    role: 'admin' | 'teacher' | 'principal',
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: (userId: string) => Promise<boolean>;
};
