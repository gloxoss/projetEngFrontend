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
  ShoppingBag, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Bell,
  Calendar,
  ClipboardList,
  AlertTriangle
} from "lucide-react";

export default function SupplierDashboard() {
  const { user } = useAuth();

  // Fetch open calls for offers
  const { data: callsForOffers = [] } = useQuery({
    queryKey: ["/api/calls-for-offers"],
  });

  // Fetch supplier offers
  const { data: supplierOffers = [] } = useQuery({
    queryKey: ["/api/supplier-offers"],
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });

  // Calculate statistics
  const openCalls = callsForOffers.filter((call) => call.status === "open").length;
  const pendingOffers = supplierOffers.filter((offer) => offer.status === "pending").length;
  const acceptedOffers = supplierOffers.filter((offer) => offer.status === "accepted").length;

  // Get recent offers for the dashboard table
  const recentOffers = [...supplierOffers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AppLayout title="Tableau de bord fournisseur">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatisticCard
          title="Appels d'offres ouverts"
          value={openCalls}
          icon={<ShoppingBag size={24} />}
          trend={{
            value: 2,
            label: "depuis hier",
            direction: "up",
          }}
        />
        
        <StatisticCard
          title="Offres en attente"
          value={pendingOffers}
          icon={<Clock size={24} />}
          trend={{
            value: 1,
            label: "cette semaine",
            direction: "up",
          }}
        />
        
        <StatisticCard
          title="Offres acceptées"
          value={acceptedOffers}
          icon={<CheckCircle size={24} />}
          trend={{
            value: 3,
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
            <Link href="/supplier/notifications">
              <Button variant="outline" size="sm" className="w-full">
                Voir toutes les notifications
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Offers */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Offres récentes</CardTitle>
              <Link href="/supplier/offers">
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
                      Appel d'offres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOffers.map((offer) => {
                    const call = callsForOffers.find(c => c.id === offer.callForOffersId);
                    return (
                      <tr key={offer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {call?.title || `Appel #${offer.callForOffersId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {offer.totalPrice.toLocaleString("fr-FR")} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              offer.status === "accepted" 
                                ? "success" 
                                : offer.status === "pending" 
                                ? "outline" 
                                : "destructive"
                            }
                            className="flex items-center gap-1 px-2 py-1"
                          >
                            {offer.status === "accepted" && <CheckCircle className="w-3 h-3" />}
                            {offer.status === "pending" && <Clock className="w-3 h-3" />}
                            {offer.status === "rejected" && <AlertTriangle className="w-3 h-3" />}
                            {offer.status === "accepted" && "Acceptée"}
                            {offer.status === "pending" && "En attente"}
                            {offer.status === "rejected" && "Rejetée"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {recentOffers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Aucune offre soumise
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
          <Link href="/supplier/calls-for-offers">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span>Consulter les appels d'offres</span>
            </Button>
          </Link>
          
          <Link href="/supplier/offers">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <span>Historique des offres</span>
            </Button>
          </Link>
          
          <Link href="/supplier/notifications">
            <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              <span>Centre de notifications</span>
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
