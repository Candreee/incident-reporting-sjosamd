
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { SchoolLogo } from "@/components/ui/school-logo";
import { useAuth } from "@/contexts/auth";

import { registerSchema, RegisterFormData } from "./schemas/registerSchema";
import { NameFields } from "./register/NameFields";
import { EmailField } from "./register/EmailField";
import { RoleField } from "./register/RoleField";
import { PasswordFields } from "./register/PasswordFields";

export function RegisterForm({
  onRegisterSuccess,
}: {
  onRegisterSuccess: (email: string, requiresEmailConfirmation: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "teacher",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      console.log("Starting registration process for:", data.email);
      
      const result = await signUp(
        data.email,
        data.password,
        data.role,
        data.firstName,
        data.lastName
      );
      
      console.log("Registration result:", result);
      console.log("Email confirmation required:", result.requiresEmailConfirmation);
      
      // Call the success handler with the email and confirmation status
      onRegisterSuccess(data.email, result.requiresEmailConfirmation);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6 bg-white">
      <div className="text-center">
        <div className="flex justify-center py-4">
          <SchoolLogo size="lg" />
        </div>
        <h1 className="text-2xl font-semibold">Create an Account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register to access the incident management system
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <NameFields />
          <EmailField />
          <RoleField />
          <PasswordFields />

          <Button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
