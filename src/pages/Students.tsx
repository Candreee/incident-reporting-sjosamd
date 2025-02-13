
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Student = {
  id: number;
  name: string;
  grade: string;
  incident_count: number;
};

type SupabaseStudent = {
  id: number;
  name: string;
  grade: string;
  incident_count: { count: number }[];
};

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({ name: "", grade: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newReport, setNewReport] = useState({
    description: "",
    incidentType: "",
    class: "",
  });
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

      // Transform the data to match our Student type
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

  const addStudent = async () => {
    try {
      const { error } = await supabase.from("students").insert([
        {
          name: newStudent.name,
          grade: newStudent.grade,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student added successfully",
      });
      setIsDialogOpen(false);
      setNewStudent({ name: "", grade: "" });
      fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const addReport = async () => {
    if (!selectedStudent) return;

    try {
      const { error } = await supabase.from("incident_reports").insert([
        {
          student_id: selectedStudent.id,
          student_names: selectedStudent.name,
          description: newReport.description,
          incident_type: newReport.incidentType,
          class: newReport.class,
          incident_date: new Date().toISOString(),
          status: "pending",
          created_by: profile?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident report added successfully",
      });
      setIsReportDialogOpen(false);
      setNewReport({ description: "", incidentType: "", class: "" });
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error adding report:", error);
      toast({
        title: "Error",
        description: "Failed to add incident report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Student Management
            </h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Student</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={newStudent.grade}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, grade: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={addStudent} className="w-full">
                    Add Student
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Incident Reports</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{student.incident_count}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsReportDialogOpen(true);
                          }}
                          className="flex items-center space-x-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Add Report</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Add Incident Report for {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                value={newReport.class}
                onChange={(e) =>
                  setNewReport({ ...newReport, class: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="incidentType">Type of Incident</Label>
              <Select
                value={newReport.incidentType}
                onValueChange={(value) =>
                  setNewReport({ ...newReport, incidentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newReport.description}
                onChange={(e) =>
                  setNewReport({ ...newReport, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={addReport} className="w-full">
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
