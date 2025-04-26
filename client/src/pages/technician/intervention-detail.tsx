import AppLayout from "@/layouts/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  WrenchIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Save
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function InterventionDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const interventionId = parseInt(id);
  
  // Form state
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");
  
  // Fetch intervention details
  const { data: intervention, isLoading: isLoadingIntervention } = useQuery({
    queryKey: [`/api/interventions/${interventionId}`],
    enabled: !isNaN(interventionId),
  });

  // Fetch maintenance report
  const { data: maintenanceReports = [] } = useQuery({
    queryKey: ["/api/maintenance-reports"],
  });

  // Fetch resources
  const { data: resources = [] } = useQuery({
    queryKey: ["/api/resources"],
  });

  // Set initial form values when data is loaded
  useEffect(() => {
    if (intervention) {
      setNotes(intervention.notes || "");
      setStatus(intervention.status || "");
      setResolution(intervention.resolution || "");
    }
  }, [intervention]);

  // Get related maintenance report and resource
  const report = maintenanceReports.find(r => r.id === intervention?.maintenanceReportId);
  const resource = report ? resources.find(r => r.id === report.resourceId) : null;

  // Update intervention mutation
  const updateInterventionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/interventions/${interventionId}`, {
        notes,
        status,
        resolution: status === "completed" ? resolution : null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Intervention mise à jour",
        description: "Les informations ont été enregistrées avec succès.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/interventions/${interventionId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/interventions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-reports"] });
      
      if (status === "completed") {
        navigate("/technician/interventions");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la mise à jour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!notes || !status) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Validate resolution if status is completed
    if (status === "completed" && !resolution) {
      toast({
        title: "Résolution manquante",
        description: "Veuillez indiquer la résolution du problème pour terminer l'intervention.",
        variant: "destructive",
      });
      return;
    }

    updateInterventionMutation.mutate();
  };

  if (isLoadingIntervention) {
    return (
      <AppLayout title="Détails de l'intervention">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!intervention) {
    return (
      <AppLayout title="Détails de l'intervention">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Intervention non trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            L'intervention que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate("/technician/interventions")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux interventions
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Intervention ${resource ? `sur ${resource.resourceType}` : `#${interventionId}`}`}>
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate("/technician/interventions")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux interventions
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intervention Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Détails</CardTitle>
              <Badge 
                variant={
                  intervention.status === "completed" 
                    ? "success" 
                    : intervention.status === "in_progress" 
                    ? "outline" 
                    : "secondary"
                }
              >
                {intervention.status === "completed" && "Terminée"}
                {intervention.status === "in_progress" && "En cours"}
                {intervention.status === "pending" && "En attente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ressource concernée</h3>
              <p className="mt-1 text-sm">
                {resource 
                  ? `${resource.resourceType} (${resource.inventoryNumber})` 
                  : `Ressource #${report?.resourceId || "inconnue"}`}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date de début</h3>
              <p className="mt-1 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(intervention.startDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
            
            {intervention.endDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date de fin</h3>
                <p className="mt-1 text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(intervention.endDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}
            
            {report && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description du problème</h3>
                <p className="mt-1 text-sm p-3 bg-gray-50 rounded-md">
                  {report.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge 
                    variant={
                      report.urgency === "critical" 
                        ? "destructive" 
                        : report.urgency === "high" 
                        ? "destructive" 
                        : report.urgency === "medium"
                        ? "warning"
                        : "outline"
                    }
                  >
                    {report.urgency === "critical" && "Critique"}
                    {report.urgency === "high" && "Haute"}
                    {report.urgency === "medium" && "Moyenne"}
                    {report.urgency === "low" && "Faible"}
                  </Badge>
                  <span className="text-xs text-gray-500">Niveau d'urgence</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intervention Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Suivi de l'intervention</CardTitle>
            <CardDescription>
              Mettez à jour les informations concernant cette intervention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="notes">Notes d'intervention</Label>
                <Textarea
                  id="notes"
                  placeholder="Décrivez les actions entreprises, les observations, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="status">Statut de l'intervention</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {status === "completed" && (
                <div>
                  <Label htmlFor="resolution">Résolution</Label>
                  <Textarea
                    id="resolution"
                    placeholder="Décrivez comment le problème a été résolu..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={updateInterventionMutation.isPending}
                >
                  {updateInterventionMutation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                      Enregistrement...
                    </>
                  ) : status === "completed" ? (
                    <>
                      Terminer l'intervention
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Enregistrer les modifications
                      <Save className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
