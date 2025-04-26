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

import { setupMockApi } from "./lib/mockService";
import { MockLoginSelector } from "./components/MockLoginSelector";

// Resource Manager Pages
import ResourceManagerDashboard from "./pages/resource-manager/dashboard";
import ResourceManagerDepartmentNeeds from "./pages/resource-manager/department-needs";
import ResourceManagerCallsForOffers from "./pages/resource-manager/calls-for-offers";
import ResourceManagerSupplierOffers from "./pages/resource-manager/supplier-offers";
import ResourceManagerBlacklist from "./pages/resource-manager/blacklist";
import ResourceManagerDeliveries from "./pages/resource-manager/deliveries";
import ResourceManagerResources from "./pages/resource-manager/resources";
import ResourceManagerResourceAssignment from "./pages/resource-manager/resource-assignment";
import ResourceManagerMaintenance from "./pages/resource-manager/maintenance-tracking";

// Supplier Pages
import SupplierDashboard from "./pages/supplier/dashboard";
import SupplierCallsForOffers from "./pages/supplier/calls-for-offers";
import SupplierCallDetail from "./pages/supplier/call-detail";
import SupplierOffers from "./pages/supplier/offers";
import SupplierNotifications from "./pages/supplier/notifications";

// Technician Pages
import TechnicianDashboard from "./pages/technician/dashboard";
import TechnicianMaintenanceReports from "./pages/technician/maintenance-reports";
import TechnicianReport from "./pages/technician/report";
import TechnicianInterventions from "./pages/technician/interventions";
import TechnicianInterventionDetail from "./pages/technician/intervention-detail";

// Initialize mock API if in development mode and VITE_USE_MOCK_API is true
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === "true") {
  setupMockApi();
}

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

      {/* Resource Manager Routes */}
      <ProtectedRoute path="/resource-manager/dashboard" component={ResourceManagerDashboard} />
      <ProtectedRoute path="/resource-manager/department-needs" component={ResourceManagerDepartmentNeeds} />
      <ProtectedRoute path="/resource-manager/calls-for-offers" component={ResourceManagerCallsForOffers} />
      <ProtectedRoute path="/resource-manager/supplier-offers" component={ResourceManagerSupplierOffers} />
      <ProtectedRoute path="/resource-manager/blacklist" component={ResourceManagerBlacklist} />
      <ProtectedRoute path="/resource-manager/deliveries" component={ResourceManagerDeliveries} />
      <ProtectedRoute path="/resource-manager/resources" component={ResourceManagerResources} />
      <ProtectedRoute path="/resource-manager/resource-assignment" component={ResourceManagerResourceAssignment} />
      <ProtectedRoute path="/resource-manager/maintenance-tracking" component={ResourceManagerMaintenance} />

      {/* Supplier Routes */}
      <ProtectedRoute path="/supplier/dashboard" component={SupplierDashboard} />
      <ProtectedRoute path="/supplier/calls-for-offers" component={SupplierCallsForOffers} />
      <ProtectedRoute path="/supplier/calls-for-offers/:id" component={SupplierCallDetail} />
      <ProtectedRoute path="/supplier/offers" component={SupplierOffers} />
      <ProtectedRoute path="/supplier/notifications" component={SupplierNotifications} />

      {/* Technician Routes */}
      <ProtectedRoute path="/technician/dashboard" component={TechnicianDashboard} />
      <ProtectedRoute path="/technician/maintenance-reports" component={TechnicianMaintenanceReports} />
      <ProtectedRoute path="/technician/report" component={TechnicianReport} />
      <ProtectedRoute path="/technician/interventions" component={TechnicianInterventions} />
      <ProtectedRoute path="/technician/interventions/:id" component={TechnicianInterventionDetail} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Determine if we should show the mock login selector
  const showMockLogin = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === "true";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          {showMockLogin && <MockLoginSelector />}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
