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
  FileText, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function MaintenanceReportForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Form state
  const [resourceId, setResourceId] = useState("");
  const [description, setDescription] = useState("");
  const [occurrenceDate, setOccurrenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [urgency, setUrgency] = useState("medium");
  const [frequency, setFrequency] = useState("first_time");
  const [type, setType] = useState("hardware");
  
  // Fetch resources
  const { data: resources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ["/api/resources"],
  });

  // Submit report mutation
  const submitReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/maintenance-reports", {
        resourceId: parseInt(resourceId),
        description,
        occurrenceDate,
        urgency,
        metadata: {
          frequency,
          type
        }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rapport soumis avec succès",
        description: "Le rapport de maintenance a été enregistré.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-reports"] });
      navigate("/technician/maintenance-reports");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la soumission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!resourceId || !description || !occurrenceDate || !urgency) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    submitReportMutation.mutate();
  };

  return (
    <AppLayout title="Saisie d'un constat de panne">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate("/technician/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour au tableau de bord
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Constat de panne</CardTitle>
          <CardDescription>
            Remplissez ce formulaire pour signaler une panne ou un dysfonctionnement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="resource">Ressource concernée</Label>
                <Select value={resourceId} onValueChange={setResourceId}>
                  <SelectTrigger id="resource">
                    <SelectValue placeholder="Sélectionner une ressource" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingResources ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : resources.length === 0 ? (
                      <SelectItem value="none" disabled>Aucune ressource disponible</SelectItem>
                    ) : (
                      resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id.toString()}>
                          {resource.resourceType} ({resource.inventoryNumber})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description du problème</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le problème rencontré en détail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occurrenceDate">Date de constatation</Label>
                  <Input
                    id="occurrenceDate"
                    type="date"
                    value={occurrenceDate}
                    onChange={(e) => setOccurrenceDate(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="urgency">Niveau d'urgence</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="Sélectionner un niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Fréquence du problème</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Sélectionner une fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first_time">Première occurrence</SelectItem>
                      <SelectItem value="occasional">Occasionnel</SelectItem>
                      <SelectItem value="frequent">Fréquent</SelectItem>
                      <SelectItem value="constant">Constant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type">Type de problème</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Matériel</SelectItem>
                      <SelectItem value="software">Logiciel</SelectItem>
                      <SelectItem value="network">Réseau</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg"
                disabled={submitReportMutation.isPending}
              >
                {submitReportMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                    Soumission en cours...
                  </>
                ) : (
                  <>
                    Soumettre le rapport
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
