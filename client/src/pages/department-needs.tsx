import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ResourceNeed } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";

import { 
  Loader2, 
  Edit, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Send,
  ClipboardCheck
} from "lucide-react";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define the schema for the resource need edit form
const editNeedSchema = z.object({
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  specifications: z.string().optional(),
  comments: z.string().optional(),
});

type EditNeedFormValues = z.infer<typeof editNeedSchema>;

export default function DepartmentNeeds() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [viewingNeed, setViewingNeed] = useState<ResourceNeed | null>(null);
  const [editingNeed, setEditingNeed] = useState<ResourceNeed | null>(null);
  const [selectedNeeds, setSelectedNeeds] = useState<ResourceNeed[]>([]);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);

  const form = useForm<EditNeedFormValues>({
    resolver: zodResolver(editNeedSchema),
    defaultValues: {
      quantity: 1,
      specifications: "",
      comments: "",
    },
  });

  // Only department heads should access this page
  if (user?.role !== "department_head") {
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

  const validateMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await apiRequest("POST", "/api/resource-needs/validate", { ids });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-needs"] });
      setSelectedNeeds([]);
      toast({
        title: "Besoins validés",
        description: "Les besoins sélectionnés ont été validés avec succès.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de valider les besoins: ${error.message}`,
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
      form.reset();
      toast({
        title: "Besoin mis à jour",
        description: "Le besoin a été mis à jour avec succès.",
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

  const sendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/resource-needs/send", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-needs"] });
      setShowSendConfirmation(false);
      toast({
        title: "Besoins envoyés",
        description: "Les besoins validés ont été envoyés au responsable des ressources.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer les besoins: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleView = (need: ResourceNeed) => {
    setViewingNeed(need);
  };

  const handleEdit = (need: ResourceNeed) => {
    setEditingNeed(need);
    form.reset({
      quantity: need.quantity,
      specifications: need.specifications || "",
      comments: need.comments || "",
    });
  };

  const handleValidate = (need: ResourceNeed) => {
    validateMutation.mutate([need.id]);
  };

  const handleValidateSelected = () => {
    if (selectedNeeds.length === 0) {
      toast({
        title: "Aucun besoin sélectionné",
        description: "Veuillez sélectionner au moins un besoin à valider.",
        variant: "default",
      });
      return;
    }
    
    const pendingNeedIds = selectedNeeds
      .filter(need => need.status === "pending")
      .map(need => need.id);
      
    if (pendingNeedIds.length === 0) {
      toast({
        title: "Aucun besoin en attente",
        description: "Tous les besoins sélectionnés sont déjà validés ou rejetés.",
        variant: "default",
      });
      return;
    }
    
    validateMutation.mutate(pendingNeedIds);
  };

  const handleSendToResponsible = () => {
    setShowSendConfirmation(true);
  };

  const confirmSend = () => {
    sendMutation.mutate();
  };

  const onSubmitEdit = (values: EditNeedFormValues) => {
    if (editingNeed) {
      updateMutation.mutate({
        id: editingNeed.id,
        resourceNeed: values,
      });
    }
  };

  const handleSelectionChange = (needs: ResourceNeed[]) => {
    setSelectedNeeds(needs);
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

  // Get all users who submitted needs to create the filter options
  const teachers = Array.from(new Set(resourceNeeds.map(need => need.userId)))
    .filter(Boolean)
    .map(userId => {
      const need = resourceNeeds.find(need => need.userId === userId);
      return { userId, fullName: need?.userName || `Enseignant ${userId}` };
    });

  const columns = [
    {
      header: "Enseignant",
      accessor: (need: ResourceNeed) => need.userName || `Enseignant ${need.userId}`,
      enableSorting: true,
    },
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
      header: "Date",
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
      name: "Enseignant",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        ...teachers.map(teacher => ({
          label: teacher.fullName,
          value: teacher.userId.toString(),
          filter: (need: ResourceNeed) => need.userId === teacher.userId,
        })),
      ],
    },
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
      label: "Voir détails",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      isDisabled: (need: ResourceNeed) => need.status !== "pending",
    },
    {
      label: "Valider",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleValidate,
      isDisabled: (need: ResourceNeed) => need.status !== "pending",
    },
  ];

  // Count validated needs to enable/disable the send button
  const validatedNeeds = resourceNeeds.filter(need => need.status === "validated").length;

  return (
    <AppLayout title="Consultation des besoins du département">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-800">Besoins soumis par les enseignants</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleValidateSelected}
              disabled={validateMutation.isPending || selectedNeeds.length === 0}
              className="flex items-center gap-2"
            >
              {validateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )}
              Valider la sélection
            </Button>
            <Button
              onClick={handleSendToResponsible}
              disabled={sendMutation.isPending || validatedNeeds === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Envoyer au responsable
            </Button>
          </div>
        </div>

        <DataTable
          data={resourceNeeds}
          columns={columns}
          filters={filters}
          actions={actions}
          searchField={(need) => `${need.resourceType} ${need.specifications || ""}`}
          searchPlaceholder="Rechercher des besoins..."
          selectable
          onSelectionChange={handleSelectionChange}
        />

        {/* View Need Dialog */}
        <Dialog open={viewingNeed !== null} onOpenChange={() => setViewingNeed(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails du besoin</DialogTitle>
              <DialogDescription>
                Soumis le {viewingNeed && new Date(viewingNeed.createdAt).toLocaleDateString("fr-FR")}
              </DialogDescription>
            </DialogHeader>
            {viewingNeed && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Enseignant</h4>
                    <p>{viewingNeed.userName || `Enseignant ${viewingNeed.userId}`}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                    <div className="mt-1">{getStatusBadge(viewingNeed.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Type</h4>
                    <p>{viewingNeed.resourceType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Quantité</h4>
                    <p>{viewingNeed.quantity}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Spécifications</h4>
                  <p className="mt-1 text-sm">{viewingNeed.specifications || "Aucune spécification"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Commentaires</h4>
                  <p className="mt-1 text-sm">{viewingNeed.comments || "Aucun commentaire"}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingNeed(null)}>Fermer</Button>
              {viewingNeed && viewingNeed.status === "pending" && (
                <Button onClick={() => {
                  handleValidate(viewingNeed);
                  setViewingNeed(null);
                }}>
                  Valider
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Need Dialog */}
        <Dialog open={editingNeed !== null} onOpenChange={() => setEditingNeed(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le besoin</DialogTitle>
              <DialogDescription>
                Vous pouvez modifier les détails du besoin avant de le valider.
              </DialogDescription>
            </DialogHeader>
            {editingNeed && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Type</h4>
                      <p>{editingNeed.resourceType}</p>
                    </div>
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
                          <Textarea {...field} />
                        </FormControl>
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setEditingNeed(null)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mise à jour...
                        </>
                      ) : (
                        "Mettre à jour"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <AlertDialog open={showSendConfirmation} onOpenChange={setShowSendConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Envoyer les besoins au responsable</AlertDialogTitle>
              <AlertDialogDescription>
                Vous êtes sur le point d'envoyer tous les besoins validés au responsable des ressources.
                Cette action est définitive et les besoins ne pourront plus être modifiés après envoi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSend}>
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Envoyer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
