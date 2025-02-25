
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/new-report")}
              className="flex-1 sm:flex-none flex items-center gap-2"
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
