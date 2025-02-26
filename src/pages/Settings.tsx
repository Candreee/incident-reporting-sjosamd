
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Settings as SettingsIcon, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { user, profile, signOut } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !profile) {
      navigate("/login");
      return;
    }
    // Initialize name states with current profile names
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
  }, [user, profile, navigate]);

  const handleUpdateNames = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Name updated successfully",
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl mx-auto p-6 space-y-6">
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
              <p className="text-base text-gray-900">{profile?.email}</p>
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
              disabled={isLoading || (!firstName && !lastName)}
              className="w-full"
            >
              {isLoading ? "Updating..." : "Update Names"}
            </Button>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
