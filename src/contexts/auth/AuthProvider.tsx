
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, signInWithEmailPassword, createUserAccount, signOutUser } from "./authUtils";
import { AuthContext } from "./AuthContext";
import { useAuthState } from "./useAuthState";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, setIsLoading, setUser, setProfile } = useAuthState();
  const navigate = useNavigate();

  const refreshProfile = async (userId: string) => {
    try {
      console.log("Refreshing profile for user:", userId);
      const fetchedProfile = await fetchUserProfile(userId);
      if (fetchedProfile) {
        console.log("Profile refreshed successfully:", fetchedProfile);
        setProfile(fetchedProfile);
        return true;
      }
      console.log("No profile found during refresh for user:", userId);
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
      console.log("Starting authentication for:", email);
      const { user: authUser, session } = await signInWithEmailPassword(email, password);
      
      if (!authUser) {
        console.error("Authentication failed: No user returned");
        throw new Error("Authentication failed");
      }
      
      console.log("Authentication successful for user:", authUser.id);
      console.log("User metadata:", authUser.user_metadata);
      
      // Set user immediately after successful auth
      setUser(authUser);
      
      // Step 2: Fetch user profile
      const profileSuccess = await refreshProfile(authUser.id);
      if (!profileSuccess) {
        console.warn("Could not fetch user profile, but authentication was successful");
      }
      
      // Set a timeout to ensure redirection happens regardless of profile fetching
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return authUser;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      throw error;
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
      setIsLoading(true);
      const { user, session } = await createUserAccount(email, password, role, firstName, lastName);
      
      // Check if email confirmation is required by examining if there's no user session
      const requiresEmailConfirmation = !session;
      
      setIsLoading(false);
      
      // Return information about whether email confirmation is required
      return {
        user,
        requiresEmailConfirmation
      };
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
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
