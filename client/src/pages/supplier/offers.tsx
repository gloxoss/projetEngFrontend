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
  Calendar, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Eye
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

export default function OffersHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  
  // Fetch supplier offers
  const { data: supplierOffers = [], isLoading } = useQuery({
    queryKey: ["/api/supplier-offers"],
  });

  // Fetch calls for offers to get titles
  const { data: callsForOffers = [] } = useQuery({
    queryKey: ["/api/calls-for-offers"],
  });

  // Filter offers based on search term and status
  const filteredOffers = supplierOffers.filter(offer => {
    const call = callsForOffers.find(c => c.id === offer.callForOffersId);
    const matchesSearch = call && call.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout title="Historique des offres">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher un appel d'offres..."
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
                <SelectItem value="accepted">Acceptées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune offre trouvée</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Essayez avec d'autres filtres." 
                : "Vous n'avez pas encore soumis d'offres."}
            </p>
            <Link href="/supplier/calls-for-offers">
              <Button className="mt-6">
                Consulter les appels d'offres
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Appel d'offres
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date de soumission
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Montant total
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
                {filteredOffers.map((offer) => {
                  const call = callsForOffers.find(c => c.id === offer.callForOffersId);
                  return (
                    <tr key={offer.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {call?.title || `Appel #${offer.callForOffersId}`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {offer.totalPrice.toLocaleString("fr-FR")} €
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <Badge 
                          variant={
                            offer.status === "accepted" 
                              ? "success" 
                              : offer.status === "pending" 
                              ? "outline" 
                              : "destructive"
                          }
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {offer.status === "accepted" && <CheckCircle className="w-3 h-3" />}
                          {offer.status === "pending" && <Clock className="w-3 h-3" />}
                          {offer.status === "rejected" && <AlertTriangle className="w-3 h-3" />}
                          {offer.status === "accepted" && "Acceptée"}
                          {offer.status === "pending" && "En attente"}
                          {offer.status === "rejected" && "Rejetée"}
                        </Badge>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => setSelectedOffer(offer)}
                            >
                              <Eye className="h-4 w-4" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Détails de l'offre</DialogTitle>
                              <DialogDescription>
                                {call?.title || `Appel d'offres #${offer.callForOffersId}`}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedOffer && (
                              <div className="mt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500">Date de soumission</h3>
                                    <p className="text-sm">
                                      {new Date(selectedOffer.createdAt).toLocaleDateString("fr-FR")}
                                    </p>
                                  </div>
                                  <Badge 
                                    variant={
                                      selectedOffer.status === "accepted" 
                                        ? "success" 
                                        : selectedOffer.status === "pending" 
                                        ? "outline" 
                                        : "destructive"
                                    }
                                    className="px-2 py-1"
                                  >
                                    {selectedOffer.status === "accepted" && "Acceptée"}
                                    {selectedOffer.status === "pending" && "En attente"}
                                    {selectedOffer.status === "rejected" && "Rejetée"}
                                  </Badge>
                                </div>
                                
                                {selectedOffer.feedback && (
                                  <div className="p-3 bg-gray-50 rounded-md">
                                    <h3 className="text-sm font-medium">Feedback</h3>
                                    <p className="mt-1 text-sm">{selectedOffer.feedback}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <h3 className="text-sm font-medium mb-2">Détails des ressources</h3>
                                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ressource
                                          </th>
                                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Marque
                                          </th>
                                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantité
                                          </th>
                                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prix unitaire
                                          </th>
                                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Garantie
                                          </th>
                                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Livraison
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOffer.items.map((item: any, index: number) => (
                                          <tr key={index}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                              {item.resourceType}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {item.brand}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {item.quantity}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {item.unitPrice.toLocaleString("fr-FR")} €
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {item.warranty} mois
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {new Date(item.deliveryDate).toLocaleDateString("fr-FR")}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                  <span className="font-medium">Montant total</span>
                                  <span className="text-lg font-bold">
                                    {selectedOffer.totalPrice.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Fermer</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
