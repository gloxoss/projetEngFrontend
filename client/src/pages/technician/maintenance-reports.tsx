import AppLayout from "@/layouts/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  WrenchIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  Eye,
  Play
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function MaintenanceReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch maintenance reports
  const { data: maintenanceReports = [], isLoading } = useQuery({
    queryKey: ["/api/maintenance-reports"],
  });

  // Fetch resources to get details
  const { data: resources = [] } = useQuery({
    queryKey: ["/api/resources"],
  });

  // Start intervention mutation
  const startInterventionMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiRequest("POST", `/api/maintenance-reports/${reportId}/start-intervention`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Intervention démarrée",
        description: "L'intervention a été créée avec succès.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interventions"] });
      navigate(`/technician/interventions/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle start intervention
  const handleStartIntervention = (reportId: number) => {
    startInterventionMutation.mutate(reportId);
  };

  // Filter reports based on search term, urgency and status
  const filteredReports = maintenanceReports.filter(report => {
    const resource = resources.find(r => r.id === report.resourceId);
    const matchesSearch = 
      resource && 
      (resource.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
       resource.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUrgency = urgencyFilter === "all" || report.urgency === urgencyFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  return (
    <AppLayout title="Pannes signalées">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher une panne..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Urgence:</span>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Statut:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <WrenchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune panne signalée</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || urgencyFilter !== "all" || statusFilter !== "all" 
                ? "Essayez avec d'autres filtres." 
                : "Il n'y a actuellement aucune panne signalée."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Ressource
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date signalée
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Urgence
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredReports.map((report) => {
                  const resource = resources.find(r => r.id === report.resourceId);
                  return (
                    <tr key={report.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {resource ? `${resource.resourceType} (${resource.inventoryNumber})` : `Ressource #${report.resourceId}`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(report.occurrenceDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
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
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {report.urgency === "critical" && <AlertTriangle className="w-3 h-3" />}
                          {report.urgency === "high" && <AlertTriangle className="w-3 h-3" />}
                          {report.urgency === "medium" && <Clock className="w-3 h-3" />}
                          {report.urgency === "low" && <Clock className="w-3 h-3" />}
                          {report.urgency === "critical" && "Critique"}
                          {report.urgency === "high" && "Haute"}
                          {report.urgency === "medium" && "Moyenne"}
                          {report.urgency === "low" && "Faible"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <Badge 
                          variant={
                            report.status === "resolved" 
                              ? "success" 
                              : report.status === "in_progress" 
                              ? "outline" 
                              : "secondary"
                          }
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {report.status === "resolved" && <CheckCircle className="w-3 h-3" />}
                          {report.status === "in_progress" && <WrenchIcon className="w-3 h-3" />}
                          {report.status === "pending" && <Clock className="w-3 h-3" />}
                          {report.status === "resolved" && "Résolu"}
                          {report.status === "in_progress" && "En cours"}
                          {report.status === "pending" && "En attente"}
                        </Badge>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="h-4 w-4" />
                                Détails
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Détails de la panne</DialogTitle>
                                <DialogDescription>
                                  {resource ? `${resource.resourceType} (${resource.inventoryNumber})` : `Ressource #${report.resourceId}`}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedReport && (
                                <div className="mt-4 space-y-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">Date signalée</h3>
                                      <p className="text-sm">
                                        {new Date(selectedReport.occurrenceDate).toLocaleDateString("fr-FR")}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge 
                                        variant={
                                          selectedReport.urgency === "critical" 
                                            ? "destructive" 
                                            : selectedReport.urgency === "high" 
                                            ? "destructive" 
                                            : selectedReport.urgency === "medium"
                                            ? "warning"
                                            : "outline"
                                        }
                                      >
                                        {selectedReport.urgency === "critical" && "Critique"}
                                        {selectedReport.urgency === "high" && "Haute"}
                                        {selectedReport.urgency === "medium" && "Moyenne"}
                                        {selectedReport.urgency === "low" && "Faible"}
                                      </Badge>
                                      <Badge 
                                        variant={
                                          selectedReport.status === "resolved" 
                                            ? "success" 
                                            : selectedReport.status === "in_progress" 
                                            ? "outline" 
                                            : "secondary"
                                        }
                                      >
                                        {selectedReport.status === "resolved" && "Résolu"}
                                        {selectedReport.status === "in_progress" && "En cours"}
                                        {selectedReport.status === "pending" && "En attente"}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                    <p className="mt-1 text-sm p-3 bg-gray-50 rounded-md">
                                      {selectedReport.description}
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">Signalé par</h3>
                                      <p className="text-sm">
                                        {selectedReport.reportedById ? `Utilisateur #${selectedReport.reportedById}` : "Inconnu"}
                                      </p>
                                    </div>
                                    {selectedReport.assignedToId && (
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-500">Assigné à</h3>
                                        <p className="text-sm">
                                          {`Technicien #${selectedReport.assignedToId}`}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <DialogFooter>
                                {selectedReport && selectedReport.status === "pending" && (
                                  <Button 
                                    onClick={() => {
                                      handleStartIntervention(selectedReport.id);
                                    }}
                                    disabled={startInterventionMutation.isPending}
                                  >
                                    {startInterventionMutation.isPending ? (
                                      <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                                        Démarrage...
                                      </>
                                    ) : (
                                      <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Démarrer l'intervention
                                      </>
                                    )}
                                  </Button>
                                )}
                                <DialogClose asChild>
                                  <Button variant="outline">Fermer</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {report.status === "pending" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleStartIntervention(report.id)}
                              disabled={startInterventionMutation.isPending}
                            >
                              <Play className="h-4 w-4" />
                              Intervenir
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
