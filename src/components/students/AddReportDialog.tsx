
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

interface AddReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  userId: string | undefined;
  onSuccess: () => void;
}

export function AddReportDialog({ 
  isOpen, 
  onOpenChange, 
  student, 
  userId,
  onSuccess 
}: AddReportDialogProps) {
  const [newReport, setNewReport] = useState({
    description: "",
    incidentType: "",
    incidentTime: new Date().toTimeString().slice(0, 5), // Default to current time
    evidenceUrl: "",
    evidenceType: "",
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  const addReport = async () => {
    if (!student || !userId) return;

    try {
      // Set status to approved if user is admin or principal
      const status = profile?.role === "admin" || profile?.role === "principal" 
        ? "approved" 
        : "pending";
        
      console.log(`User role: ${profile?.role}, setting status to: ${status}`);

      // Get today's date and combine with the time
      const today = new Date().toISOString().split('T')[0];
      const combinedDateTime = `${today}T${newReport.incidentTime}:00`;

      const { error } = await supabase.from("incident_reports").insert([
        {
          student_id: student.id,
          student_names: student.name,
          description: newReport.description,
          incident_type: newReport.incidentType,
          class: "", // Keeping empty but not removing from database schema
          incident_date: combinedDateTime,
          status: status,
          created_by: userId,
          evidence_url: newReport.evidenceUrl,
          evidence_type: newReport.evidenceType,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident report added successfully",
      });
      onOpenChange(false);
      setNewReport({ 
        description: "", 
        incidentType: "", 
        incidentTime: new Date().toTimeString().slice(0, 5),
        evidenceUrl: "", 
        evidenceType: "" 
      });
      onSuccess();
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Incident Report for {student?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="incidentTime">Time of Incident</Label>
            <Input
              id="incidentTime"
              type="time"
              value={newReport.incidentTime}
              onChange={(e) =>
                setNewReport({ ...newReport, incidentTime: e.target.value })
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
  );
}
