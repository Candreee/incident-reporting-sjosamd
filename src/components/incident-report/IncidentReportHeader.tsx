
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { SchoolLogo } from "@/components/ui/school-logo";

export function IncidentReportHeader() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const handleBack = () => {
    // Navigate to admin dashboard if user is admin or principal, otherwise to regular dashboard
    const targetRoute = profile?.role === 'admin' || profile?.role === 'principal' 
      ? "/admin" 
      : "/dashboard";
    
    navigate(targetRoute);
  };
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SchoolLogo size="sm" className="mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">New Incident Report</h1>
        </div>
      </div>
    </header>
  );
}
