
import { format } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ReportsTableProps {
  reports: IncidentReport[];
  onUpdateStatus: (reportId: number, status: string) => Promise<void>;
  onDeleteReport: (reportId: number) => Promise<void>;
  currentUserId?: string;
}

export function ReportsTable({ reports, onUpdateStatus, onDeleteReport, currentUserId }: ReportsTableProps) {
  const isMobile = useIsMobile();

  const canDelete = (report: IncidentReport) => {
    return currentUserId && (report.created_by === currentUserId || currentUserId === report.created_by);
  };

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
            <div className="flex gap-2 mt-2">
              {report.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-green-50"
                  onClick={() => onUpdateStatus(report.id, "reviewed")}
                >
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Mark as Reviewed
                </Button>
              )}
              {canDelete(report) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-red-50"
                  onClick={() => onDeleteReport(report.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600 mr-2" />
                  Delete
                </Button>
              )}
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
                <div className="flex space-x-2">
                  {report.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-green-50"
                      onClick={() => onUpdateStatus(report.id, "reviewed")}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {canDelete(report) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-red-50"
                      onClick={() => onDeleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
