
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { UseFormReturn } from "react-hook-form";
import type { IncidentFormData } from "@/schemas/incidentFormSchema";

interface EvidenceUploadProps {
  form: UseFormReturn<IncidentFormData>;
}

export function EvidenceUpload({ form }: EvidenceUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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

  const removeEvidence = () => {
    form.setValue('evidenceUrl', '');
    form.setValue('evidenceType', '');
    toast({
      title: "Success",
      description: "Evidence file removed",
    });
  };

  return (
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
  );
}
