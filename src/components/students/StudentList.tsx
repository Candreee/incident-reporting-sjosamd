
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student } from "@/types/student";

interface StudentListProps {
  students: Student[];
  onAddReport: (student: Student) => void;
}

export function StudentList({ students, onAddReport }: StudentListProps) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Incident Reports</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>
              <Button
                variant="link"
                onClick={() => navigate(`/students/${student.id}/reports`)}
              >
                {student.name}
              </Button>
            </TableCell>
            <TableCell>{student.grade}</TableCell>
            <TableCell>{student.incident_count}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddReport(student)}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Add Report</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
