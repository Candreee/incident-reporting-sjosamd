
import { useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { EmailConfirmation } from "@/components/auth/EmailConfirmation";
import { RegisterLayout } from "@/components/auth/RegisterLayout";

const Register = () => {
  const [emailSent, setEmailSent] = useState(false);

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <EmailConfirmation />
      </div>
    );
  }

  return (
    <RegisterLayout>
      <RegisterForm onRegisterSuccess={() => setEmailSent(true)} />
    </RegisterLayout>
  );
};

export default Register;
