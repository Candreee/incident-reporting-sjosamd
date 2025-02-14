
import { format } from "date-fns";
import { Check, X } from "lucide-react";
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
  onUpdateStatus: (reportId: number, status: string) => Promise<void>;
}

export function ReportsTable({ reports, onUpdateStatus }: ReportsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Student(s)</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Type</TableHead>
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
            <TableCell>
              {report.status === "pending" && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-green-50"
                    onClick={() => onUpdateStatus(report.id, "approved")}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-red-50"
                    onClick={() => onUpdateStatus(report.id, "rejected")}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
