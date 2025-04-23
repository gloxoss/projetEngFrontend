import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ResourceNeed, insertResourceNeedSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

import { 
  Loader2, 
  Edit, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle 
} from "lucide-react";
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

// Extended schema for the resource need form
const resourceNeedFormSchema = insertResourceNeedSchema.extend({
  resourceType: z.string().min(1, "Veuillez sélectionner un type de ressource"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  specifications: z.string().optional(),
  comments: z.string().optional(),
});

type ResourceNeedFormValues = z.infer<typeof resourceNeedFormSchema>;

export default function ResourceNeeds() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingNeed, setEditingNeed] = useState<ResourceNeed | null>(null);
  const [needToDelete, setNeedToDelete] = useState<ResourceNeed | null>(null);

  const form = useForm<ResourceNeedFormValues>({
    resolver: zodResolver(resourceNeedFormSchema),
    defaultValues: {
      resourceType: "",
      quantity: 1,
      specifications: "",
      comments: "",
    },
  });

  const { data: resourceNeeds = [] } = useQuery<ResourceNeed[]>({
    queryKey: ["/api/resource-needs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ResourceNeedFormValues) => {
      const response = await apiRequest("POST", "/api/resource-needs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-needs"] });
      form.reset({
        resourceType: "",
        quantity: 1,
        specifications: "",
        comments: "",
      });
      toast({
        title: "Besoin créé",
        description: "Votre besoin a été soumis avec succès.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le besoin: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; resourceNeed: Partial<ResourceNeed> }) => {
      const response = await apiRequest("PUT", `/api/resource-needs/${data.id}`, data.resourceNeed);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-needs"] });
      setEditingNeed(null);
      form.reset({
        resourceType: "",
        quantity: 1,
        specifications: "",
        comments: "",
      });
      toast({
        title: "Besoin mis à jour",
        description: "Votre besoin a été mis à jour avec succès.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le besoin: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/resource-needs/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-needs"] });
      setNeedToDelete(null);
      toast({
        title: "Besoin supprimé",
        description: "Le besoin a été supprimé avec succès.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le besoin: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ResourceNeedFormValues) => {
    if (editingNeed) {
      updateMutation.mutate({
        id: editingNeed.id,
        resourceNeed: values,
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (need: ResourceNeed) => {
    setEditingNeed(need);
    form.reset({
      resourceType: need.resourceType,
      quantity: need.quantity,
      specifications: need.specifications || "",
      comments: need.comments || "",
    });
  };

  const handleDelete = (need: ResourceNeed) => {
    setNeedToDelete(need);
  };

  const confirmDelete = () => {
    if (needToDelete) {
      deleteMutation.mutate(needToDelete.id);
    }
  };

  const handleResetForm = () => {
    setEditingNeed(null);
    form.reset({
      resourceType: "",
      quantity: 1,
      specifications: "",
      comments: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="w-3 h-3" />
            En attente
          </Badge>
        );
      case "validated":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Validé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3" />
            Rejeté
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
            <CheckCircle className="w-3 h-3" />
            Envoyé
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

  const columns = [
    {
      header: "Type",
      accessor: "resourceType",
      enableSorting: true,
    },
    {
      header: "Quantité",
      accessor: "quantity",
      enableSorting: true,
    },
    {
      header: "Spécifications",
      accessor: "specifications",
    },
    {
      header: "Date de soumission",
      accessor: (need: ResourceNeed) => new Date(need.createdAt).toLocaleDateString("fr-FR"),
      enableSorting: true,
    },
    {
      header: "Statut",
      accessor: (need: ResourceNeed) => getStatusBadge(need.status),
    },
  ];

  const filters = [
    {
      name: "Statut",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "En attente", value: "pending", filter: (need: ResourceNeed) => need.status === "pending" },
        { label: "Validé", value: "validated", filter: (need: ResourceNeed) => need.status === "validated" },
        { label: "Rejeté", value: "rejected", filter: (need: ResourceNeed) => need.status === "rejected" },
        { label: "Envoyé", value: "sent", filter: (need: ResourceNeed) => need.status === "sent" },
      ],
    },
    {
      name: "Type",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "Ordinateur", value: "Ordinateur", filter: (need: ResourceNeed) => need.resourceType === "Ordinateur" },
        { label: "Imprimante", value: "Imprimante", filter: (need: ResourceNeed) => need.resourceType === "Imprimante" },
        { label: "Scanner", value: "Scanner", filter: (need: ResourceNeed) => need.resourceType === "Scanner" },
        { label: "Projecteur", value: "Projecteur", filter: (need: ResourceNeed) => need.resourceType === "Projecteur" },
      ],
    },
  ];

  const actions = [
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      isDisabled: (need: ResourceNeed) => need.status !== "pending",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      isDisabled: (need: ResourceNeed) => need.status !== "pending" && need.status !== "rejected",
    },
    {
      label: "Soumettre à nouveau",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleEdit,
      isDisabled: (need: ResourceNeed) => need.status !== "rejected",
    },
  ];

  return (
    <AppLayout title="Saisie des besoins en ressources">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNeed ? "Modifier un besoin" : "Formulaire de saisie des besoins"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
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
                          placeholder="Ex: CPU, RAM, espace disque, etc."
                          className="h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Détaillez les caractéristiques techniques souhaitées
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaires</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informations supplémentaires..."
                          className="h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetForm}
                  >
                    {editingNeed ? "Annuler" : "Réinitialiser"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingNeed ? "Mise à jour..." : "Soumission..."}
                      </>
                    ) : (
                      <>{editingNeed ? "Mettre à jour" : "Soumettre"}</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Besoins précédemment soumis</h2>
          <DataTable
            data={resourceNeeds}
            columns={columns}
            filters={filters}
            actions={actions}
            searchField={(need) => `${need.resourceType} ${need.specifications || ""}`}
            searchPlaceholder="Rechercher des besoins..."
          />
        </div>

        <AlertDialog open={needToDelete !== null} onOpenChange={() => setNeedToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le besoin sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
