
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface PrintableReportProps {
  report: IncidentReport;
}

export function PrintableReport({ report }: PrintableReportProps) {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 print:p-4">
      <div className="text-center mb-8 print:mb-4">
        <h1 className="text-2xl font-bold text-[#1A1F2C]">Incident Report</h1>
        <p className="text-[#8E9196] mt-1">Reference ID: #{report.id}</p>
      </div>

      <Card className="mb-6 print:shadow-none">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[#8E9196]">Student(s)</p>
              <p className="font-medium">{report.student_names}</p>
            </div>
            <div>
              <p className="text-sm text-[#8E9196]">Date of Incident</p>
              <p className="font-medium">
                {format(new Date(report.incident_date), "MMMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#8E9196]">Class</p>
              <p className="font-medium">{report.class}</p>
            </div>
            <div>
              <p className="text-sm text-[#8E9196]">Type</p>
              <p className="font-medium capitalize">{report.incident_type}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-[#8E9196] mb-2">Description</p>
            <p className="whitespace-pre-wrap">{report.description}</p>
          </div>

          {report.evidence_url && (
            <div>
              <p className="text-sm text-[#8E9196] mb-2">Evidence</p>
              <p className="text-[#9b87f5]">
                Evidence {report.evidence_type} available at:
                <br />
                {report.evidence_url}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-[#8E9196] text-sm print:text-xs mt-8 text-center">
        <p>Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
      </div>
    </div>
  );
}
