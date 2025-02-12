
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
      studentNames: "",
      class: "",
      incidentDate: new Date().toISOString().split("T")[0],
      description: "",
      incidentType: "",
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    try {
      const { error } = await supabase.from("incident_reports").insert([
        {
          student_names: data.studentNames,
          class: data.class,
          incident_date: data.incidentDate,
          description: data.description,
          incident_type: data.incidentType,
          status: "pending",
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (error) throw error;

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
