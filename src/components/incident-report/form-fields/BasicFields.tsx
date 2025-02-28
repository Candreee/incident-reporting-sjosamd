
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";
import { incidentTypes } from "@/schemas/incidentFormSchema";

interface BasicFieldsProps {
  form: UseFormReturn<IncidentFormData>;
}

export function BasicFields({ form }: BasicFieldsProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  
  // Get the current selected incident types from the form
  const selectedIncidentTypes = form.watch("incidentTypes") || [];

  // Add an incident type to the selection
  const addIncidentType = () => {
    if (!selectedType) return;
    
    // Only add if not already selected
    if (!selectedIncidentTypes.includes(selectedType as any)) {
      const newSelectedTypes = [...selectedIncidentTypes, selectedType as any];
      form.setValue("incidentTypes", newSelectedTypes, { shouldValidate: true });
    }
    
    // Reset selection
    setSelectedType("");
  };

  // Remove an incident type from the selection
  const removeIncidentType = (typeToRemove: string) => {
    const newSelectedTypes = selectedIncidentTypes.filter(type => type !== typeToRemove);
    form.setValue("incidentTypes", newSelectedTypes, { shouldValidate: true });
  };

  // Format incident type for display
  const formatIncidentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="incidentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Incident *</FormLabel>
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
              <FormLabel>Time of Incident *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="incidentTypes"
        render={() => (
          <FormItem>
            <FormLabel>Type of Incident *</FormLabel>
            <FormControl>
              <div className="space-y-2">
                {/* Display selected incident types */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedIncidentTypes.map(type => (
                    <Badge 
                      key={type} 
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {formatIncidentType(type)}
                      <button 
                        type="button" 
                        onClick={() => removeIncidentType(type)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedIncidentTypes.length === 0 && (
                    <div className="text-sm text-gray-500">No incident types selected</div>
                  )}
                </div>
                
                {/* Incident type selection UI */}
                <div className="flex gap-2">
                  <Select
                    value={selectedType}
                    onValueChange={setSelectedType}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an incident type to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem 
                          key={type} 
                          value={type}
                          disabled={selectedIncidentTypes.includes(type)}
                        >
                          {formatIncidentType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addIncidentType}
                    disabled={!selectedType}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
