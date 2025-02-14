
import { FileText, Calendar, User } from "lucide-react";
import { StatsCard } from "./StatsCard";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface StatsOverviewProps {
  reports: IncidentReport[];
}

export function StatsOverview({ reports }: StatsOverviewProps) {
  const recentReports = reports.filter(
    (report) =>
      new Date(report.created_at) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Total Reports"
        value={reports.length}
        description="Incident reports filed"
        Icon={FileText}
      />
      <StatsCard
        title="Recent Reports"
        value={recentReports}
        description="In the last 7 days"
        Icon={Calendar}
      />
      <StatsCard
        title="Pending Review"
        value={pendingReports}
        description="Reports awaiting review"
        Icon={User}
      />
    </div>
  );
}
