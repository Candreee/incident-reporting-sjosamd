
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UseFormReturn } from "react-hook-form";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";

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

  return (
    <FormField
      control={form.control}
      name="studentId"
      render={({ field }) => (
        <FormItem className="bg-amber-50 p-4 rounded-md border border-amber-200">
          <FormLabel className="text-amber-800 font-medium">Student *</FormLabel>
          <FormControl>
            <Select
              disabled={isLoading}
              onValueChange={(value) => field.onChange(parseInt(value))}
              value={field.value?.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a student" />
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
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} {student.grade ? `(${student.grade})` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
