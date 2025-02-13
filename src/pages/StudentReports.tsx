
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type IncidentReport = Database["public"]["Tables"]["incident_reports"]["Row"];

const StudentReports = () => {
  const { studentId } = useParams();
  const [reports, setReports] = useState<IncidentReport[]>([]);
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
    
    // Convert studentId from string to number
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
      // Fetch student details with converted ID
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("name, grade")
        .eq("id", studentIdNumber)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      // Fetch reports with filters and converted ID
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/students")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reports for {student?.name} - Grade {student?.grade}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  placeholder="Filter by date"
                />
              </div>
              <div className="flex-1">
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <p className="text-center py-4">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No reports found for this student.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentReports;
