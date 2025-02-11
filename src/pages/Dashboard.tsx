
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [recentReports, setRecentReports] = useState([]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <Button
              onClick={() => navigate("/new-report")}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Report</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Recent Reports</h2>
          {recentReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reports yet. Click "New Report" to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Report list will go here */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
