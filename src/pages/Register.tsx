
import { useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { EmailConfirmation } from "@/components/auth/EmailConfirmation";
import { RegisterLayout } from "@/components/auth/RegisterLayout";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSuccess = (email: string, password: string) => {
    // Instead of showing email confirmation, redirect to login with credentials
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
