import AppLayout from "@/layouts/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/ui/notification-item";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Bell, CheckCircle } from "lucide-react";

export default function Notifications() {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter((n: any) => !n.isRead);
      
      // Mark each unread notification as read
      for (const notification of unreadNotifications) {
        await apiRequest("POST", `/api/notifications/${notification.id}/read`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <AppLayout title="Centre de notifications">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune notification</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous n'avez pas encore reçu de notifications.
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer ${selectedNotification?.id === notification.id ? 'bg-gray-100' : ''}`}
                  >
                    <NotificationItem
                      title={notification.title}
                      message={notification.message}
                      timestamp={notification.createdAt}
                      variant={notification.isRead ? "default" : "unread"}
                      type={notification.type as any}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Detail */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Détails de la notification</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNotification ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium">{selectedNotification.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedNotification.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-line">{selectedNotification.message}</p>
                </div>
                
                {selectedNotification.type === "success" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-800">Félicitations!</span>
                    </div>
                    <p className="mt-2 text-sm text-green-700">
                      Votre offre a été acceptée. Vous recevrez bientôt plus d'informations concernant les prochaines étapes.
                    </p>
                  </div>
                )}
                
                {selectedNotification.type === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-red-800">Offre non retenue</span>
                    </div>
                    <p className="mt-2 text-sm text-red-700">
                      Nous vous remercions pour votre participation. N'hésitez pas à soumettre de nouvelles offres pour les prochains appels.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune notification sélectionnée</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sélectionnez une notification pour voir les détails.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
