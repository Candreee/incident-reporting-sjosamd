
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
  filters: {
    date: string;
    type: string;
  };
  setFilters: (filters: { date: string; type: string }) => void;
}

export function StudentReportFilters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <Input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters({ ...filters, date: e.target.value })
          }
          placeholder="Filter by date"
        />
      </div>
      <div className="flex-1">
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="attendance">Attendance</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
