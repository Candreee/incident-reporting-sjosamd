import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface IncidentReport {
  id: number;
  student_names: string;
  class: string;
  incident_date: string;
  description: string;
  incident_type: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const [recentReports, setRecentReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("incident_reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRecentReports(data || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: "Failed to load incident reports",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentReports.length}</div>
              <p className="text-xs text-muted-foreground">
                Incident reports filed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  recentReports.filter(
                    (report) =>
                      new Date(report.created_at) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">In the last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  recentReports.filter((report) => report.status === "pending")
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Reports awaiting review
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Recent Reports</h2>
            {isLoading ? (
              <p className="text-center py-4">Loading reports...</p>
            ) : recentReports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No reports yet. Click "New Report" to create one.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student(s)</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {format(new Date(report.incident_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{report.student_names}</TableCell>
                      <TableCell>{report.class}</TableCell>
                      <TableCell>{report.incident_type}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
