
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { IncidentFormFields } from "@/components/incident-report/IncidentFormFields";
import { IncidentReportHeader } from "@/components/incident-report/IncidentReportHeader";
import { incidentFormSchema, type IncidentFormData } from "@/schemas/incidentFormSchema";
import { useAuth } from "@/contexts/AuthContext";

const NewReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      studentId: undefined,
      class: "",
      incidentDate: new Date().toISOString().split("T")[0],
      description: "",
      incidentType: undefined,
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    try {
      // Set status to approved if user is admin or principal
      const status = profile?.role === "admin" || profile?.role === "principal" 
        ? "approved" 
        : "pending";

      // Fetch student name for the record
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("name")
        .eq("id", data.studentId)
        .single();

      if (studentError) throw studentError;

      // Insert the report
      const { data: insertedReport, error } = await supabase
        .from("incident_reports")
        .insert([
          {
            student_id: data.studentId,
            student_names: studentData.name,
            class: data.class,
            incident_date: data.incidentDate,
            description: data.description,
            incident_type: data.incidentType,
            status: status,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send notification to admins and principals
      const { error: notificationError } = await supabase.functions.invoke('notify-incident', {
        body: {
          reportId: insertedReport.id,
          studentName: studentData.name,
          incidentType: data.incidentType,
          description: data.description,
        },
      });

      if (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't throw here, as the report was still created successfully
      }

      toast({
        title: "Success",
        description: "Incident report submitted successfully",
      });
      navigate(profile?.role === 'teacher' ? "/dashboard" : "/admin");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit incident report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <IncidentReportHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <IncidentFormFields form={form} />
              <div className="flex justify-end">
                <Button type="submit">Submit Report</Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default NewReport;
