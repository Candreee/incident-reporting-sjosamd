
import { z } from "zod";

export const incidentTypes = [
  "behavioral",
  "academic",
  "attendance",
  "bullying",
  "violence",
  "substance_abuse",
  "vandalism",
  "cheating",
  "cyberbullying",
  "dress_code",
  "electronic_device",
  "disruptive_behavior",
  "other"
] as const;

export const incidentFormSchema = z.object({
  studentId: z.number({
    required_error: "Please select a student",
  }),
  class: z.string().min(1, "Class is required"),
  incidentType: z.enum(incidentTypes, {
    required_error: "Please select an incident type",
  }),
  incidentDate: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  evidenceUrl: z.string().optional(),
  evidenceType: z.string().optional(),
});

export type IncidentFormData = z.infer<typeof incidentFormSchema>;
