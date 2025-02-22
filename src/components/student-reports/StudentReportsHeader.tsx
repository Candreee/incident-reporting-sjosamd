
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReportActions } from "@/components/incident-report/ReportActions";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

interface HeaderProps {
  student: { name: string; grade: string } | null;
  selectedReport: IncidentReport | null;
  onBack: () => void;
}

export function StudentReportsHeader({ student, selectedReport, onBack }: HeaderProps) {
  return (
    <header className="bg-white shadow print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reports for {student?.name} - Grade {student?.grade}
            </h1>
          </div>
          {selectedReport && (
            <ReportActions report={selectedReport} />
          )}
        </div>
      </div>
    </header>
  );
}
