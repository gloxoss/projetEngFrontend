import AppLayout from "@/layouts/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Plus,
  Trash2,
  Calculator
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function CallDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const callId = parseInt(id);

  // Fetch call for offers details
  const { data: call, isLoading: isLoadingCall } = useQuery({
    queryKey: [`/api/calls-for-offers/${callId}`],
    enabled: !isNaN(callId),
  });

  // Fetch existing offers for this call
  const { data: existingOffers = [], isLoading: isLoadingOffers } = useQuery({
    queryKey: [`/api/calls-for-offers/${callId}/offers`],
    enabled: !isNaN(callId),
  });

  // State for the offer form
  const [offerItems, setOfferItems] = useState<Array<{
    resourceType: string;
    quantity: number;
    brand: string;
    unitPrice: number;
    warranty: number;
    deliveryDate: string;
  }>>([]);

  // Initialize offer items based on call resources
  useState(() => {
    if (call && offerItems.length === 0) {
      setOfferItems(
        call.resources.map(resource => ({
          resourceType: resource.type,
          quantity: resource.quantity,
          brand: "",
          unitPrice: 0,
          warranty: 12, // Default warranty in months
          deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }))
      );
    }
  });

  // Calculate total price
  const totalPrice = offerItems.reduce(
    (total, item) => total + (item.unitPrice * item.quantity),
    0
  );

  // Submit offer mutation
  const submitOfferMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/supplier-offers", {
        callForOffersId: callId,
        items: offerItems,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Offre soumise avec succès",
        description: "Votre offre a été enregistrée et sera examinée par le responsable des ressources.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-offers"] });
      queryClient.invalidateQueries({ queryKey: [`/api/calls-for-offers/${callId}/offers`] });
      navigate("/supplier/offers");
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
    const isValid = offerItems.every(item => 
      item.brand.trim() !== "" && 
      item.unitPrice > 0 && 
      item.warranty > 0 && 
      item.deliveryDate
    );

    if (!isValid) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs pour chaque ressource.",
        variant: "destructive",
      });
      return;
    }

    submitOfferMutation.mutate();
  };

  // Update an item in the offer
  const updateOfferItem = (index: number, field: string, value: any) => {
    const newItems = [...offerItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOfferItems(newItems);
  };

  // Check if user already submitted an offer
  const hasExistingOffer = existingOffers.length > 0;

  if (isLoadingCall || isLoadingOffers) {
    return (
      <AppLayout title="Détails de l'appel d'offres">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!call) {
    return (
      <AppLayout title="Détails de l'appel d'offres">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Appel d'offres non trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            L'appel d'offres que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate("/supplier/calls-for-offers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux appels d'offres
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={call.title}>
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate("/supplier/calls-for-offers")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux appels d'offres
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Détails de l'appel</CardTitle>
              <Badge 
                variant={call.status === "open" ? "success" : "outline"}
              >
                {call.status === "open" ? "Ouvert" : "Fermé"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm">{call.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date de début</h3>
              <p className="mt-1 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(call.startDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date limite</h3>
              <p className="mt-1 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(call.endDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ressources demandées</h3>
              <ul className="mt-2 space-y-2">
                {call.resources.map((resource, index) => (
                  <li key={index} className="text-sm bg-gray-50 p-3 rounded-md">
                    <div className="font-medium">{resource.type}</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">Quantité:</span>
                      <span>{resource.quantity} unités</span>
                    </div>
                    {resource.specifications && (
                      <div className="mt-1 text-gray-600">
                        <span className="text-gray-500">Spécifications:</span>
                        <p className="mt-0.5">{resource.specifications}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Offer Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Soumettre une offre</CardTitle>
            <CardDescription>
              Remplissez les détails de votre offre pour chaque ressource demandée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {call.status !== "open" ? (
              <div className="text-center py-6">
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
                <h3 className="mt-2 text-base font-medium">Cet appel d'offres est fermé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous ne pouvez plus soumettre d'offre pour cet appel.
                </p>
              </div>
            ) : hasExistingOffer ? (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <h3 className="mt-2 text-base font-medium">Vous avez déjà soumis une offre</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous pouvez consulter votre offre dans l'historique des offres.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/supplier/offers")}
                >
                  Voir mes offres
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {offerItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-3">{item.resourceType} ({item.quantity} unités)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`brand-${index}`}>Marque</Label>
                          <Input
                            id={`brand-${index}`}
                            value={item.brand}
                            onChange={(e) => updateOfferItem(index, "brand", e.target.value)}
                            placeholder="Ex: Dell, HP, etc."
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`unitPrice-${index}`}>Prix unitaire (€)</Label>
                          <Input
                            id={`unitPrice-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateOfferItem(index, "unitPrice", parseFloat(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`warranty-${index}`}>Garantie (mois)</Label>
                          <Input
                            id={`warranty-${index}`}
                            type="number"
                            min="0"
                            value={item.warranty}
                            onChange={(e) => updateOfferItem(index, "warranty", parseInt(e.target.value))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`deliveryDate-${index}`}>Date de livraison estimée</Label>
                          <Input
                            id={`deliveryDate-${index}`}
                            type="date"
                            value={item.deliveryDate}
                            onChange={(e) => updateOfferItem(index, "deliveryDate", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 text-right text-sm font-medium">
                        Sous-total: {(item.unitPrice * item.quantity).toLocaleString("fr-FR")} €
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      <span className="font-medium">Total de l'offre</span>
                    </div>
                    <span className="text-xl font-bold">{totalPrice.toLocaleString("fr-FR")} €</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={submitOfferMutation.isPending}
                  >
                    {submitOfferMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                        Soumission en cours...
                      </>
                    ) : (
                      <>
                        Soumettre l'offre
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
