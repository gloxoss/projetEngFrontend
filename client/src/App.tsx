import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "./pages/home-page";
import Dashboard from "./pages/dashboard";
import ResourceNeeds from "./pages/resource-needs";
import DepartmentNeeds from "./pages/department-needs";
import ResourceAssignment from "./pages/resource-assignment";
import MaintenanceReport from "./pages/maintenance-report";
import SendNeeds from "./pages/send-needs";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/resource-needs" component={ResourceNeeds} />
      <ProtectedRoute path="/department-needs" component={DepartmentNeeds} />
      <ProtectedRoute path="/resource-assignment" component={ResourceAssignment} />
      <ProtectedRoute path="/maintenance-report" component={MaintenanceReport} />
      <ProtectedRoute path="/send-needs" component={SendNeeds} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
