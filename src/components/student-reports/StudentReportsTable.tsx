
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface ReportsTableProps {
  reports: IncidentReport[];
  isLoading: boolean;
  onViewReport: (report: IncidentReport) => void;
}

export function StudentReportsTable({ reports, isLoading, onViewReport }: ReportsTableProps) {
  if (isLoading) {
    return <p className="text-center py-4">Loading reports...</p>;
  }

  if (reports.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No reports found for this student.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              {format(new Date(report.incident_date), "MMM d, yyyy")}
            </TableCell>
            <TableCell>{report.incident_type}</TableCell>
            <TableCell>{report.class}</TableCell>
            <TableCell>{report.description}</TableCell>
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
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewReport(report)}
              >
                View & Print
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
