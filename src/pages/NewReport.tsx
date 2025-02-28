
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
      studentIds: [],
      incidentTypes: [],
      incidentDate: new Date().toISOString().split("T")[0],
      incidentTime: new Date().toTimeString().slice(0, 5), // Default to current time (HH:MM format)
      description: "",
      evidenceUrl: "",
      evidenceType: "",
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

      // Fetch student names for the record
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, name")
        .in("id", data.studentIds);

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

      // Create a comma-separated string of student names
      const studentNames = studentData.map(student => student.name).join(", ");
      
      // Get the current user ID before creating the reports array
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      // Create an array of reports to insert - one for each incident type
      const reportsToInsert = data.incidentTypes.map(incidentType => ({
        student_id: data.studentIds[0], // Primary student (first in the list)
        student_names: studentNames,
        class: "", // Keeping empty but not removing since it's in the database schema
        incident_date: combinedDateTime,
        description: data.description,
        incident_type: incidentType,
        status: status,
        created_by: userId,
        reporter_name: reporterName,
        evidence_url: data.evidenceUrl || null,
        evidence_type: data.evidenceType || null,
      }));

      // Insert all reports
      const { data: insertedReports, error } = await supabase
        .from("incident_reports")
        .insert(reportsToInsert)
        .select();

      if (error) {
        console.error("Error inserting reports:", error);
        throw new Error(`Failed to insert reports: ${error.message}`);
      }

      console.log("Reports inserted successfully:", insertedReports);

      // Send notification to admins and principals for each report
      try {
        // Only send one notification for the whole group of reports
        const { error: notificationError } = await supabase.functions.invoke('notify-incident', {
          body: {
            reportId: insertedReports[0].id,
            studentName: studentNames,
            incidentType: data.incidentTypes.join(", "),
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
        description: `Failed to submit incident report: ${error instanceof Error ? error.message : "Unknown error"}`,
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
