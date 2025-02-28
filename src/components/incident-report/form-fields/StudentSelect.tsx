
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UseFormReturn } from "react-hook-form";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentSelectProps {
  form: UseFormReturn<IncidentFormData>;
}

interface Student {
  id: number;
  name: string;
  grade?: string;
}

export function StudentSelect({ form }: StudentSelectProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  // Get the current selected students from the form
  const selectedStudentIds = form.watch("studentIds") || [];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("students")
          .select("id, name, grade")
          .order("name");

        if (error) {
          throw new Error(error.message);
        }

        setStudents(data || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Get selected students objects based on selected ids
  const selectedStudents = students.filter(student => 
    selectedStudentIds.includes(student.id)
  );

  // Add a student to the selection
  const addStudent = () => {
    if (!selectedStudent) return;
    
    const studentId = parseInt(selectedStudent);
    
    // Only add if not already selected
    if (!selectedStudentIds.includes(studentId)) {
      const newSelectedIds = [...selectedStudentIds, studentId];
      form.setValue("studentIds", newSelectedIds, { shouldValidate: true });
    }
    
    // Reset selection
    setSelectedStudent("");
  };

  // Remove a student from the selection
  const removeStudent = (studentId: number) => {
    const newSelectedIds = selectedStudentIds.filter(id => id !== studentId);
    form.setValue("studentIds", newSelectedIds, { shouldValidate: true });
  };

  return (
    <FormField
      control={form.control}
      name="studentIds"
      render={() => (
        <FormItem className="bg-amber-50 p-4 rounded-md border border-amber-200">
          <FormLabel className="text-amber-800 font-medium">Students *</FormLabel>
          <FormControl>
            <div className="space-y-2">
              {/* Display selected students */}
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedStudents.map(student => (
                  <Badge 
                    key={student.id} 
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    {student.name} {student.grade ? `(${student.grade})` : ""}
                    <button 
                      type="button" 
                      onClick={() => removeStudent(student.id)}
                      className="text-amber-800 hover:text-amber-900 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedStudentIds.length === 0 && (
                  <div className="text-sm text-amber-700">No students selected</div>
                )}
              </div>
              
              {/* Student selection UI */}
              <div className="flex gap-2">
                <Select
                  disabled={isLoading}
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a student to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {error ? (
                      <SelectItem value="error" disabled>
                        Error loading students
                      </SelectItem>
                    ) : isLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading students...
                      </SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No students found
                      </SelectItem>
                    ) : (
                      students.map((student) => (
                        <SelectItem 
                          key={student.id} 
                          value={student.id.toString()}
                          disabled={selectedStudentIds.includes(student.id)}
                        >
                          {student.name} {student.grade ? `(${student.grade})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addStudent}
                  disabled={!selectedStudent}
                  className="bg-amber-200 hover:bg-amber-300 text-amber-800 border-amber-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
