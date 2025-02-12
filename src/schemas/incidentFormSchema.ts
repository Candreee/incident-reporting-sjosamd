
import { z } from "zod";

export const incidentFormSchema = z.object({
  studentNames: z.string().min(1, "Student name(s) are required"),
  class: z.string().min(1, "Class is required"),
  incidentDate: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  incidentType: z.string().min(1, "Incident type is required"),
});

export type IncidentFormData = z.infer<typeof incidentFormSchema>;

export const incidentTypes = [
  "Bullying",
  "Vandalism",
  "Disruptive Behavior",
  "Fighting",
  "Academic Dishonesty",
  "Attendance",
  "Other"
] as const;
