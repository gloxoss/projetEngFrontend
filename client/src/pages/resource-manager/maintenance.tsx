import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MaintenanceReport } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  Eye, 
  WrenchIcon, 
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  Truck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Schema for maintenance decision form
const maintenanceDecisionSchema = z.object({
  decision: z.enum(["repair_internal", "repair_external", "return_supplier", "replace"]),
  notes: z.string().optional(),
});

type MaintenanceDecisionValues = z.infer<typeof maintenanceDecisionSchema>;

export default function MaintenanceManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [viewingReport, setViewingReport] = useState<MaintenanceReport | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);

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

  const { data: maintenanceReports = [], isLoading } = useQuery<MaintenanceReport[]>({
    queryKey: ["/api/maintenance-reports"],
  });

  const form = useForm<MaintenanceDecisionValues>({
    resolver: zodResolver(maintenanceDecisionSchema),
    defaultValues: {
      decision: "repair_internal",
      notes: "",
    },
  });

  const handleViewReport = (report: MaintenanceReport) => {
    setViewingReport(report);
  };

  const handleMakeDecision = (report: MaintenanceReport) => {
    setViewingReport(report);
    setShowDecisionDialog(true);
  };

  const onSubmitDecision = (values: MaintenanceDecisionValues) => {
    if (!viewingReport) return;
    
    // This would be implemented to update the maintenance report
    toast({
      title: "Décision enregistrée",
      description: `La décision pour la panne de ${viewingReport.resourceType} ${viewingReport.resourceInventoryNumber} a été enregistrée.`,
      variant: "default",
    });
    
    setShowDecisionDialog(false);
    setViewingReport(null);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3" />
            En attente
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <WrenchIcon className="w-3 h-3" />
            En cours
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Résolu
          </Badge>
        );
      case "external_repair":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
            <ArrowLeftRight className="w-3 h-3" />
            Réparation externe
          </Badge>
        );
      case "returned_to_supplier":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
            <Truck className="w-3 h-3" />
            Retourné au fournisseur
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "low":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Faible
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Moyen
          </Badge>
        );
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Élevé
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Critique
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {urgency}
          </Badge>
        );
    }
  };

  const columns = [
    {
      header: "Ressource",
      accessor: (report: MaintenanceReport) => `${report.resourceType} ${report.resourceInventoryNumber}`,
      enableSorting: true,
    },
    {
      header: "Problème",
      accessor: "issue",
    },
    {
      header: "Signalé par",
      accessor: "reportedBy",
      enableSorting: true,
    },
    {
      header: "Date",
      accessor: (report: MaintenanceReport) => new Date(report.createdAt).toLocaleDateString("fr-FR"),
      enableSorting: true,
    },
    {
      header: "Urgence",
      accessor: (report: MaintenanceReport) => getUrgencyBadge(report.urgency),
    },
    {
      header: "Statut",
      accessor: (report: MaintenanceReport) => getStatusBadge(report.status),
    },
  ];

  const filters = [
    {
      name: "Statut",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "En attente", value: "pending", filter: (report: MaintenanceReport) => report.status === "pending" },
        { label: "En cours", value: "in_progress", filter: (report: MaintenanceReport) => report.status === "in_progress" },
        { label: "Résolu", value: "resolved", filter: (report: MaintenanceReport) => report.status === "resolved" },
        { label: "Réparation externe", value: "external_repair", filter: (report: MaintenanceReport) => report.status === "external_repair" },
        { label: "Retourné au fournisseur", value: "returned_to_supplier", filter: (report: MaintenanceReport) => report.status === "returned_to_supplier" },
      ],
    },
    {
      name: "Urgence",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "Faible", value: "low", filter: (report: MaintenanceReport) => report.urgency === "low" },
        { label: "Moyen", value: "medium", filter: (report: MaintenanceReport) => report.urgency === "medium" },
        { label: "Élevé", value: "high", filter: (report: MaintenanceReport) => report.urgency === "high" },
        { label: "Critique", value: "critical", filter: (report: MaintenanceReport) => report.urgency === "critical" },
      ],
    },
  ];

  const actions = [
    {
      label: "Voir détails",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewReport,
    },
    {
      label: "Prendre une décision",
      icon: <WrenchIcon className="h-4 w-4" />,
      onClick: handleMakeDecision,
      showWhen: (report: MaintenanceReport) => report.status === "pending",
    },
  ];

  return (
    <AppLayout title="Suivi des pannes et retours">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rapports de maintenance</CardTitle>
            <CardDescription>
              Consultez et gérez les rapports de pannes et les retours fournisseurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={maintenanceReports}
              columns={columns}
              filters={filters}
              actions={actions}
              searchField={(report) => `${report.resourceType} ${report.resourceInventoryNumber} ${report.issue} ${report.reportedBy}`}
              searchPlaceholder="Rechercher des rapports..."
            />
          </CardContent>
        </Card>

        {/* View Report Details Dialog */}
        {viewingReport && (
          <Dialog open={!!viewingReport && !showDecisionDialog} onOpenChange={(open) => !open && setViewingReport(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails du rapport de maintenance</DialogTitle>
                <DialogDescription>
                  Rapport pour {viewingReport.resourceType} {viewingReport.resourceInventoryNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ressource</p>
                    <p>{viewingReport.resourceType} {viewingReport.resourceInventoryNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Signalé par</p>
                    <p>{viewingReport.reportedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de signalement</p>
                    <p>{new Date(viewingReport.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Urgence</p>
                    <div className="mt-1">{getUrgencyBadge(viewingReport.urgency)}</div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Description du problème</p>
                  <p className="mt-1">{viewingReport.issue}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <div className="mt-1">{getStatusBadge(viewingReport.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Département</p>
                    <p>{viewingReport.departmentName || "Non spécifié"}</p>
                  </div>
                </div>
                
                {viewingReport.technicianNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes du technicien</p>
                    <p className="mt-1">{viewingReport.technicianNotes}</p>
                  </div>
                )}
                
                {viewingReport.resolution && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Résolution</p>
                    <p className="mt-1">{viewingReport.resolution}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingReport(null)}>
                  Fermer
                </Button>
                {viewingReport.status === "pending" && (
                  <Button 
                    onClick={() => setShowDecisionDialog(true)}
                  >
                    <WrenchIcon className="h-4 w-4 mr-2" />
                    Prendre une décision
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Maintenance Decision Dialog */}
        {viewingReport && (
          <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Décision de maintenance</DialogTitle>
                <DialogDescription>
                  Choisissez une action pour {viewingReport.resourceType} {viewingReport.resourceInventoryNumber}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitDecision)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="decision"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Décision</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="repair_internal" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Réparation interne (par nos techniciens)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="repair_external" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Réparation externe (prestataire)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="return_supplier" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Retour au fournisseur (garantie)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="replace" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Remplacer la ressource
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Notes sur la décision (optionnel)" 
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      Confirmer la décision
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
