
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SettingsHeader from "@/components/settings/SettingsHeader";
import ProfileForm from "@/components/settings/ProfileForm";
import SignOutButton from "@/components/settings/SignOutButton";
import LoadingProfile from "@/components/settings/LoadingProfile";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        console.log("No user in context, redirecting to login");
        navigate("/login");
        return;
      }
      
      setIsFetching(true);
      try {
        // Try to get the profile directly from the context first
        if (profile) {
          console.log("Using profile from context:", profile);
          setIsFetching(false);
          return;
        }
        
        // If no profile in context, try to fetch it manually
        console.log("Manually fetching profile for user:", user.id);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to prevent errors

        if (error) {
          console.error('Error fetching profile in Settings:', error);
          toast({
            title: "Error",
            description: "Failed to load profile data. Please try again.",
            variant: "destructive",
          });
        } else if (data) {
          console.log("Profile data fetched successfully:", data);
          
          // Update the profile in the auth context
          if (refreshProfile) {
            await refreshProfile(user.id);
          }
        } else {
          console.log("No profile data found for user");
          // Handle the case where no profile data is found
          // We'll continue showing the page but with empty fields
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
        // Don't redirect on error - allow the user to still see the page
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfileData();
  }, [user, profile, navigate, toast, refreshProfile]);

  // If the user is not present and not in the loading state, redirect to login
  if (!user && !isFetching) {
    console.log("No user detected while not in fetching state, redirecting to login");
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isFetching ? (
          <LoadingProfile />
        ) : (
          <Card className="max-w-2xl mx-auto p-6 space-y-6">
            <ProfileForm />
            <SignOutButton />
          </Card>
        )}
      </main>
    </div>
  );
};

export default Settings;
