
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incidentTypes } from "@/schemas/incidentFormSchema";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${isMobile ? 'w-full' : ''}`}>
      <Select value={statusValue} onValueChange={onStatusChange}>
        <SelectTrigger className={isMobile ? 'w-full' : 'w-[180px]'}>
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
        <SelectTrigger className={isMobile ? 'w-full' : 'w-[180px]'}>
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {incidentTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
