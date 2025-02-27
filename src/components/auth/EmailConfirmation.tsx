
import { Button } from "@/components/ui/button";
import { SchoolLogo } from "@/components/ui/school-logo";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const EmailConfirmation = ({ email }: { email?: string }) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6 text-center">
      <div className="flex justify-center">
        <SchoolLogo size="lg" />
      </div>
      <h1 className="text-2xl font-semibold">Check Your Email</h1>
      <p className="text-gray-600">
        We've sent a confirmation link to {email ? <strong>{email}</strong> : "your email address"}. Please check your inbox and click the link to activate your account.
      </p>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          The email contains a verification link that will expire in 24 hours. If you don't see the email, please check your spam folder.
        </p>
        <Button onClick={() => navigate("/login")} className="w-full bg-pink-600 hover:bg-pink-700">
          Go to Login
        </Button>
      </div>
    </Card>
  );
};
