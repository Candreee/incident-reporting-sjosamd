
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, signInWithEmailPassword, createUserAccount, signOutUser, verifyUserRole } from "./authUtils";
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
      const { data, error } = await signInWithEmailPassword(email, password);
      
      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }

      if (!data.user) {
        console.error("Authentication failed: No user returned");
        throw new Error("Authentication failed");
      }
      
      const authUser = data.user;
      console.log("Authentication successful for user:", authUser.id);
      console.log("User metadata:", authUser.user_metadata);
      
      // Set user immediately after successful auth
      setUser(authUser);
      
      // Step 2: Verify user role and fetch profile in parallel
      const [userRole, profileSuccess] = await Promise.all([
        verifyUserRole(authUser.id),
        refreshProfile(authUser.id)
      ]);
      
      // Use verified role from database or fallback to metadata
      const role = userRole || authUser.user_metadata?.role;
      console.log("User role determined to be:", role);
      
      if (!profileSuccess) {
        console.warn("Could not fetch user profile, but authentication was successful");
      }
      
      // Redirect the user based on role
      if (role === 'admin' || role === 'principal') {
        console.log(`Redirecting user with role "${role}" to admin dashboard`);
        navigate('/admin', { replace: true });
      } else {
        console.log(`Redirecting user with role "${role}" to regular dashboard`);
        navigate('/dashboard', { replace: true });
      }
      
      setIsLoading(false);
      return { user: authUser, role };
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
      const { data, error } = await createUserAccount(email, password, role, firstName, lastName);
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      // Check if email confirmation is required by examining if there's no user session
      const requiresEmailConfirmation = !data.session;
      
      setIsLoading(false);
      
      // Return information about whether email confirmation is required
      return {
        user: data.user,
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
