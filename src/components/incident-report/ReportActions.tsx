
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { PrintableReport } from "./PrintableReport";
import { useRef } from "react";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface ReportActionsProps {
  report: IncidentReport;
}

export function ReportActions({ report }: ReportActionsProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!printRef.current) return;

    try {
      const content = printRef.current.outerHTML;
      const blob = new Blob([content], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `incident-report-${report.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="hidden">
        <div ref={printRef}>
          <PrintableReport report={report} />
        </div>
      </div>
    </>
  );
}
