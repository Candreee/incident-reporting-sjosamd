
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ReportStatusFilter } from "@/components/incident-report/ReportStatusFilter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardReportsTable } from "@/components/dashboard/DashboardReportsTable";
import { useAuth } from "@/contexts/auth";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

const Dashboard = () => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IncidentReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Add debug logging
  console.log("Dashboard: Auth state -", { user, profile, authLoading });

  useEffect(() => {
    // Only proceed with checks if auth loading is finished
    if (!authLoading) {
      // If no user is authenticated, redirect to login
      if (!user) {
        console.log("Dashboard: No user found, redirecting to login");
        navigate("/login", { replace: true });
        return;
      }

      // Check user role from metadata if profile not loaded yet
      if (user && !profile) {
        const role = user.user_metadata?.role;
        console.log("Dashboard: No profile but user role from metadata:", role);
        
        if (role === 'admin' || role === 'principal') {
          console.log("Dashboard: User is admin (from metadata), redirecting to admin dashboard");
          navigate("/admin", { replace: true });
          return;
        }
        
        // Not admin, fetch reports
        fetchReports();
        return;
      }

      // If profile is loaded, check role and fetch data
      if (profile) {
        console.log("Dashboard: User profile loaded -", profile);
        // Check if user is admin, redirect if needed
        if (profile.role === 'admin' || profile.role === 'principal') {
          console.log("Dashboard: User is admin, redirecting to admin dashboard");
          navigate("/admin", { replace: true });
          return;
        }
        
        // User is authenticated and not admin, fetch reports
        fetchReports();
      }
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    let filtered = [...reports];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter(report => report.incident_type === typeFilter);
    }
    
    setFilteredReports(filtered);
  }, [statusFilter, typeFilter, reports]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("Dashboard: Reports fetched -", data?.length || 0);
      setReports(data || []);
      setFilteredReports(data || []);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats reports={reports} />

        <div className="bg-white shadow rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-medium">Recent Reports</h2>
              <ReportStatusFilter
                statusValue={statusFilter}
                onStatusChange={setStatusFilter}
                typeValue={typeFilter}
                onTypeChange={setTypeFilter}
              />
            </div>
            {isLoading ? (
              <p className="text-center py-4">Loading reports...</p>
            ) : filteredReports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No reports yet. Click "New Report" to create one.
              </p>
            ) : (
              <DashboardReportsTable reports={filteredReports} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
