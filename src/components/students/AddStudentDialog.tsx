
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddStudentDialog({ isOpen, onOpenChange, onSuccess }: AddStudentDialogProps) {
  const [newStudent, setNewStudent] = useState({ name: "", grade: "" });
  const { toast } = useToast();

  const addStudent = async () => {
    try {
      const { error } = await supabase.from("students").insert([
        {
          name: newStudent.name,
          grade: newStudent.grade,
        },
      ]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error("A student with this name already exists");
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Student added successfully",
      });
      onOpenChange(false);
      setNewStudent({ name: "", grade: "" });
      onSuccess();
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add student",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              value={newStudent.grade}
              onChange={(e) =>
                setNewStudent({ ...newStudent, grade: e.target.value })
              }
            />
          </div>
          <Button onClick={addStudent} className="w-full">
            Add Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
