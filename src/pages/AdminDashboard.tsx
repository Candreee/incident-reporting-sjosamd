
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ReportsContainer } from "@/components/admin/ReportsContainer";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

const AdminDashboard = () => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading } = useAuth();

  // Additional debug logs
  console.log("AdminDashboard: Auth state -", { user, profile, authLoading });

  useEffect(() => {
    // Only check and redirect if auth is finished loading
    if (!authLoading) {
      // If no user is authenticated, redirect to login
      if (!user) {
        console.log("AdminDashboard: No user found, redirecting to login");
        navigate('/login');
        return;
      }
      
      // If profile is loaded and user is not admin, redirect to appropriate dashboard
      if (profile) {
        console.log("AdminDashboard: User profile loaded -", profile);
        if (profile.role !== 'admin' && profile.role !== 'principal') {
          console.log("AdminDashboard: User not authorized, redirecting to dashboard");
          navigate('/dashboard');
          return;
        }
        
        // User is authenticated and authorized, fetch reports
        fetchReports();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("AdminDashboard: Reports fetched -", data?.length || 0);
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load incident reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: number, status: string) => {
    try {
      const { error } = await supabase
        .from("incident_reports")
        .update({ status })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report status updated successfully",
      });

      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: number) => {
    try {
      const { error } = await supabase
        .from("incident_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report deleted successfully",
      });

      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login (handled in useEffect)
  if (!user) {
    return null;
  }

  // If profile is not loaded yet, show loading
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview reports={reports} />
        <ReportsContainer
          reports={reports}
          onUpdateStatus={updateReportStatus}
          onDeleteReport={deleteReport}
          isLoading={isLoading}
          currentUserId={profile?.id}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
