
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <Button
            onClick={() => navigate("/new-report")}
            className="w-full sm:w-auto flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Report</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
