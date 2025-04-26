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
import { Link } from "wouter";
import { 
  ComputerIcon, 
  FileInput, 
  WrenchIcon, 
  CheckCircle, 
  ArrowUpRight,
  Calendar,
  ClipboardList,
  AlertTriangle,
  ShoppingBag,
  TruckIcon,
  Package
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ResourceManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if not a resource manager
  if (user?.role !== "resource_manager") {
    toast({
      title: "Accès refusé",
      description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
      variant: "destructive",
    });
    navigate("/dashboard");
    return null;
  }

  const { data: resourceNeeds = [] } = useQuery<ResourceNeed[]>({
    queryKey: ["/api/resource-needs"],
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: maintenanceReports = [] } = useQuery<MaintenanceReport[]>({
    queryKey: ["/api/maintenance-reports"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Mock data for calls for offers (appels d'offres)
  const callsForOffers = [
    { id: 1, title: "Appel d'offres - Ordinateurs", status: "open", endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { id: 2, title: "Appel d'offres - Imprimantes", status: "open", endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  ];

  // Mock data for recent deliveries
  const recentDeliveries = [
    { id: 1, supplier: "Tech Solutions", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: "received", items: 12 },
    { id: 2, supplier: "Office Equipment Inc.", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: "received", items: 5 },
  ];

  const pendingNeeds = resourceNeeds.filter(
    (need) => need.status === "validated" || need.status === "sent"
  ).length;

  const openCalls = callsForOffers.filter(call => call.status === "open").length;

  const pendingMaintenanceReports = maintenanceReports.filter(
    (report) => report.status !== "resolved"
  ).length;

  const markNotificationAsRead = async (id: number) => {
    try {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <AppLayout title="Dashboard Responsable des Ressources">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatisticCard
          title="Besoins en attente"
          value={pendingNeeds}
          icon={<FileInput size={24} />}
          trend={{
            value: 2,
            label: "depuis hier",
            direction: "up",
          }}
        />
        
        <StatisticCard
          title="Appels d'offres ouverts"
          value={openCalls}
          icon={<ShoppingBag size={24} />}
          trend={{
            value: 1,
            label: "cette semaine",
            direction: "up",
          }}
        />
        
        <StatisticCard
          title="Livraisons récentes"
          value={recentDeliveries.length}
          icon={<TruckIcon size={24} />}
          trend={{
            value: 3,
            label: "ce mois",
            direction: "up",
          }}
        />
        
        <StatisticCard
          title="Alertes maintenance"
          value={pendingMaintenanceReports}
          icon={<WrenchIcon size={24} />}
          trend={{
            value: 1,
            label: "cette semaine",
            direction: "up",
          }}
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

        {/* Pending Department Needs */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Besoins des départements en attente</CardTitle>
              <Link href="/resource-manager/department-needs">
                <Button variant="link" size="sm" className="flex items-center gap-1">
                  Voir tout
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Département
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de demande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resourceNeeds.filter(need => need.status === "validated" || need.status === "sent").slice(0, 5).map((need) => (
                    <tr key={need.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {need.departmentName || "Informatique"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {need.resourceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {need.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(need.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            need.status === "validated" 
                              ? "success" 
                              : need.status === "sent" 
                              ? "warning" 
                              : "default"
                          }
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {need.status === "validated" && <CheckCircle className="w-3 h-3" />}
                          {need.status === "sent" && <Package className="w-3 h-3" />}
                          {need.status === "validated" && "Validé"}
                          {need.status === "sent" && "Envoyé"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {resourceNeeds.filter(need => need.status === "validated" || need.status === "sent").length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Aucun besoin en attente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/resource-manager/department-needs">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <FileInput className="h-8 w-8 text-primary" />
              <span>Gérer les besoins</span>
            </Button>
          </Link>
          
          <Link href="/resource-manager/calls-for-offers">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span>Appels d'offres</span>
            </Button>
          </Link>
          
          <Link href="/resource-manager/supplier-offers">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <ClipboardList className="h-8 w-8 text-primary" />
              <span>Offres fournisseurs</span>
            </Button>
          </Link>
          
          <Link href="/resource-manager/resources">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <ComputerIcon className="h-8 w-8 text-primary" />
              <span>Gestion des ressources</span>
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
