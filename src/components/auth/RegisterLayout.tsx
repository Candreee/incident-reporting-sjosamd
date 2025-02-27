
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegisterLayoutProps {
  children: ReactNode;
}

export const RegisterLayout = ({ children }: RegisterLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/login")}
            className="hover:bg-pink-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Create Account</h1>
        </div>

        {children}
      </Card>
    </div>
  );
};
