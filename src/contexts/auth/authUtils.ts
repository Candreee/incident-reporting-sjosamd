
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
 * Sign in a user with email and password
 */
export async function signInWithEmailPassword(email: string, password: string) {
  console.log("Signing in with email:", email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign-in error:", error);
      throw error;
    }

    console.log("Sign-in successful for user:", data.user?.id);
    console.log("User metadata:", data.user?.user_metadata);
    return data;
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
  console.log("User metadata:", data.user.user_metadata);

  // Then create the profile in the user_profiles table
  console.log("Creating user profile with data:", {
    id: data.user.id,
    email,
    role,
    first_name: firstName || null,
    last_name: lastName || null
  });
  
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
    // Admin only operation - would require a Supabase Edge Function in production
    console.error('Would need to delete auth user due to profile creation failure');
    
    throw new Error(`Failed to create user profile: ${profileError.message}`);
  }

  console.log("User profile created successfully");
  
  // Verify the profile was created by attempting to retrieve it
  const { data: verifyData, error: verifyError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
    
  if (verifyError) {
    console.error('Error verifying profile creation:', verifyError);
  } else {
    console.log('Profile verification successful:', verifyData);
  }
  
  return data.user;
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}
