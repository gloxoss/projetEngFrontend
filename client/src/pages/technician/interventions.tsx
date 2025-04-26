import AppLayout from "@/layouts/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
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
import { 
  Search, 
  WrenchIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  ArrowRight
} from "lucide-react";

export default function Interventions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch interventions
  const { data: interventions = [], isLoading } = useQuery({
    queryKey: ["/api/interventions"],
  });

  // Fetch maintenance reports to get details
  const { data: maintenanceReports = [] } = useQuery({
    queryKey: ["/api/maintenance-reports"],
  });

  // Fetch resources to get details
  const { data: resources = [] } = useQuery({
    queryKey: ["/api/resources"],
  });

  // Filter interventions based on search term and status
  const filteredInterventions = interventions.filter(intervention => {
    const report = maintenanceReports.find(r => r.id === intervention.maintenanceReportId);
    const resource = report ? resources.find(r => r.id === report.resourceId) : null;
    
    const matchesSearch = 
      (resource && 
        (resource.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
         resource.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (report && report.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (intervention.notes && intervention.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || intervention.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout title="Suivi des interventions">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher une intervention..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Statut:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredInterventions.length === 0 ? (
          <div className="text-center py-12">
            <WrenchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune intervention trouvée</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Essayez avec d'autres filtres." 
                : "Vous n'avez pas encore d'interventions assignées."}
            </p>
            <Link href="/technician/maintenance-reports">
              <Button className="mt-6">
                Consulter les pannes signalées
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterventions.map((intervention) => {
              const report = maintenanceReports.find(r => r.id === intervention.maintenanceReportId);
              const resource = report ? resources.find(r => r.id === report.resourceId) : null;
              
              return (
                <Card key={intervention.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {resource 
                            ? `${resource.resourceType} (${resource.inventoryNumber})` 
                            : `Intervention #${intervention.id}`}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              Démarrée le {new Date(intervention.startDate).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          intervention.status === "completed" 
                            ? "success" 
                            : intervention.status === "in_progress" 
                            ? "outline" 
                            : "secondary"
                        }
                        className="ml-2"
                      >
                        {intervention.status === "completed" && "Terminée"}
                        {intervention.status === "in_progress" && "En cours"}
                        {intervention.status === "pending" && "En attente"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {report && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Description du problème:</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {report.description}
                        </p>
                      </div>
                    )}
                    
                    {intervention.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Notes d'intervention:</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {intervention.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <Link href={`/technician/interventions/${intervention.id}`}>
                      <Button className="w-full">
                        Gérer l'intervention
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
