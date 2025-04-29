import { useEffect } from "react";
import { useLocation } from "wouter";
import { ApiTest } from "../components/ApiTest";
import { useAuth } from "../hooks/use-auth";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  // If not redirected, show API test
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Department Resource Management</h1>
      <div className="max-w-md mx-auto">
        <ApiTest />
      </div>
    </div>
  );
}
