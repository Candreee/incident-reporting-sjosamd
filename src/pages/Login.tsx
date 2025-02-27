
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SchoolLogo } from "@/components/ui/school-logo";
import { useAuth } from "@/contexts/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, user, profile } = useAuth();

  // Get auto-login credentials from location state (if coming from registration)
  const autoLoginCredentials = location.state?.autoLogin;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: autoLoginCredentials?.email || "",
      password: autoLoginCredentials?.password || "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      console.log("Login: User and profile detected, redirecting based on role:", profile.role);
      // Redirect based on role
      if (profile.role === 'admin' || profile.role === 'principal') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else if (user && !profile) {
      console.log("Login: User logged in but no profile found yet");
    }
  }, [user, profile, navigate]);

  // Attempt auto-login if credentials are provided
  useEffect(() => {
    const performAutoLogin = async () => {
      if (autoLoginCredentials && !user) {
        console.log("Attempting auto-login with credentials:", autoLoginCredentials.email);
        setIsLoading(true);
        try {
          await signIn(autoLoginCredentials.email, autoLoginCredentials.password);
          toast({
            title: "Welcome!",
            description: "You've been automatically logged in.",
          });
          // Navigation will be handled by the user/profile useEffect
        } catch (error) {
          console.error("Auto-login error:", error);
          toast({
            title: "Auto-login failed",
            description: "Please log in manually.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    performAutoLogin();
  }, [autoLoginCredentials, signIn, toast, user]);

  const onSubmit = async (data: LoginFormData) => {
    console.log("Submitting login form with:", data.email);
    setIsLoading(true);
    try {
      const authUser = await signIn(data.email, data.password);
      console.log("Sign-in successful, user:", authUser?.id);
      
      toast({
        title: "Success",
        description: "You have been signed in successfully",
      });

      // Get the user role from metadata
      const role = authUser?.user_metadata?.role;
      console.log("User role from metadata:", role);

      // Immediate redirect based on auth data to avoid waiting for profile
      if (role === 'admin' || role === 'principal') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="flex justify-center py-4">
            <SchoolLogo size="lg" />
          </div>
          <h1 className="text-2xl font-semibold">Sign In</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your credentials to access your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 text-pink-600"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
