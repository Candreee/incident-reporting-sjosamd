
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ReportStatusFilter } from "@/components/incident-report/ReportStatusFilter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardReportsTable } from "@/components/dashboard/DashboardReportsTable";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

const Dashboard = () => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IncidentReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      console.log("Dashboard: User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    // Check if user is admin, redirect if needed
    if (profile?.role === 'admin') {
      console.log("Dashboard: User is admin, redirecting to admin dashboard");
      navigate("/admin");
      return;
    }

    fetchReports();
  }, [user, profile, navigate, toast]);

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

  // If still checking authentication status, show loading
  if (!user) {
    return null; // Will be redirected in useEffect
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
