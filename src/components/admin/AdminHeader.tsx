
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const AdminHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            {isMobile ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/students")}
                  className="flex-1 sm:flex-none"
                >
                  <Users className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => navigate("/new-report")}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/students")}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Manage Students
                </Button>
                <Button
                  onClick={() => navigate("/new-report")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Report
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
