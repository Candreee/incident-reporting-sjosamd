
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { SchoolLogo } from "@/components/ui/school-logo";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Construct full name, fallback to "Dashboard" if no name is set
  const fullName = profile?.first_name || profile?.last_name
    ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() + "'s"
    : '';

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" />
            <h1 className="text-2xl font-semibold text-gray-900">{fullName} Dashboard</h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/new-report")}
              className="flex-1 sm:flex-none flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-4 w-4" />
              <span>New Report</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/settings")}
              className="flex-1 sm:flex-none flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
