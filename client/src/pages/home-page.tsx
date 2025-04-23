import { useEffect } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to dashboard
    navigate("/dashboard");
  }, [navigate]);

  return null;
}
