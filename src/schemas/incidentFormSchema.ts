
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
  studentIds: z.array(z.number()).min(1, "Please select at least one student"),
  incidentTypes: z.array(z.enum(incidentTypes)).min(1, "Please select at least one incident type"),
  incidentDate: z.string().min(1, "Date is required"),
  incidentTime: z.string().min(1, "Time is required"),
  description: z.string().min(1, "Description is required"),
  evidenceUrl: z.string().optional(),
  evidenceType: z.string().optional(),
});

export type IncidentFormData = z.infer<typeof incidentFormSchema>;
