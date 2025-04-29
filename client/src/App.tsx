import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
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

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      
      {/* Teacher and Department Head Routes */}
      <ProtectedRoute 
        path="/resource-needs" 
        component={ResourceNeeds} 
        requiredPermission="request_resources"
        requiredRoles={["teacher", "department_head"]}
      />
      <ProtectedRoute 
        path="/department-needs" 
        component={DepartmentNeeds} 
        requiredPermission="view_department_needs"
        requiredRoles={["department_head"]}
      />
      <ProtectedRoute 
        path="/resource-assignment" 
        component={ResourceAssignment} 
        requiredPermission="view_resources"
      />
      <ProtectedRoute 
        path="/maintenance-report" 
        component={MaintenanceReport} 
        requiredPermission="report_maintenance"
      />
      <ProtectedRoute 
        path="/send-needs" 
        component={SendNeeds} 
        requiredPermission="validate_needs"
        requiredRoles={["department_head"]}
      />

      {/* Resource Manager Routes */}
      <ProtectedRoute 
        path="/resource-manager/dashboard" 
        component={ResourceManagerDashboard} 
        requiredRoles={["resource_manager"]}
      />
      <ProtectedRoute 
        path="/resource-manager/department-needs" 
        component={ResourceManagerDepartmentNeeds} 
        requiredRoles={["resource_manager"]}
      />
      <ProtectedRoute 
        path="/resource-manager/calls-for-offers" 
        component={ResourceManagerCallsForOffers} 
        requiredRoles={["resource_manager"]}
        requiredPermission="create_call_for_offers"
      />
      <ProtectedRoute 
        path="/resource-manager/supplier-offers" 
        component={ResourceManagerSupplierOffers} 
        requiredRoles={["resource_manager"]}
      />
      <ProtectedRoute 
        path="/resource-manager/blacklist" 
        component={ResourceManagerBlacklist} 
        requiredRoles={["resource_manager"]}
        requiredPermission="manage_suppliers"
      />
      <ProtectedRoute 
        path="/resource-manager/deliveries" 
        component={ResourceManagerDeliveries} 
        requiredRoles={["resource_manager"]}
      />
      <ProtectedRoute 
        path="/resource-manager/resources" 
        component={ResourceManagerResources} 
        requiredRoles={["resource_manager"]}
        requiredPermission="manage_resources"
      />
      <ProtectedRoute 
        path="/resource-manager/resource-assignment" 
        component={ResourceManagerResourceAssignment} 
        requiredRoles={["resource_manager"]}
        requiredPermission="assign_resources"
      />
      <ProtectedRoute 
        path="/resource-manager/maintenance-tracking" 
        component={ResourceManagerMaintenance} 
        requiredRoles={["resource_manager"]}
      />

      {/* Supplier Routes */}
      <ProtectedRoute 
        path="/supplier/dashboard" 
        component={SupplierDashboard} 
        requiredRoles={["supplier"]}
      />
      <ProtectedRoute 
        path="/supplier/calls-for-offers" 
        component={SupplierCallsForOffers} 
        requiredRoles={["supplier"]}
        requiredPermission="view_call_for_offers"
      />
      <ProtectedRoute 
        path="/supplier/calls-for-offers/:id" 
        component={SupplierCallDetail} 
        requiredRoles={["supplier"]}
        requiredPermission="view_call_for_offers"
      />
      <ProtectedRoute 
        path="/supplier/offers" 
        component={SupplierOffers} 
        requiredRoles={["supplier"]}
        requiredPermission="submit_offers"
      />
      <ProtectedRoute 
        path="/supplier/notifications" 
        component={SupplierNotifications} 
        requiredRoles={["supplier"]}
      />

      {/* Technician Routes */}
      <ProtectedRoute 
        path="/technician/dashboard" 
        component={TechnicianDashboard} 
        requiredRoles={["technician"]}
      />
      <ProtectedRoute 
        path="/technician/maintenance-reports" 
        component={TechnicianMaintenanceReports} 
        requiredRoles={["technician"]}
        requiredPermission="view_maintenance"
      />
      <ProtectedRoute 
        path="/technician/report" 
        component={TechnicianReport} 
        requiredRoles={["technician"]}
        requiredPermission="create_constat"
      />
      <ProtectedRoute 
        path="/technician/interventions" 
        component={TechnicianInterventions} 
        requiredRoles={["technician"]}
        requiredPermission="update_maintenance"
      />
      <ProtectedRoute 
        path="/technician/interventions/:id" 
        component={TechnicianInterventionDetail} 
        requiredRoles={["technician"]}
        requiredPermission="update_maintenance"
      />

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
