
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddStudentDialog } from "@/components/students/AddStudentDialog";
import { AddReportDialog } from "@/components/students/AddReportDialog";
import { StudentList } from "@/components/students/StudentList";
import type { Student, SupabaseStudent } from "@/types/student";

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile && profile.role !== "admin" && profile.role !== "principal") {
      navigate("/dashboard");
      return;
    }
    fetchStudents();
  }, [profile, navigate]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          incident_count:incident_reports(count)
        `);

      if (error) throw error;

      const transformedData: Student[] = (data as SupabaseStudent[]).map(
        (student) => ({
          id: student.id,
          name: student.name,
          grade: student.grade || "",
          incident_count: student.incident_count[0]?.count || 0,
        })
      );

      setStudents(transformedData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Student Management
              </h1>
            </div>
            <Button
              className="flex items-center space-x-2"
              onClick={() => setIsStudentDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Add Student</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {isLoading ? (
              <p className="text-center py-4">Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No students found. Add your first student!
              </p>
            ) : (
              <StudentList
                students={students}
                onAddReport={(student) => {
                  setSelectedStudent(student);
                  setIsReportDialogOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </main>

      <AddStudentDialog
        isOpen={isStudentDialogOpen}
        onOpenChange={setIsStudentDialogOpen}
        onSuccess={fetchStudents}
      />

      <AddReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        student={selectedStudent}
        userId={profile?.id}
        onSuccess={fetchStudents}
      />
    </div>
  );
};

export default Students;
