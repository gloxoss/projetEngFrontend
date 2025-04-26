import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
  WrenchIcon, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Bell,
  AlertTriangle,
  FileText,
  Calendar
} from "lucide-react";

export default function TechnicianDashboard() {
  const { user } = useAuth();

  // Fetch maintenance reports
  const { data: maintenanceReports = [] } = useQuery({
    queryKey: ["/api/maintenance-reports"],
  });

  // Fetch interventions
  const { data: interventions = [] } = useQuery({
    queryKey: ["/api/interventions"],
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });

  // Calculate statistics
  const pendingReports = maintenanceReports.filter(
    (report) => report.status === "pending"
  ).length;
  
  const inProgressInterventions = interventions.filter(
    (intervention) => intervention.status === "in_progress"
  ).length;
  
  const completedInterventions = interventions.filter(
    (intervention) => intervention.status === "completed"
  ).length;

  // Get recent interventions for the dashboard table
  const recentInterventions = [...interventions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AppLayout title="Tableau de bord maintenance">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatisticCard
          title="Pannes signalées"
          value={pendingReports}
          icon={<AlertTriangle size={24} />}
          trend={{
            value: 2,
            label: "depuis hier",
            direction: "up",
          }}
        />
        
        <StatisticCard
          title="Interventions en cours"
          value={inProgressInterventions}
          icon={<WrenchIcon size={24} />}
          trend={{
            value: 1,
            label: "cette semaine",
            direction: "up",
          }}
        />
        
        <StatisticCard
          title="Interventions terminées"
          value={completedInterventions}
          icon={<CheckCircle size={24} />}
          trend={{
            value: 5,
            label: "ce mois",
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
                  />
                ))
            )}
          </CardContent>
          <CardFooter className="border-t p-4">
            <Link href="/technician/notifications">
              <Button variant="outline" size="sm" className="w-full">
                Voir toutes les notifications
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Interventions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Interventions récentes</CardTitle>
              <Link href="/technician/interventions">
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
                      Ressource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInterventions.map((intervention) => {
                    const report = maintenanceReports.find(r => r.id === intervention.maintenanceReportId);
                    return (
                      <tr key={intervention.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report ? `Panne #${report.id}` : `Intervention #${intervention.id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(intervention.startDate).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              intervention.status === "completed" 
                                ? "success" 
                                : intervention.status === "in_progress" 
                                ? "outline" 
                                : "secondary"
                            }
                            className="flex items-center gap-1 px-2 py-1"
                          >
                            {intervention.status === "completed" && <CheckCircle className="w-3 h-3" />}
                            {intervention.status === "in_progress" && <WrenchIcon className="w-3 h-3" />}
                            {intervention.status === "pending" && <Clock className="w-3 h-3" />}
                            {intervention.status === "completed" && "Terminée"}
                            {intervention.status === "in_progress" && "En cours"}
                            {intervention.status === "pending" && "En attente"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link href={`/technician/interventions/${intervention.id}`}>
                            <Button variant="ghost" size="sm">
                              Détails
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {recentInterventions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Aucune intervention en cours
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/technician/maintenance-reports">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <ClipboardList className="h-8 w-8 text-primary" />
              <span>Consulter les pannes signalées</span>
            </Button>
          </Link>
          
          <Link href="/technician/interventions">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <WrenchIcon className="h-8 w-8 text-primary" />
              <span>Gérer mes interventions</span>
            </Button>
          </Link>
          
          <Link href="/technician/report">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <span>Saisir un constat de panne</span>
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
