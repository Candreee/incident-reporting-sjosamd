
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./types";

/**
 * Fetch a user profile from the database by user ID
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  console.log("Fetching profile for user:", userId);
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    console.log("Profile fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
}

/**
 * Verify user role from Supabase database
 * This is used to determine which dashboard they should see
 */
export async function verifyUserRole(userId: string): Promise<string | null> {
  try {
    console.log("Verifying role for user:", userId);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error verifying user role:', error);
      return null;
    }

    console.log("User role verified:", data.role);
    return data.role;
  } catch (error) {
    console.error("Error in role verification:", error);
    return null;
  }
}

/**
 * Sign in a user with email and password
 */
export async function signInWithEmailPassword(email: string, password: string) {
  console.log("Signing in with email:", email);
  
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Sign-in response:", response);
    
    if (response.error) {
      console.error("Sign-in error:", response.error);
      throw response.error;
    }

    console.log("Sign-in successful for user:", response.data.user?.id);
    console.log("User metadata:", response.data.user?.user_metadata);
    
    return response;
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error;
  }
}

/**
 * Create a new user account and profile
 */
export async function createUserAccount(
  email: string, 
  password: string, 
  role: 'admin' | 'teacher' | 'principal',
  firstName?: string,
  lastName?: string
) {
  console.log("Starting signup process for:", email);
  
  // First, create the user in Auth
  const response = await supabase.auth.signUp({
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

  if (response.error) {
    console.error('Auth signup error:', response.error);
    throw response.error;
  }

  if (!response.data.user) {
    console.error('No user data returned from signup');
    throw new Error('Failed to create user account');
  }

  console.log("Auth user created successfully:", response.data.user.id);
  console.log("User metadata:", response.data.user.user_metadata);
  console.log("Session data:", response.data.session ? "Session exists" : "No session (email confirmation required)");

  try {
    // Create the profile in the user_profiles table
    console.log("Creating user profile with data:", {
      id: response.data.user.id,
      email,
      role,
      first_name: firstName || null,
      last_name: lastName || null
    });
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: response.data.user.id,
        email,
        role,
        first_name: firstName || null,
        last_name: lastName || null,
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // If profile creation fails, attempt to update the profile instead
      // This handles cases where the profile might already exist
      console.log("Attempting to update profile instead...");
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email,
          role,
          first_name: firstName || null,
          last_name: lastName || null,
        })
        .eq('id', response.data.user.id);
        
      if (updateError) {
        console.error('Profile update also failed:', updateError);
      } else {
        console.log("User profile updated successfully");
      }
    } else {
      console.log("User profile created successfully");
    }
  } catch (error) {
    // Log the error but don't throw, as we want to return the auth user
    // even if profile creation fails
    console.error("Error during profile creation:", error);
  }
  
  return response;
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}
