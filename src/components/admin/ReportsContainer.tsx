
import { useState, useEffect } from "react";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { ReportStatusFilter } from "@/components/incident-report/ReportStatusFilter";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface ReportsContainerProps {
  reports: IncidentReport[];
  onUpdateStatus: (reportId: number, status: string) => Promise<void>;
  onDeleteReport: (reportId: number) => Promise<void>;
  isLoading: boolean;
  currentUserId?: string;
}

export const ReportsContainer = ({
  reports,
  onUpdateStatus,
  onDeleteReport,
  isLoading,
  currentUserId,
}: ReportsContainerProps) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [filteredReports, setFilteredReports] = useState<IncidentReport[]>(reports);

  // Apply filters when reports, statusFilter, or typeFilter change
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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
            onUpdateStatus={onUpdateStatus}
            onDeleteReport={onDeleteReport}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
};

