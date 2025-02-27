
import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileForm = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateNames = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating name:", error);
        throw error;
      }

      // Refresh the profile in context after update
      if (refreshProfile) {
        await refreshProfile(user.id);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-6 border-b">
        <User className="h-12 w-12 text-gray-400 bg-gray-100 p-2 rounded-full" />
        <div>
          <h2 className="font-semibold text-xl text-gray-900">User Profile</h2>
          <p className="text-sm text-gray-500">Manage your account settings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="text-base text-gray-900">{profile?.email || user?.email}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">First Name</p>
          <div className="flex gap-2">
            <Input
              placeholder="Add your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Last Name</p>
          <div className="flex gap-2">
            <Input
              placeholder="Add your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleUpdateNames}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
