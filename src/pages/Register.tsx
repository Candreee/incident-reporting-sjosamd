
import { useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { EmailConfirmation } from "@/components/auth/EmailConfirmation";
import { RegisterLayout } from "@/components/auth/RegisterLayout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegisterSuccess = (email: string, requiresEmailConfirmation: boolean) => {
    if (requiresEmailConfirmation) {
      // If email confirmation is required, show the email confirmation screen
      setUserEmail(email);
      setEmailSent(true);
      
      toast({
        title: "Registration Successful",
        description: "Please check your email for a verification link.",
        duration: 5000,
      });
    } else {
      // If no email confirmation is required, redirect to login
      toast({
        title: "Registration Successful",
        description: `Account created for ${email}. You'll be redirected to login.`,
        duration: 5000,
      });
      
      // Log for debugging
      console.log("Registration successful, redirecting to login");
      
      // Redirect to login
      navigate("/login");
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <EmailConfirmation email={userEmail} />
      </div>
    );
  }

  return (
    <RegisterLayout>
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
    </RegisterLayout>
  );
};

export default Register;
