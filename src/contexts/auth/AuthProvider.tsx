
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, signInWithEmailPassword, createUserAccount, signOutUser } from "./authUtils";
import { AuthContext } from "./AuthContext";
import { useAuthState } from "./useAuthState";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, setIsLoading, setUser, setProfile } = useAuthState();
  const navigate = useNavigate();

  const refreshProfile = async (userId: string) => {
    const fetchedProfile = await fetchUserProfile(userId);
    if (fetchedProfile) {
      setProfile(fetchedProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { user: authUser } = await signInWithEmailPassword(email, password);

      // Fetch profile after successful login
      if (authUser) {
        await refreshProfile(authUser.id);
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
