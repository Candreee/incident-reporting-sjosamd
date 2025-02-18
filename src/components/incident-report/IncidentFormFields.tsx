
import { UseFormReturn } from "react-hook-form";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";
import { StudentSelect } from "./form-fields/StudentSelect";
import { BasicFields } from "./form-fields/BasicFields";
import { DescriptionField } from "./form-fields/DescriptionField";
import { EvidenceUpload } from "./form-fields/EvidenceUpload";

interface IncidentFormFieldsProps {
  form: UseFormReturn<IncidentFormData>;
}

export function IncidentFormFields({ form }: IncidentFormFieldsProps) {
  return (
    <>
      <StudentSelect form={form} />
      <BasicFields form={form} />
      <DescriptionField form={form} />
      <EvidenceUpload form={form} />
    </>
  );
}
