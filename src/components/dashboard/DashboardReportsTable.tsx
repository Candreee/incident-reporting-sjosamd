
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface DashboardReportsTableProps {
  reports: IncidentReport[];
}

export function DashboardReportsTable({ reports }: DashboardReportsTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{report.student_names}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(report.incident_date), "MMM d, yyyy")}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {report.status}
              </span>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">Class:</span> {report.class}
              </p>
              <p className="text-sm">
                <span className="font-medium">Type:</span> {report.incident_type}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Student(s)</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                {format(new Date(report.incident_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{report.student_names}</TableCell>
              <TableCell>{report.class}</TableCell>
              <TableCell>{report.incident_type}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {report.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
