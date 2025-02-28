
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
import { useAuth } from "@/contexts/auth";

const NewReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      studentId: undefined,
      incidentDate: new Date().toISOString().split("T")[0],
      incidentTime: new Date().toTimeString().slice(0, 5), // Default to current time (HH:MM format)
      description: "",
      incidentType: undefined,
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    try {
      console.log("Submitting incident report with data:", data);
      
      // Set status to approved if user is admin or principal
      const status = profile?.role === "admin" || profile?.role === "principal" 
        ? "approved" 
        : "pending";

      console.log(`User role: ${profile?.role}, setting status to: ${status}`);

      // Fetch student name for the record
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("name")
        .eq("id", data.studentId)
        .single();

      if (studentError) {
        console.error("Error fetching student data:", studentError);
        throw new Error(`Failed to fetch student data: ${studentError.message}`);
      }

      // Construct reporter's full name
      const reporterName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Unknown Teacher';

      // Combine date and time for the incident_date field in the database
      const combinedDateTime = `${data.incidentDate}T${data.incidentTime}:00`;

      console.log("Inserting report with combined date/time:", combinedDateTime);

      // Insert the report
      const { data: insertedReport, error } = await supabase
        .from("incident_reports")
        .insert([
          {
            student_id: data.studentId,
            student_names: studentData.name,
            class: "", // Keeping empty but not removing since it's in the database schema
            incident_date: combinedDateTime,
            description: data.description,
            incident_type: data.incidentType,
            status: status,
            created_by: (await supabase.auth.getUser()).data.user?.id,
            reporter_name: reporterName,
            evidence_url: data.evidenceUrl || null,
            evidence_type: data.evidenceType || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error inserting report:", error);
        throw new Error(`Failed to insert report: ${error.message}`);
      }

      console.log("Report inserted successfully:", insertedReport);

      // Send notification to admins and principals
      try {
        const { error: notificationError } = await supabase.functions.invoke('notify-incident', {
          body: {
            reportId: insertedReport.id,
            studentName: studentData.name,
            incidentType: data.incidentType,
            description: data.description,
            reporterName: reporterName,
          },
        });

        if (notificationError) {
          console.error("Error sending notification:", notificationError);
          // Continue execution even if notification fails
        }
      } catch (notifyError) {
        console.error("Exception sending notification:", notifyError);
        // Continue execution even if notification fails
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
        description: `Failed to submit incident report: ${error.message || "Unknown error"}`,
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
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default NewReport;
