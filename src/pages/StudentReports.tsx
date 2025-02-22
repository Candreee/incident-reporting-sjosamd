
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { PrintableReport } from "@/components/incident-report/PrintableReport";
import { StudentReportsHeader } from "@/components/student-reports/StudentReportsHeader";
import { StudentReportFilters } from "@/components/student-reports/StudentReportFilters";
import { StudentReportsTable } from "@/components/student-reports/StudentReportsTable";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

const StudentReports = () => {
  const { studentId } = useParams();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [student, setStudent] = useState<{ name: string; grade: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: "",
    type: "",
  });
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile && profile.role !== "admin" && profile.role !== "principal") {
      navigate("/dashboard");
      return;
    }
    fetchStudentAndReports();
  }, [studentId, profile, navigate]);

  const fetchStudentAndReports = async () => {
    if (!studentId) return;
    
    const studentIdNumber = parseInt(studentId, 10);
    if (isNaN(studentIdNumber)) {
      toast({
        title: "Error",
        description: "Invalid student ID",
        variant: "destructive",
      });
      navigate("/students");
      return;
    }

    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("name, grade")
        .eq("id", studentIdNumber)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      let query = supabase
        .from("incident_reports")
        .select("*")
        .eq("student_id", studentIdNumber)
        .order("incident_date", { ascending: false });

      if (filters.date) {
        const startDate = new Date(filters.date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.gte("incident_date", startDate.toISOString())
          .lt("incident_date", endDate.toISOString());
      }

      if (filters.type) {
        query = query.eq("incident_type", filters.type);
      }

      const { data: reportsData, error: reportsError } = await query;

      if (reportsError) throw reportsError;
      setReports(reportsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load student reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAndReports();
  }, [filters]);

  const handleBack = () => {
    const targetRoute = profile?.role === 'admin' || profile?.role === 'principal' 
      ? "/students" 
      : "/dashboard";
    
    navigate(targetRoute);
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white print:min-h-0">
      <StudentReportsHeader
        student={student}
        selectedReport={selectedReport}
        onBack={handleBack}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedReport ? (
          <div className="print:block hidden">
            <PrintableReport report={selectedReport} />
          </div>
        ) : null}

        <div className="bg-white shadow rounded-lg print:hidden">
          <div className="p-6">
            <StudentReportFilters
              filters={filters}
              setFilters={setFilters}
            />
            <StudentReportsTable
              reports={reports}
              isLoading={isLoading}
              onViewReport={setSelectedReport}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentReports;
