
import { FileText, Calendar, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface DashboardStatsProps {
  reports: IncidentReport[];
}

export function DashboardStats({ reports }: DashboardStatsProps) {
  const recentReportsCount = reports.filter(
    (report) =>
      new Date(report.created_at) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const pendingReportsCount = reports.filter(
    (report) => report.status === "pending"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{reports.length}</div>
          <p className="text-xs text-muted-foreground">
            Incident reports filed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentReportsCount}</div>
          <p className="text-xs text-muted-foreground">In the last 7 days</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingReportsCount}</div>
          <p className="text-xs text-muted-foreground">
            Reports awaiting review
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
