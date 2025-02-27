
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incidentTypes } from "@/schemas/incidentFormSchema";
import type { UseFormReturn } from "react-hook-form";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";

interface BasicFieldsProps {
  form: UseFormReturn<IncidentFormData>;
}

export function BasicFields({ form }: BasicFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="incidentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Incident</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="incidentDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Incident</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="incidentTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Time of Incident</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
