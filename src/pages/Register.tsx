
import { useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { EmailConfirmation } from "@/components/auth/EmailConfirmation";
import { RegisterLayout } from "@/components/auth/RegisterLayout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegisterSuccess = (email: string, password: string) => {
    // Show a toast with registration success message
    toast({
      title: "Registration Successful",
      description: `Account created for ${email}. You'll be redirected to login.`,
      duration: 5000,
    });
    
    // Log for debugging
    console.log("Registration successful, redirecting to login with credentials");
    
    // Redirect to login with credentials for auto-login
    navigate("/login", { 
      state: { 
        autoLogin: { 
          email, 
          password 
        } 
      } 
    });
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <EmailConfirmation />
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
