
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/types/student";
import { useAuth } from "@/contexts/auth";
import { Plus, Trash2 } from "lucide-react";

interface AddReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  userId: string | undefined;
  onSuccess: () => void;
}

interface IncidentItem {
  id: string;
  description: string;
  incidentType: string;
  incidentTime: string;
  evidenceUrl: string;
  evidenceType: string;
}

interface StudentIncidentPair {
  id: string;
  student: Student | null;
  incidents: IncidentItem[];
}

export function AddReportDialog({ 
  isOpen, 
  onOpenChange, 
  student, 
  userId,
  onSuccess 
}: AddReportDialogProps) {
  // State for managing multiple students and their incidents
  const [studentIncidentPairs, setStudentIncidentPairs] = useState<StudentIncidentPair[]>(() => {
    if (student) {
      return [{
        id: crypto.randomUUID(),
        student: student,
        incidents: [{
          id: crypto.randomUUID(),
          description: "",
          incidentType: "",
          incidentTime: new Date().toTimeString().slice(0, 5), // Default to current time
          evidenceUrl: "",
          evidenceType: "",
        }]
      }];
    }
    return [];
  });
  
  const { toast } = useToast();
  const { profile } = useAuth();

  // Add a new student to the report
  const addStudentPair = () => {
    setStudentIncidentPairs([
      ...studentIncidentPairs, 
      {
        id: crypto.randomUUID(),
        student: null,
        incidents: [{
          id: crypto.randomUUID(),
          description: "",
          incidentType: "",
          incidentTime: new Date().toTimeString().slice(0, 5),
          evidenceUrl: "",
          evidenceType: "",
        }]
      }
    ]);
  };

  // Remove a student from the report
  const removeStudentPair = (id: string) => {
    setStudentIncidentPairs(studentIncidentPairs.filter(pair => pair.id !== id));
  };

  // Add a new incident to a student
  const addIncident = (studentId: string) => {
    setStudentIncidentPairs(studentIncidentPairs.map(pair => {
      if (pair.id === studentId) {
        return {
          ...pair,
          incidents: [
            ...pair.incidents,
            {
              id: crypto.randomUUID(),
              description: "",
              incidentType: "",
              incidentTime: new Date().toTimeString().slice(0, 5),
              evidenceUrl: "",
              evidenceType: "",
            }
          ]
        };
      }
      return pair;
    }));
  };

  // Remove an incident from a student
  const removeIncident = (studentId: string, incidentId: string) => {
    setStudentIncidentPairs(studentIncidentPairs.map(pair => {
      if (pair.id === studentId && pair.incidents.length > 1) {
        return {
          ...pair,
          incidents: pair.incidents.filter(incident => incident.id !== incidentId)
        };
      }
      return pair;
    }));
  };

  // Update an incident property
  const updateIncident = (
    studentId: string, 
    incidentId: string, 
    field: keyof IncidentItem, 
    value: string
  ) => {
    setStudentIncidentPairs(studentIncidentPairs.map(pair => {
      if (pair.id === studentId) {
        return {
          ...pair,
          incidents: pair.incidents.map(incident => {
            if (incident.id === incidentId) {
              return {
                ...incident,
                [field]: value
              };
            }
            return incident;
          })
        };
      }
      return pair;
    }));
  };

  // Update the selected student for a pair
  const updateStudent = (pairId: string, newStudent: Student) => {
    setStudentIncidentPairs(studentIncidentPairs.map(pair => {
      if (pair.id === pairId) {
        return {
          ...pair,
          student: newStudent
        };
      }
      return pair;
    }));
  };

  // Function to fetch students from database
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchStudents = async () => {
    if (students.length > 0) return; // Don't fetch if we already have students

    try {
      setLoadingStudents(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      // Add incident_count with default value of 0 to comply with Student type
      const studentsWithIncidentCount = data?.map(student => ({
        ...student,
        incident_count: 0
      })) || [];
      
      setStudents(studentsWithIncidentCount);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Submit all reports
  const addReports = async () => {
    if (!userId) return;

    try {
      // Check if any student is not selected or any incident is missing information
      const invalidPair = studentIncidentPairs.find(pair => 
        !pair.student || 
        pair.incidents.some(inc => !inc.description || !inc.incidentType)
      );

      if (invalidPair) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields for all students and incidents",
          variant: "destructive",
        });
        return;
      }

      // Set status to approved if user is admin or principal
      const status = profile?.role === "admin" || profile?.role === "principal" 
        ? "approved" 
        : "pending";
        
      console.log(`User role: ${profile?.role}, setting status to: ${status}`);

      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Prepare all reports for insertion
      const reports = studentIncidentPairs.flatMap(pair => 
        pair.incidents.map(incident => ({
          student_id: pair.student!.id,
          student_names: pair.student!.name,
          description: incident.description,
          incident_type: incident.incidentType,
          class: "", // Keeping empty but not removing from database schema
          incident_date: `${today}T${incident.incidentTime}:00`,
          status: status,
          created_by: userId,
          evidence_url: incident.evidenceUrl,
          evidence_type: incident.evidenceType,
        }))
      );

      // Insert all reports
      const { error } = await supabase.from("incident_reports").insert(reports);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident reports added successfully",
      });
      onOpenChange(false);
      setStudentIncidentPairs([]);
      onSuccess();
    } catch (error) {
      console.error("Error adding reports:", error);
      toast({
        title: "Error",
        description: "Failed to add incident reports",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Incident Report{studentIncidentPairs.length > 1 ? "s" : ""}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {studentIncidentPairs.map((pair, pairIndex) => (
            <div key={pair.id} className="border border-gray-200 rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Student {pairIndex + 1}</h3>
                {studentIncidentPairs.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeStudentPair(pair.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Student
                  </Button>
                )}
              </div>
              
              {/* Student Selection */}
              <div>
                <Label htmlFor={`student-${pair.id}`}>Select Student</Label>
                <Select
                  value={pair.student?.id.toString() || ""}
                  onValueChange={(value) => {
                    const selectedStudent = students.find(s => s.id.toString() === value);
                    if (selectedStudent) {
                      updateStudent(pair.id, selectedStudent);
                    }
                  }}
                  onOpenChange={fetchStudents}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStudents ? (
                      <SelectItem value="loading" disabled>
                        Loading students...
                      </SelectItem>
                    ) : (
                      students.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name} {s.grade ? `(${s.grade})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Incidents for this student */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Incidents</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addIncident(pair.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Incident
                  </Button>
                </div>
                
                {pair.incidents.map((incident, incidentIndex) => (
                  <div 
                    key={incident.id} 
                    className="border border-gray-100 rounded p-3 space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Incident {incidentIndex + 1}</h5>
                      {pair.incidents.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeIncident(pair.id, incident.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`incidentTime-${incident.id}`}>Time of Incident</Label>
                      <Input
                        id={`incidentTime-${incident.id}`}
                        type="time"
                        value={incident.incidentTime}
                        onChange={(e) => 
                          updateIncident(pair.id, incident.id, "incidentTime", e.target.value)
                        }
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`incidentType-${incident.id}`}>Type of Incident</Label>
                      <Select
                        value={incident.incidentType}
                        onValueChange={(value) => 
                          updateIncident(pair.id, incident.id, "incidentType", value)
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
                      <Label htmlFor={`description-${incident.id}`}>Description</Label>
                      <Textarea
                        id={`description-${incident.id}`}
                        value={incident.description}
                        onChange={(e) => 
                          updateIncident(pair.id, incident.id, "description", e.target.value)
                        }
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={addStudentPair}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Student
            </Button>
            
            <Button 
              onClick={addReports} 
              className="flex-1"
              disabled={studentIncidentPairs.length === 0}
            >
              Submit Report{studentIncidentPairs.length > 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
