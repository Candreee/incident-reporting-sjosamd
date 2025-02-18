
import { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Upload, X } from "lucide-react";
import { incidentTypes } from "@/schemas/incidentFormSchema";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";
import type { Student, SupabaseStudent } from "@/types/student";

interface IncidentFormFieldsProps {
  form: UseFormReturn<IncidentFormData>;
}

export function IncidentFormFields({ form }: IncidentFormFieldsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          incident_count: incident_reports (count)
        `)
        .order("name");

      if (error) throw error;

      const transformedStudents: Student[] = (data as SupabaseStudent[]).map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade,
        incident_count: student.incident_count?.[0]?.count || 0
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students list",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      toast({
        title: "Error",
        description: "Only video and audio files are allowed",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://ntpqmytvgnkroiskmhzb.functions.supabase.co/upload-evidence', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      form.setValue('evidenceUrl', result.publicUrl);
      form.setValue('evidenceType', result.fileType);

      toast({
        title: "Success",
        description: "Evidence file uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload evidence file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) return;

          try {
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;

            if (data?.text) {
              const currentText = form.getValues('description');
              form.setValue('description', currentText ? `${currentText}\n${data.text}` : data.text);
              toast({
                title: "Success",
                description: "Speech transcribed successfully",
              });
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              title: "Error",
              description: "Failed to transcribe speech",
              variant: "destructive",
            });
          }
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast({
        title: "Recording",
        description: "Speak now...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const removeEvidence = () => {
    form.setValue('evidenceUrl', '');
    form.setValue('evidenceType', '');
    toast({
      title: "Success",
      description: "Evidence file removed",
    });
  };

  return (
    <>
      <FormField
        control={form.control}
        name="studentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Student</FormLabel>
            <Select 
              onValueChange={(value) => field.onChange(parseInt(value))} 
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name} - {student.grade}
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
        name="class"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Class</FormLabel>
            <FormControl>
              <Input placeholder="Enter class" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              <span>Description</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? "bg-red-100 hover:bg-red-200" : ""}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the incident..."
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="evidenceUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Evidence (Video/Audio)</FormLabel>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileUpload}
                disabled={isUploading || !!field.value}
                className="hidden"
                id="evidence-upload"
              />
              {!field.value ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => document.getElementById('evidence-upload')?.click()}
                  className="w-full"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span>Upload Evidence</span>
                    </div>
                  )}
                </Button>
              ) : (
                <div className="flex w-full items-center justify-between bg-secondary p-2 rounded-md">
                  <span className="text-sm truncate">
                    Evidence uploaded: {field.value.split('/').pop()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeEvidence}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
