import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ResourceNeed } from "@shared/schema";
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
  ShoppingBag, 
  Package, 
  Merge, 
  Edit, 
  AlertTriangle 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function DepartmentNeedsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [selectedNeeds, setSelectedNeeds] = useState<ResourceNeed[]>([]);
  const [viewingNeed, setViewingNeed] = useState<ResourceNeed | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showCallForOffersDialog, setShowCallForOffersDialog] = useState(false);

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

  const { data: resourceNeeds = [], isLoading } = useQuery<ResourceNeed[]>({
    queryKey: ["/api/resource-needs"],
  });

  // Filter needs that are validated or sent
  const validatedNeeds = resourceNeeds.filter(
    need => need.status === "validated" || need.status === "sent"
  );

  const handleViewNeed = (need: ResourceNeed) => {
    setViewingNeed(need);
  };

  const handleMergeNeeds = () => {
    // This would be implemented to merge similar needs
    toast({
      title: "Besoins fusionnés",
      description: `${selectedNeeds.length} besoins ont été fusionnés avec succès.`,
      variant: "default",
    });
    setShowMergeDialog(false);
    setSelectedNeeds([]);
  };

  const handleCreateCallForOffers = () => {
    // This would be implemented to create a call for offers
    toast({
      title: "Appel d'offres créé",
      description: `Un nouvel appel d'offres a été créé pour ${selectedNeeds.length} besoins.`,
      variant: "default",
    });
    setShowCallForOffersDialog(false);
    navigate("/resource-manager/calls-for-offers");
  };

  const columns = [
    {
      header: "Département",
      accessor: (need: ResourceNeed) => need.departmentName || "Informatique",
      enableSorting: true,
    },
    {
      header: "Type de ressource",
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
      header: "Date de demande",
      accessor: (need: ResourceNeed) => new Date(need.createdAt).toLocaleDateString("fr-FR"),
      enableSorting: true,
    },
    {
      header: "Statut",
      accessor: (need: ResourceNeed) => {
        switch (need.status) {
          case "validated":
            return (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Validé
              </Badge>
            );
          case "sent":
            return (
              <Badge variant="warning" className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                Envoyé
              </Badge>
            );
          default:
            return (
              <Badge variant="outline">
                {need.status}
              </Badge>
            );
        }
      },
    },
  ];

  const filters = [
    {
      name: "Département",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "Informatique", value: "Informatique", filter: (need: ResourceNeed) => need.departmentName === "Informatique" || !need.departmentName },
      ],
    },
    {
      name: "Type de ressource",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "Ordinateur", value: "Ordinateur", filter: (need: ResourceNeed) => need.resourceType === "Ordinateur" },
        { label: "Imprimante", value: "Imprimante", filter: (need: ResourceNeed) => need.resourceType === "Imprimante" },
        { label: "Scanner", value: "Scanner", filter: (need: ResourceNeed) => need.resourceType === "Scanner" },
        { label: "Projecteur", value: "Projecteur", filter: (need: ResourceNeed) => need.resourceType === "Projecteur" },
      ],
    },
    {
      name: "Statut",
      options: [
        { label: "Tous", value: "all", filter: () => true },
        { label: "Validé", value: "validated", filter: (need: ResourceNeed) => need.status === "validated" },
        { label: "Envoyé", value: "sent", filter: (need: ResourceNeed) => need.status === "sent" },
      ],
    },
  ];

  const actions = [
    {
      label: "Voir détails",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewNeed,
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: (need: ResourceNeed) => {
        toast({
          title: "Fonctionnalité à venir",
          description: "La modification des besoins sera disponible prochainement.",
          variant: "default",
        });
      },
    },
  ];

  return (
    <AppLayout title="Gestion des besoins des départements">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Besoins des départements</CardTitle>
            <CardDescription>
              Consultez et gérez les besoins validés par les chefs de département
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedNeeds.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center justify-between">
                <div>
                  <span className="font-medium">{selectedNeeds.length} besoins sélectionnés</span>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Merge className="h-4 w-4" />
                        Fusionner
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Fusionner les besoins</DialogTitle>
                        <DialogDescription>
                          Vous êtes sur le point de fusionner {selectedNeeds.length} besoins similaires.
                          Cette action regroupera les besoins de même type pour faciliter la création d'appels d'offres.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <h4 className="font-medium mb-2">Besoins sélectionnés :</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedNeeds.map(need => (
                            <li key={need.id}>
                              {need.resourceType} - Quantité: {need.quantity} - Département: {need.departmentName || "Informatique"}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMergeDialog(false)}>Annuler</Button>
                        <Button onClick={handleMergeNeeds}>Confirmer la fusion</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showCallForOffersDialog} onOpenChange={setShowCallForOffersDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4" />
                        Créer un appel d'offres
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un appel d'offres</DialogTitle>
                        <DialogDescription>
                          Vous êtes sur le point de créer un appel d'offres pour {selectedNeeds.length} besoins.
                          Les fournisseurs pourront soumettre leurs offres pour ces ressources.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <h4 className="font-medium mb-2">Besoins inclus dans l'appel d'offres :</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedNeeds.map(need => (
                            <li key={need.id}>
                              {need.resourceType} - Quantité: {need.quantity} - Département: {need.departmentName || "Informatique"}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCallForOffersDialog(false)}>Annuler</Button>
                        <Button onClick={handleCreateCallForOffers}>Créer l'appel d'offres</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            <DataTable
              data={validatedNeeds}
              columns={columns}
              filters={filters}
              actions={actions}
              searchField={(need) => `${need.resourceType} ${need.specifications || ""} ${need.departmentName || "Informatique"}`}
              searchPlaceholder="Rechercher des besoins..."
              selectable={true}
              onSelectionChange={setSelectedNeeds}
            />
          </CardContent>
        </Card>

        {/* View Need Details Dialog */}
        {viewingNeed && (
          <Dialog open={!!viewingNeed} onOpenChange={(open) => !open && setViewingNeed(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails du besoin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Département</p>
                    <p>{viewingNeed.departmentName || "Informatique"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type de ressource</p>
                    <p>{viewingNeed.resourceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantité</p>
                    <p>{viewingNeed.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <Badge 
                      variant={
                        viewingNeed.status === "validated" 
                          ? "success" 
                          : viewingNeed.status === "sent" 
                          ? "warning" 
                          : "default"
                      }
                      className="mt-1"
                    >
                      {viewingNeed.status === "validated" && "Validé"}
                      {viewingNeed.status === "sent" && "Envoyé"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Spécifications</p>
                  <p className="mt-1">{viewingNeed.specifications || "Aucune spécification fournie"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Commentaires</p>
                  <p className="mt-1">{viewingNeed.comments || "Aucun commentaire"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de création</p>
                  <p>{new Date(viewingNeed.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingNeed(null)}>Fermer</Button>
                <Button onClick={() => {
                  setViewingNeed(null);
                  setSelectedNeeds([viewingNeed]);
                  setShowCallForOffersDialog(true);
                }}>
                  Créer un appel d'offres
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
