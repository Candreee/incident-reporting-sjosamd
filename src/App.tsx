
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import NewReport from "./pages/NewReport";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole?: 'admin' | 'teacher' | 'principal'
}) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    console.log("ProtectedRoute: User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If no specific role is required, just check authentication
  if (!requiredRole) {
    return <>{children}</>;
  }

  // For role checking, first use the profile role if available
  const userRole = profile?.role || user.user_metadata?.role;
  console.log(`ProtectedRoute: Checking if user has required role "${requiredRole}", current role: "${userRole}"`);
  
  // If role is required, check against user profile
  if (userRole !== requiredRole) {
    console.log(`ProtectedRoute: User doesn't have required role (${requiredRole}), current role: ${userRole}`);
    
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin' || userRole === 'principal') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Router component that must be inside AuthProvider
const AppRoutes = () => {
  const { user, profile } = useAuth();

  // Function to redirect to the right dashboard based on role
  const DashboardRedirect = () => {
    // Get role from profile first, then fall back to user metadata
    const userRole = profile?.role || user?.user_metadata?.role;
    console.log("DashboardRedirect: Redirecting based on role:", userRole);
    
    // If user is not authenticated, redirect to login
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    // Redirect based on role
    if (userRole === 'admin' || userRole === 'principal') {
      console.log("DashboardRedirect: Redirecting to admin dashboard");
      return <Navigate to="/admin" replace />;
    }
    
    console.log("DashboardRedirect: Redirecting to regular dashboard");
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Redirect to appropriate dashboard */}
      <Route path="/dashboard-redirect" element={<DashboardRedirect />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/students" 
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/new-report" 
        element={
          <ProtectedRoute>
            <NewReport />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
