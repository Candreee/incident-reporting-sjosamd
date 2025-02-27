
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <SchoolLogo size="lg" />
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Stanley Jon Odlum School
            </h1>
            <p className="text-lg text-gray-600">
              Incident Reporting System
            </p>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button
            onClick={() => navigate("/login")}
            className="w-full py-6 text-lg flex items-center justify-between group hover:shadow-lg transition-all duration-300 bg-pink-600 hover:bg-pink-700"
          >
            Sign In
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            <p>Authorized personnel only.</p>
            <p>Please contact administration for access.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
