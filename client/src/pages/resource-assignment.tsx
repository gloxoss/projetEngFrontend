import AppLayout from "@/layouts/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { 
  CheckCircle, 
  WrenchIcon, 
  AlertTriangle, 
  Eye,
  Calendar
} from "lucide-react";

export default function ResourceAssignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);

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

  const { data: departmentResources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: assignedResources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources/assigned"],
  });

  // All resources to display (department resources for heads, assigned resources for teachers)
  const resources = user?.role === "department_head" ? departmentResources : assignedResources;

  const handleView = (resource: Resource) => {
    setViewingResource(resource);
  };

  const handleReportIssue = (resource: Resource) => {
    navigate("/maintenance-report?resourceId=" + resource.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "functional":
        return (
          <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3" />
            En fonction
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <WrenchIcon className="w-3 h-3" />
            Maintenance
          </Badge>
        );
      case "out_of_order":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
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

  const columns = [
    {
      header: "Ressource",
      accessor: (resource: Resource) => `${resource.resourceType} ${resource.inventoryNumber}`,
      enableSorting: true,
    },
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
      header: "Date d'affectation",
      accessor: (resource: Resource) => new Date(resource.createdAt).toLocaleDateString("fr-FR"),
      enableSorting: true,
    },
    {
      header: "Statut",
      accessor: (resource: Resource) => getStatusBadge(resource.status),
    },
  ];

  const filters = [
    {
      name: "Type de ressource",
      options: [
        { label: "Tous les types", value: "all", filter: () => true },
        { label: "Ordinateur", value: "Ordinateur", filter: (resource: Resource) => resource.resourceType === "Ordinateur" },
        { label: "Imprimante", value: "Imprimante", filter: (resource: Resource) => resource.resourceType === "Imprimante" },
        { label: "Scanner", value: "Scanner", filter: (resource: Resource) => resource.resourceType === "Scanner" },
        { label: "Projecteur", value: "Projecteur", filter: (resource: Resource) => resource.resourceType === "Projecteur" },
      ],
    },
    {
      name: "Statut",
      options: [
        { label: "Tous les statuts", value: "all", filter: () => true },
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
      onClick: handleView,
    },
    {
      label: "Signaler une panne",
      icon: <WrenchIcon className="h-4 w-4" />,
      onClick: handleReportIssue,
      isDisabled: (resource: Resource) => resource.status !== "functional",
    },
  ];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AppLayout title="Consultation des affectations de ressources">
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          {user?.role === "department_head" 
            ? "Ressources du département" 
            : "Ressources qui vous sont affectées"
          }
        </h2>

        <DataTable
          data={resources}
          columns={columns}
          filters={filters}
          actions={actions}
          searchField={(resource) => `${resource.resourceType} ${resource.inventoryNumber} ${resource.specifications || ""}`}
          searchPlaceholder="Rechercher des ressources..."
        />

        {/* Resource Details Dialog */}
        <Dialog open={viewingResource !== null} onOpenChange={() => setViewingResource(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la ressource</DialogTitle>
              <DialogDescription>
                {viewingResource && `${viewingResource.resourceType} - ${viewingResource.inventoryNumber}`}
              </DialogDescription>
            </DialogHeader>
            {viewingResource && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Type</h4>
                    <p>{viewingResource.resourceType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">N° Inventaire</h4>
                    <p>{viewingResource.inventoryNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date d'acquisition</h4>
                    <p>{formatDate(viewingResource.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                    <div className="mt-1">{getStatusBadge(viewingResource.status)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Spécifications</h4>
                  <p className="mt-1 text-sm">{viewingResource.specifications || "Aucune spécification"}</p>
                </div>
                {viewingResource.assignedToId && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Assigné à</h4>
                    <p className="mt-1 text-sm">Utilisateur #{viewingResource.assignedToId}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setViewingResource(null)}>
                Fermer
              </Button>
              {viewingResource && viewingResource.status === "functional" && (
                <Button 
                  onClick={() => {
                    handleReportIssue(viewingResource);
                    setViewingResource(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <WrenchIcon className="h-4 w-4" />
                  Signaler une panne
                </Button>
              )}
              {viewingResource && viewingResource.status === "maintenance" && (
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Voir l'historique
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
