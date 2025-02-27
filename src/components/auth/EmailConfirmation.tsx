
import { Button } from "@/components/ui/button";
import { SchoolLogo } from "@/components/ui/school-logo";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { EnvelopeOpenIcon, CheckCircleIcon } from "lucide-react";

export const EmailConfirmation = ({ email }: { email?: string }) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto p-8 space-y-6 text-center shadow-lg">
      <div className="flex justify-center">
        <SchoolLogo size="lg" />
      </div>
      
      <div className="flex justify-center my-6">
        <div className="bg-pink-100 p-4 rounded-full">
          <EnvelopeOpenIcon size={36} className="text-pink-600" />
        </div>
      </div>
      
      <h1 className="text-2xl font-semibold">Check Your Email</h1>
      
      <p className="text-gray-600">
        We've sent a confirmation link to {email ? (
          <strong className="text-pink-600">{email}</strong>
        ) : (
          "your email address"
        )}. Please check your inbox and click the link to activate your account.
      </p>
      
      <div className="space-y-6 mt-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-start space-x-2 text-left">
            <CheckCircleIcon size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Important Information</p>
              <p>The verification link will expire in 24 hours</p>
              <p>If you don't see the email, please check your spam folder</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => navigate("/login")} 
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            Return to Login
          </Button>
        </div>
      </div>
    </Card>
  );
};
