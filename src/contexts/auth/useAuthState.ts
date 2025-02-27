
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { UserProfile } from "./types";
import { fetchUserProfile } from "./authUtils";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log("Active session found for user:", session.user.id);
          setUser(session.user);
          
          // Fetch profile in parallel with setting the user
          fetchUserProfile(session.user.id)
            .then(userProfile => {
              if (userProfile) {
                setProfile(userProfile);
              } else {
                console.warn("No profile found for user:", session.user.id);
              }
            })
            .catch(profileError => {
              console.error("Error fetching user profile:", profileError);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          console.log("No active session found");
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        
        // Don't wait for profile to be fetched before continuing
        fetchUserProfile(session.user.id)
          .then(userProfile => {
            if (userProfile) {
              setProfile(userProfile);
            } else {
              console.warn("No profile found after auth state change for user:", session.user.id);
            }
          })
          .catch(profileError => {
            console.error("Error fetching user profile after auth state change:", profileError);
          });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, isLoading, setIsLoading, setUser, setProfile };
}
