import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
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
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  Eye, 
  Edit, 
  Trash2, 
  WrenchIcon, 
  AlertTriangle,
  History,
  Plus
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema for resource form
const resourceFormSchema = z.object({
  resourceType: z.string().min(1, "Veuillez sélectionner un type de ressource"),
  inventoryNumber: z.string().min(1, "Le numéro d'inventaire est requis"),
  specifications: z.string().optional(),
  status: z.enum(["functional", "maintenance", "out_of_order"]),
  location: z.string().optional(),
  assignedTo: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export default function ResourcesManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      resourceType: "",
      inventoryNumber: "",
      specifications: "",
      status: "functional",
      location: "",
      assignedTo: "",
    },
  });

  const handleViewResource = (resource: Resource) => {
    setViewingResource(resource);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    form.reset({
      resourceType: resource.resourceType,
      inventoryNumber: resource.inventoryNumber,
      specifications: resource.specifications || "",
      status: resource.status as "functional" | "maintenance" | "out_of_order",
      location: resource.location || "",
      assignedTo: resource.assignedTo || "",
    });
  };

  const handleDeleteResource = () => {
    if (!viewingResource) return;
    
    // This would be implemented to delete a resource
    toast({
      title: "Ressource supprimée",
      description: `La ressource ${viewingResource.resourceType} ${viewingResource.inventoryNumber} a été supprimée.`,
      variant: "default",
    });
    
    setShowDeleteDialog(false);
    setViewingResource(null);
  };

  const onSubmit = (values: ResourceFormValues) => {
    if (editingResource) {
      // This would be implemented to update a resource
      toast({
        title: "Ressource mise à jour",
        description: `La ressource ${values.resourceType} ${values.inventoryNumber} a été mise à jour.`,
        variant: "default",
      });
      
      setEditingResource(null);
    } else {
      // This would be implemented to create a new resource
      toast({
        title: "Ressource créée",
        description: `La ressource ${values.resourceType} ${values.inventoryNumber} a été créée.`,
        variant: "default",
      });
      
      setIsCreating(false);
    }
    
    form.reset();
  };

  const handleCreateResource = () => {
    setIsCreating(true);
    form.reset({
      resourceType: "",
      inventoryNumber: "",
      specifications: "",
      status: "functional",
      location: "",
      assignedTo: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "functional":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            En fonction
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <WrenchIcon className="w-3 h-3" />
            Maintenance
          </Badge>
        );
      case "out_of_order":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3" />
            Hors service
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

  // Mock resource history data
  const resourceHistory = [
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), action: "Création", user: "Jean Dupont", details: "Ressource ajoutée à l'inventaire" },
    { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), action: "Affectation", user: "Marie Martin", details: "Affectée au département Informatique" },
    { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), action: "Maintenance", user: "Pierre Durand", details: "Envoyée en maintenance pour réparation" },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), action: "Retour", user: "Pierre Durand", details: "Retour de maintenance, problème résolu" },
  ];

  const columns = [
    {
      header: "Type",
      accessor: "resourceType",
      enableSorting: true,
    },
    {
      header: "N° Inventaire",
      accessor: "inventoryNumber",
      enableSorting: true,
    },
    {
      header: "Spécifications",
      accessor: "specifications",
    },
    {
      header: "Statut",
      accessor: (resource: Resource) => getStatusBadge(resource.status),
    },
    {
      header: "Emplacement",
      accessor: "location",
    },
    {
      header: "Affecté à",
      accessor: "assignedTo",
    },
  ];

  const filters = [
    {
      name: "Type de ressource",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "Ordinateur", value: "Ordinateur", filter: (resource: Resource) => resource.resourceType === "Ordinateur" },
        { label: "Imprimante", value: "Imprimante", filter: (resource: Resource) => resource.resourceType === "Imprimante" },
        { label: "Scanner", value: "Scanner", filter: (resource: Resource) => resource.resourceType === "Scanner" },
        { label: "Projecteur", value: "Projecteur", filter: (resource: Resource) => resource.resourceType === "Projecteur" },
      ],
    },
    {
      name: "Statut",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "En fonction", value: "functional", filter: (resource: Resource) => resource.status === "functional" },
        { label: "Maintenance", value: "maintenance", filter: (resource: Resource) => resource.status === "maintenance" },
        { label: "Hors service", value: "out_of_order", filter: (resource: Resource) => resource.status === "out_of_order" },
      ],
    },
  ];

  const actions = [
    {
      label: "Voir détails",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewResource,
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditResource,
    },
    {
      label: "Historique",
      icon: <History className="h-4 w-4" />,
      onClick: (resource: Resource) => {
        setViewingResource(resource);
        setShowHistoryDialog(true);
      },
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (resource: Resource) => {
        setViewingResource(resource);
        setShowDeleteDialog(true);
      },
    },
  ];

  return (
    <AppLayout title="Gestion des ressources">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Ressources</h2>
          <Button onClick={handleCreateResource}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ressource
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventaire des ressources</CardTitle>
            <CardDescription>
              Consultez et gérez toutes les ressources de l'établissement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={resources}
              columns={columns}
              filters={filters}
              actions={actions}
              searchField={(resource) => `${resource.resourceType} ${resource.inventoryNumber} ${resource.specifications || ""} ${resource.location || ""} ${resource.assignedTo || ""}`}
              searchPlaceholder="Rechercher des ressources..."
            />
          </CardContent>
        </Card>

        {/* View Resource Details Dialog */}
        {viewingResource && (
          <Dialog open={!!viewingResource && !showDeleteDialog && !showHistoryDialog} onOpenChange={(open) => !open && setViewingResource(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails de la ressource</DialogTitle>
                <DialogDescription>
                  Informations sur {viewingResource.resourceType} {viewingResource.inventoryNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type de ressource</p>
                    <p>{viewingResource.resourceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Numéro d'inventaire</p>
                    <p>{viewingResource.inventoryNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <div className="mt-1">{getStatusBadge(viewingResource.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date d'acquisition</p>
                    <p>{new Date(viewingResource.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Spécifications</p>
                  <p className="mt-1">{viewingResource.specifications || "Aucune spécification"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Emplacement</p>
                    <p>{viewingResource.location || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Affecté à</p>
                    <p>{viewingResource.assignedTo || "Non affecté"}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingResource(null)}>
                  Fermer
                </Button>
                <Button 
                  variant="outline" 
                  className="text-blue-600"
                  onClick={() => {
                    setShowHistoryDialog(true);
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  Voir l'historique
                </Button>
                <Button 
                  onClick={() => {
                    setViewingResource(null);
                    handleEditResource(viewingResource);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Resource History Dialog */}
        {viewingResource && (
          <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Historique de la ressource</DialogTitle>
                <DialogDescription>
                  {viewingResource.resourceType} {viewingResource.inventoryNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <ul className="space-y-4">
                    {resourceHistory.map((event, index) => (
                      <li key={index} className="relative pl-10">
                        <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-primary-50 border-2 border-primary flex items-center justify-center">
                          {event.action === "Création" && <Plus className="h-4 w-4 text-primary" />}
                          {event.action === "Affectation" && <CheckCircle className="h-4 w-4 text-primary" />}
                          {event.action === "Maintenance" && <WrenchIcon className="h-4 w-4 text-primary" />}
                          {event.action === "Retour" && <CheckCircle className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{event.action}</p>
                            <p className="text-sm text-gray-500">{event.date.toLocaleDateString("fr-FR")}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                          <p className="text-xs text-gray-500 mt-2">Par {event.user}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Resource Dialog */}
        {viewingResource && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette ressource</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous êtes sur le point de supprimer la ressource {viewingResource.resourceType} {viewingResource.inventoryNumber}.
                  <br /><br />
                  Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteResource} className="bg-red-600 hover:bg-red-700">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Create/Edit Resource Dialog */}
        <Dialog open={isCreating || !!editingResource} onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingResource(null);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingResource ? "Modifier la ressource" : "Ajouter une ressource"}</DialogTitle>
              <DialogDescription>
                {editingResource 
                  ? `Modification de ${editingResource.resourceType} ${editingResource.inventoryNumber}`
                  : "Remplissez les informations pour ajouter une nouvelle ressource"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="resourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de ressource</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ordinateur">Ordinateur</SelectItem>
                            <SelectItem value="Imprimante">Imprimante</SelectItem>
                            <SelectItem value="Scanner">Scanner</SelectItem>
                            <SelectItem value="Projecteur">Projecteur</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inventoryNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro d'inventaire</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: INV-2023-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spécifications</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Détails techniques de la ressource..." 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="functional">En fonction</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="out_of_order">Hors service</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emplacement</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Salle 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affecté à</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Département Informatique" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreating(false);
                    setEditingResource(null);
                  }}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingResource ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
