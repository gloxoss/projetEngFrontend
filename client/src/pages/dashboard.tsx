import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ResourceNeed, Resource, MaintenanceReport, Notification } from "@shared/schema";
import { StatisticCard } from "@/components/ui/statistic-card";
import { NotificationItem } from "@/components/ui/notification-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  ComputerIcon,
  FileInput,
  WrenchIcon,
  CheckCircle,
  ArrowUpRight,
  Calendar,
  ClipboardList,
  AlertTriangle
} from "lucide-react";
import { useEffect } from "react";
import { RoleGuard, PermissionGuard } from "@/components/auth";

// Mock data for frontend-only testing
const mockResourceNeeds: ResourceNeed[] = [
  {
    id: 1,
    resourceType: "Ordinateur",
    quantity: 5,
    specifications: "i7, 16GB RAM",
    comments: "Pour le laboratoire",
    status: "pending",
    userId: 2,
    departmentId: 1,
    createdAt: new Date(),
    updatedAt: null,
  },
  {
    id: 2,
    resourceType: "Projecteur",
    quantity: 2,
    specifications: "4K, HDMI",
    comments: "Pour les salles de cours",
    status: "validated",
    userId: 2,
    departmentId: 1,
    createdAt: new Date(),
    updatedAt: null,
  },
];

const mockResources: Resource[] = [
  {
    id: 1,
    resourceType: "Ordinateur",
    inventoryNumber: "PC-001",
    specifications: "Dell XPS, i7, 16GB RAM",
    status: "functional",
    assignedToId: 2,
    departmentId: 1,
    createdAt: new Date(),
    updatedAt: null,
  },
  {
    id: 2,
    resourceType: "Projecteur",
    inventoryNumber: "PROJ-001",
    specifications: "Epson 4K",
    status: "maintenance",
    assignedToId: 3,
    departmentId: 1,
    createdAt: new Date(),
    updatedAt: null,
  },
  {
    id: 3,
    resourceType: "Imprimante",
    inventoryNumber: "PRINT-001",
    specifications: "HP LaserJet",
    status: "out_of_order",
    assignedToId: null,
    departmentId: 1,
    createdAt: new Date(),
    updatedAt: null,
  },
];

const mockMaintenanceReports: MaintenanceReport[] = [
  {
    id: 1,
    resourceId: 2,
    description: "Projecteur ne s'allume pas",
    occurrenceDate: new Date(),
    urgency: "high",
    status: "pending",
    reportedById: 2,
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: null,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect users to their role-specific dashboards
  useEffect(() => {
    if (user?.role === "resource_manager") {
      navigate("/resource-manager/dashboard");
    } else if (user?.role === "supplier") {
      navigate("/supplier/dashboard");
    } else if (user?.role === "technician") {
      navigate("/technician/dashboard");
    }
  }, [user, navigate]);

  // Use mock data for frontend-only testing
  const resourceNeeds = mockResourceNeeds;
  const resources = mockResources;
  const maintenanceReports = mockMaintenanceReports;
  const isLoadingNeeds = false;
  const isLoadingResources = false;
  const isLoadingReports = false;

  // For now, we don't have a notifications endpoint
  const notifications: Notification[] = [];

  const pendingNeeds = resourceNeeds.filter(
    (need) => need.status === "pending"
  ).length;

  const assignedResources = resources.length;

  const reportedIssues = maintenanceReports.filter(
    (report) => report.status !== "resolved"
  ).length;

  const markNotificationAsRead = async (id: number) => {
    console.log("Marking notification as read:", id);
  };

  // Get only recent assignments for the dashboard table
  const recentAssignments = resources
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AppLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatisticCard
          title="Besoins en attente"
          value={pendingNeeds}
          icon={<FileInput size={24} />}
          trend={{
            value: 2,
            label: "depuis hier",
            direction: "up",
          }}
          isLoading={isLoadingNeeds}
        />

        <StatisticCard
          title="Ressources affectées"
          value={assignedResources}
          icon={<ComputerIcon size={24} />}
          trend={{
            value: 3,
            label: "ce mois",
            direction: "up",
          }}
          isLoading={isLoadingResources}
        />

        <StatisticCard
          title="Pannes signalées"
          value={reportedIssues}
          icon={<WrenchIcon size={24} />}
          trend={{
            value: 1,
            label: "cette semaine",
            direction: "up",
          }}
          isLoading={isLoadingReports}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Notifications récentes</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto space-y-1 p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              notifications
                .slice(0, 5)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    title={notification.title}
                    message={notification.message}
                    timestamp={notification.createdAt}
                    variant={notification.isRead ? "default" : "unread"}
                    type={notification.type as any}
                    onClick={() => markNotificationAsRead(notification.id)}
                  />
                ))
            )}
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button variant="outline" size="sm" className="w-full">
              Voir toutes les notifications
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity and Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Affectations de ressources récentes</CardTitle>
              <PermissionGuard permission="view_resources">
                <Link href="/resource-assignment">
                  <Button variant="link" size="sm" className="flex items-center gap-1">
                    Voir tout
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </PermissionGuard>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ressource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spécifications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'affectation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAssignments.map((resource) => (
                    <tr key={resource.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.resourceType} {resource.inventoryNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.resourceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.specifications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(resource.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            resource.status === "functional"
                              ? "default"
                              : resource.status === "maintenance"
                              ? "secondary"
                              : "destructive"
                          }
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {resource.status === "functional" && <CheckCircle className="w-3 h-3" />}
                          {resource.status === "maintenance" && <WrenchIcon className="w-3 h-3" />}
                          {resource.status === "out_of_order" && <AlertTriangle className="w-3 h-3" />}
                          {resource.status === "functional" && "En fonction"}
                          {resource.status === "maintenance" && "Maintenance"}
                          {resource.status === "out_of_order" && "Hors service"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {recentAssignments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Aucune ressource affectée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Only for teachers and department heads */}
      <RoleGuard roles={["teacher", "department_head"]}>
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGuard permission="request_resources">
              <Link href="/resource-needs">
                <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
                  <FileInput className="h-8 w-8 text-primary" />
                  <span>Saisir un besoin</span>
                </Button>
              </Link>
            </PermissionGuard>

            <PermissionGuard permission="report_maintenance">
              <Link href="/maintenance-report">
                <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
                  <WrenchIcon className="h-8 w-8 text-primary" />
                  <span>Signaler une panne</span>
                </Button>
              </Link>
            </PermissionGuard>

            <PermissionGuard permission="view_resources">
              <Link href="/resource-assignment">
                <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <span>Consulter les affectations</span>
                </Button>
              </Link>
            </PermissionGuard>

            <RoleGuard roles={["department_head"]}>
              <PermissionGuard permission="view_department_needs">
                <Link href="/department-needs">
                  <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    <span>Gérer les besoins</span>
                  </Button>
                </Link>
              </PermissionGuard>
            </RoleGuard>
          </div>
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
