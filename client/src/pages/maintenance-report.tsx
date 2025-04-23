import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Resource, MaintenanceReport, insertMaintenanceReportSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Extended schema for the maintenance report form
const maintenanceReportFormSchema = z.object({
  resourceId: z.coerce.number({
    required_error: "Veuillez sélectionner une ressource",
  }),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  occurrenceDate: z.date({
    required_error: "Veuillez sélectionner la date de l'incident",
  }),
  urgency: z.string({
    required_error: "Veuillez sélectionner un niveau d'urgence",
  }),
});

type MaintenanceReportFormValues = z.infer<typeof maintenanceReportFormSchema>;

export default function MaintenanceReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [viewingReport, setViewingReport] = useState<MaintenanceReport | null>(null);
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const resourceIdParam = searchParams.get("resourceId");

  // This page is for teachers and department heads only
  const isAllowed = user?.role === "teacher" || user?.role === "department_head";
  
  if (!isAllowed) {
    toast({
      title: "Accès refusé",
      description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
      variant: "destructive",
    });
    navigate("/dashboard");
    return null;
  }

  const form = useForm<MaintenanceReportFormValues>({
    resolver: zodResolver(maintenanceReportFormSchema),
    defaultValues: {
      resourceId: resourceIdParam ? parseInt(resourceIdParam) : undefined,
      description: "",
      occurrenceDate: new Date(),
      urgency: "medium",
    },
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources/assigned"],
  });

  const { data: maintenanceReports = [] } = useQuery<MaintenanceReport[]>({
    queryKey: ["/api/maintenance-reports"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: MaintenanceReportFormValues) => {
      const response = await apiRequest("POST", "/api/maintenance-reports", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources/assigned"] });
      form.reset({
        resourceId: undefined,
        description: "",
        occurrenceDate: new Date(),
        urgency: "medium",
      });
      toast({
        title: "Panne signalée",
        description: "Votre signalement a été enregistré avec succès.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de signaler la panne: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: MaintenanceReportFormValues) => {
    createMutation.mutate(values);
  };

  const handleView = (report: MaintenanceReport) => {
    setViewingReport(report);
  };

  // Get functional resources only for the dropdown
  const functionalResources = resources.filter(resource => resource.status === "functional");

  // Get resource name by ID
  const getResourceById = (id: number) => {
    const resource = resources.find(r => r.id === id);
    return resource ? `${resource.resourceType} - ${resource.inventoryNumber}` : `Ressource #${id}`;
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "Faible - Peut attendre";
      case "medium":
        return "Moyen - À traiter cette semaine";
      case "high":
        return "Élevé - Besoin urgent";
      case "critical":
        return "Critique - Bloque le travail";
      default:
        return urgency;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            En attente
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            En cours
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
      accessor: (report: MaintenanceReport) => getResourceById(report.resourceId),
      enableSorting: true,
    },
    {
      header: "Description",
      accessor: (report: MaintenanceReport) => (
        <div className="max-w-xs truncate">
          {report.description}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (report: MaintenanceReport) => format(new Date(report.occurrenceDate), "dd/MM/yyyy"),
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
      onClick: handleView,
    },
  ];

  // If a resourceId is provided in the URL, select that resource automatically
  useEffect(() => {
    if (resourceIdParam && resources.length > 0) {
      const resourceId = parseInt(resourceIdParam);
      const resource = resources.find(r => r.id === resourceId);
      
      if (resource) {
        form.setValue("resourceId", resourceId);
      } else {
        toast({
          title: "Ressource introuvable",
          description: "La ressource spécifiée n'a pas été trouvée ou n'est pas disponible.",
          variant: "destructive",
        });
      }
    }
  }, [resourceIdParam, resources, form, toast]);

  return (
    <AppLayout title="Signalement de panne">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Signaler une panne</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="resourceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ressource concernée</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une ressource" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {functionalResources.length === 0 ? (
                              <SelectItem value="none" disabled>
                                Aucune ressource disponible
                              </SelectItem>
                            ) : (
                              functionalResources.map((resource) => (
                                <SelectItem key={resource.id} value={resource.id.toString()}>
                                  {resource.resourceType} - {resource.inventoryNumber}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Sélectionnez la ressource qui présente un problème
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occurrenceDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de l'incident</FormLabel>
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
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Quand le problème est-il apparu ?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description du problème</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez le problème en détail..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Veuillez détailler le problème rencontré et les circonstances
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau d'urgence</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le niveau d'urgence" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Faible - Peut attendre</SelectItem>
                          <SelectItem value="medium">Moyen - À traiter cette semaine</SelectItem>
                          <SelectItem value="high">Élevé - Besoin urgent</SelectItem>
                          <SelectItem value="critical">Critique - Bloque le travail</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Comment ce problème impact-t-il votre travail ?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || functionalResources.length === 0}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signalement...
                      </>
                    ) : (
                      "Signaler la panne"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Pannes précédemment signalées</h2>
          <DataTable
            data={maintenanceReports}
            columns={columns}
            filters={filters}
            actions={actions}
            searchField={(report) => `${getResourceById(report.resourceId)} ${report.description}`}
            searchPlaceholder="Rechercher des signalements..."
          />
        </div>

        {/* View Report Dialog */}
        <Dialog open={viewingReport !== null} onOpenChange={() => setViewingReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails du signalement</DialogTitle>
              <DialogDescription>
                {viewingReport && `Signalé le ${format(new Date(viewingReport.createdAt), "PPP", { locale: fr })}`}
              </DialogDescription>
            </DialogHeader>
            {viewingReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Ressource</h4>
                    <p>{getResourceById(viewingReport.resourceId)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                    <div className="mt-1">{getStatusBadge(viewingReport.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date de l'incident</h4>
                    <p>{format(new Date(viewingReport.occurrenceDate), "PPP", { locale: fr })}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Urgence</h4>
                    <div className="mt-1">{getUrgencyBadge(viewingReport.urgency)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{viewingReport.description}</p>
                </div>
                {viewingReport.assignedToId && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Technicien assigné</h4>
                    <p className="mt-1 text-sm">Technicien #{viewingReport.assignedToId}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingReport(null)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
