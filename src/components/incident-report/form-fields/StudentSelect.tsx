
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Student, SupabaseStudent } from "@/types/student";
import type { UseFormReturn } from "react-hook-form";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";

interface StudentSelectProps {
  form: UseFormReturn<IncidentFormData>;
}

export function StudentSelect({ form }: StudentSelectProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          incident_count: incident_reports (count)
        `)
        .order("name");

      if (error) throw error;

      const transformedStudents: Student[] = (data as SupabaseStudent[]).map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade,
        incident_count: student.incident_count?.[0]?.count || 0
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students list",
        variant: "destructive",
      });
    }
  };

  return (
    <FormField
      control={form.control}
      name="studentId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Student</FormLabel>
          <Select 
            onValueChange={(value) => field.onChange(parseInt(value))} 
            value={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} - {student.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
