
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, signInWithEmailPassword, createUserAccount, signOutUser } from "./authUtils";
import { AuthContext } from "./AuthContext";
import { useAuthState } from "./useAuthState";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, setIsLoading, setUser, setProfile } = useAuthState();
  const navigate = useNavigate();

  const refreshProfile = async (userId: string) => {
    try {
      const fetchedProfile = await fetchUserProfile(userId);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Step 1: Authenticate with Supabase
      const { user: authUser } = await signInWithEmailPassword(email, password);
      
      if (!authUser) {
        throw new Error("Authentication failed");
      }
      
      setUser(authUser);
      
      // Step 2: Fetch user profile
      const profileSuccess = await refreshProfile(authUser.id);
      
      if (!profileSuccess) {
        console.warn("Could not fetch user profile, will proceed with authentication only");
      }
      
      return authUser;
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
      await createUserAccount(email, password, role, firstName, lastName);
      return;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await signOutUser();
      
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
