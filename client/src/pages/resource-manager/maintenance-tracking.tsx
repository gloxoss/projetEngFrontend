import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MaintenanceReport, Resource } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckCircle, WrenchIcon, AlertTriangle, Eye, ArrowLeftRight, Truck, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable } from "@/components/ui/data-table";

// Schema for maintenance decision form
const maintenanceDecisionSchema = z.object({
  decision: z.enum(["repair", "return", "replace"]),
  notes: z.string().min(1, "Veuillez fournir des détails sur votre décision"),
  returnDate: z.date().optional(),
});

type MaintenanceDecisionValues = z.infer<typeof maintenanceDecisionSchema>;

export default function MaintenanceTracking() {
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

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const form = useForm<MaintenanceDecisionValues>({
    resolver: zodResolver(maintenanceDecisionSchema),
    defaultValues: {
      decision: "repair",
      notes: "",
    },
  });

  const handleViewReport = (report: MaintenanceReport) => {
    setViewingReport(report);
  };

  const handleMakeDecision = (report: MaintenanceReport) => {
    setViewingReport(report);
    setShowDecisionDialog(true);
    form.reset({
      decision: "repair",
      notes: "",
    });
  };

  const onSubmit = (values: MaintenanceDecisionValues) => {
    if (!viewingReport) return;
    
    // This would be implemented to update the maintenance report with the decision
    toast({
      title: "Décision enregistrée",
      description: `Votre décision pour la panne ${viewingReport.id} a été enregistrée.`,
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
            <AlertTriangle className="w-3 h-3" />
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
            Moyenne
          </Badge>
        );
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Haute
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

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "repair":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <WrenchIcon className="w-3 h-3" />
            Réparation
          </Badge>
        );
      case "return":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
            <ArrowLeftRight className="w-3 h-3" />
            Retour fournisseur
          </Badge>
        );
      case "replace":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200">
            <RefreshCw className="w-3 h-3" />
            Remplacement
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {decision}
          </Badge>
        );
    }
  };

  // Mock data for maintenance decisions
  const [maintenanceDecisions, setMaintenanceDecisions] = useState([
    { 
      id: 1, 
      reportId: 1, 
      resourceType: "Ordinateur", 
      inventoryNumber: "ORD-001", 
      decision: "repair", 
      status: "completed", 
      decisionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notes: "Réparation du disque dur défectueux"
    },
    { 
      id: 2, 
      reportId: 3, 
      resourceType: "Imprimante", 
      inventoryNumber: "IMP-002", 
      decision: "return", 
      status: "in_progress", 
      decisionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completionDate: null,
      notes: "Retour au fournisseur pour remplacement sous garantie"
    },
  ]);

  const columns = [
    {
      header: "ID",
      accessor: "id",
      enableSorting: true,
    },
    {
      header: "Ressource",
      accessor: (report: MaintenanceReport) => {
        const resource = resources.find(r => r.id === report.resourceId);
        return resource ? `${resource.resourceType} (${resource.inventoryNumber})` : "Inconnu";
      },
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Date de signalement",
      accessor: (report: MaintenanceReport) => format(new Date(report.createdAt), "dd/MM/yyyy", { locale: fr }),
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
      ],
    },
    {
      name: "Urgence",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "Haute", value: "high", filter: (report: MaintenanceReport) => report.urgency === "high" },
        { label: "Moyenne", value: "medium", filter: (report: MaintenanceReport) => report.urgency === "medium" },
        { label: "Faible", value: "low", filter: (report: MaintenanceReport) => report.urgency === "low" },
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
      showIf: (report: MaintenanceReport) => report.status !== "resolved",
    },
  ];

  return (
    <AppLayout title="Suivi des pannes et retours fournisseurs">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Signalements de pannes</CardTitle>
            <CardDescription>
              Consultez et gérez les signalements de pannes et décidez des actions à prendre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={maintenanceReports}
              columns={columns}
              filters={filters}
              actions={actions}
              searchField={(report) => `${report.description} ${report.id}`}
              searchPlaceholder="Rechercher des signalements..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suivi des décisions de maintenance</CardTitle>
            <CardDescription>
              Suivez l'état des réparations et des retours fournisseurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Décision</TableHead>
                    <TableHead>Date de décision</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de résolution</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceDecisions.map((decision) => (
                    <TableRow key={decision.id}>
                      <TableCell className="font-medium">
                        {decision.resourceType} ({decision.inventoryNumber})
                      </TableCell>
                      <TableCell>{getDecisionBadge(decision.decision)}</TableCell>
                      <TableCell>{format(decision.decisionDate, "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>
                        <Badge variant={decision.status === "completed" ? "success" : "outline"} className="bg-blue-50 text-blue-700 border-blue-200">
                          {decision.status === "completed" ? "Terminé" : "En cours"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {decision.completionDate 
                          ? format(decision.completionDate, "dd/MM/yyyy", { locale: fr })
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{decision.notes}</TableCell>
                    </TableRow>
                  ))}
                  {maintenanceDecisions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune décision de maintenance disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Report Details Dialog */}
        {viewingReport && (
          <Dialog open={!!viewingReport && !showDecisionDialog} onOpenChange={(open) => !open && setViewingReport(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails du signalement</DialogTitle>
                <DialogDescription>
                  Signalement #{viewingReport.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ressource</p>
                    <p>{resources.find(r => r.id === viewingReport.resourceId)?.resourceType} ({resources.find(r => r.id === viewingReport.resourceId)?.inventoryNumber})</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Signalé par</p>
                    <p>{viewingReport.reportedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de signalement</p>
                    <p>{format(new Date(viewingReport.createdAt), "PPP", { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Urgence</p>
                    <div className="mt-1">{getUrgencyBadge(viewingReport.urgency)}</div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-1">{viewingReport.description}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <div className="mt-1">{getStatusBadge(viewingReport.status)}</div>
                </div>
                
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
                {viewingReport.status !== "resolved" && (
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
                  Choisissez une action pour la ressource {resources.find(r => r.id === viewingReport.resourceId)?.resourceType} ({resources.find(r => r.id === viewingReport.resourceId)?.inventoryNumber})
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="decision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Décision</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une décision" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="repair">Réparation interne</SelectItem>
                            <SelectItem value="return">Retour fournisseur</SelectItem>
                            <SelectItem value="replace">Remplacement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("decision") === "return" && (
                    <FormField
                      control={form.control}
                      name="returnDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date de retour prévue</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: fr })
                                  ) : (
                                    <span>Sélectionner une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date()
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Détails sur la décision..." 
                            className="min-h-[100px]" 
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
