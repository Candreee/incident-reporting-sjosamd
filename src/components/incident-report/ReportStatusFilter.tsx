
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incidentTypes } from "@/schemas/incidentFormSchema";

interface ReportStatusFilterProps {
  statusValue: string;
  onStatusChange: (value: string) => void;
  typeValue: string;
  onTypeChange: (value: string) => void;
}

export function ReportStatusFilter({ 
  statusValue, 
  onStatusChange,
  typeValue,
  onTypeChange 
}: ReportStatusFilterProps) {
  return (
    <div className="flex gap-4 mb-4">
      <Select value={statusValue} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeValue} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {incidentTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
