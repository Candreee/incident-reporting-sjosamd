import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { ReportStatusFilter } from "@/components/incident-report/ReportStatusFilter";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

const AdminDashboard = () => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IncidentReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    if (profile && profile.role !== 'admin' && profile.role !== 'principal') {
      navigate('/dashboard');
      return;
    }

    fetchReports();
  }, [profile, navigate]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/students")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Students
              </Button>
              <Button
                onClick={() => navigate("/new-report")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview reports={reports} />

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Incident Reports</h2>
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
              <p className="text-gray-500 text-center py-8">No reports found.</p>
            ) : (
              <ReportsTable
                reports={filteredReports}
                onUpdateStatus={updateReportStatus}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
