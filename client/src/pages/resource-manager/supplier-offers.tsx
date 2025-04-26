import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Eye, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Shield,
  Truck,
  ThumbsUp,
  ThumbsDown,
  Ban
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock types for supplier offers
interface SupplierOffer {
  id: number;
  callForOffersId: number;
  callForOffersTitle: string;
  supplierId: number;
  supplierName: string;
  totalPrice: number;
  items: {
    resourceType: string;
    quantity: number;
    unitPrice: number;
    warranty: number; // in months
    deliveryDate: Date;
  }[];
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export default function SupplierOffersManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [viewingOffer, setViewingOffer] = useState<SupplierOffer | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");

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

  // Mock data for calls for offers
  const callsForOffers = [
    { id: 1, title: "Appel d'offres - Ordinateurs", status: "closed" },
    { id: 2, title: "Appel d'offres - Imprimantes", status: "closed" },
    { id: 3, title: "Appel d'offres - Projecteurs", status: "closed" },
  ];

  // Mock data for supplier offers
  const [supplierOffers, setSupplierOffers] = useState<SupplierOffer[]>([
    {
      id: 1,
      callForOffersId: 1,
      callForOffersTitle: "Appel d'offres - Ordinateurs",
      supplierId: 1,
      supplierName: "Tech Solutions",
      totalPrice: 12000,
      items: [
        {
          resourceType: "Ordinateur",
          quantity: 10,
          unitPrice: 1200,
          warranty: 24,
          deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      ],
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      callForOffersId: 1,
      callForOffersTitle: "Appel d'offres - Ordinateurs",
      supplierId: 2,
      supplierName: "Informatique Pro",
      totalPrice: 13500,
      items: [
        {
          resourceType: "Ordinateur",
          quantity: 10,
          unitPrice: 1350,
          warranty: 36,
          deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
      ],
      status: "pending",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      callForOffersId: 2,
      callForOffersTitle: "Appel d'offres - Imprimantes",
      supplierId: 3,
      supplierName: "Office Equipment Inc.",
      totalPrice: 3000,
      items: [
        {
          resourceType: "Imprimante",
          quantity: 5,
          unitPrice: 600,
          warranty: 12,
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ],
      status: "pending",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  const handleAcceptOffer = () => {
    if (!viewingOffer) return;
    
    // Update the status of the selected offer
    const updatedOffers = supplierOffers.map(offer => 
      offer.id === viewingOffer.id 
        ? { ...offer, status: "accepted" as const } 
        : offer.id !== viewingOffer.id && offer.callForOffersId === viewingOffer.callForOffersId
          ? { ...offer, status: "rejected" as const }
          : offer
    );
    
    setSupplierOffers(updatedOffers);
    
    toast({
      title: "Offre acceptée",
      description: `L'offre de ${viewingOffer.supplierName} a été acceptée avec succès.`,
      variant: "default",
    });
    
    setShowAcceptDialog(false);
    setViewingOffer(null);
  };

  const handleRejectOffer = () => {
    if (!viewingOffer) return;
    
    // Update the status of the selected offer
    const updatedOffers = supplierOffers.map(offer => 
      offer.id === viewingOffer.id 
        ? { ...offer, status: "rejected" as const } 
        : offer
    );
    
    setSupplierOffers(updatedOffers);
    
    toast({
      title: "Offre rejetée",
      description: `L'offre de ${viewingOffer.supplierName} a été rejetée.`,
      variant: "default",
    });
    
    setShowRejectDialog(false);
    setRejectionReason("");
    setViewingOffer(null);
  };

  const handleBlacklistSupplier = () => {
    if (!viewingOffer) return;
    
    toast({
      title: "Fournisseur mis sur liste noire",
      description: `${viewingOffer.supplierName} a été ajouté à la liste noire.`,
      variant: "default",
    });
    
    setShowBlacklistDialog(false);
    setBlacklistReason("");
    setViewingOffer(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="w-3 h-3" />
            En attente
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Acceptée
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <X className="w-3 h-3" />
            Rejetée
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

  // Filter offers by selected call
  const filteredOffers = selectedCallId 
    ? supplierOffers.filter(offer => offer.callForOffersId === selectedCallId)
    : supplierOffers;

  return (
    <AppLayout title="Consultation des offres fournisseurs">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Offres des fournisseurs</CardTitle>
            <CardDescription>
              Comparez et sélectionnez les meilleures offres pour vos appels d'offres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Select 
                value={selectedCallId?.toString() || ""} 
                onValueChange={(value) => setSelectedCallId(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Filtrer par appel d'offres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les appels d'offres</SelectItem>
                  {callsForOffers.map(call => (
                    <SelectItem key={call.id} value={call.id.toString()}>
                      {call.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Appel d'offres</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Prix total</TableHead>
                    <TableHead>Garantie</TableHead>
                    <TableHead>Délai de livraison</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>{offer.callForOffersTitle}</TableCell>
                      <TableCell className="font-medium">{offer.supplierName}</TableCell>
                      <TableCell>{offer.totalPrice.toLocaleString('fr-FR')} €</TableCell>
                      <TableCell>
                        {offer.items.map(item => `${item.warranty} mois`).join(', ')}
                      </TableCell>
                      <TableCell>
                        {offer.items.map(item => format(item.deliveryDate, "dd/MM/yyyy", { locale: fr })).join(', ')}
                      </TableCell>
                      <TableCell>{getStatusBadge(offer.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 text-primary"
                            onClick={() => setViewingOffer(offer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {offer.status === "pending" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex items-center gap-1 text-green-600"
                                onClick={() => {
                                  setViewingOffer(offer);
                                  setShowAcceptDialog(true);
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex items-center gap-1 text-red-600"
                                onClick={() => {
                                  setViewingOffer(offer);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOffers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucune offre disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Offer Details Dialog */}
        {viewingOffer && (
          <Dialog open={!!viewingOffer && !showAcceptDialog && !showRejectDialog && !showBlacklistDialog} onOpenChange={(open) => !open && setViewingOffer(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Détails de l'offre</DialogTitle>
                <DialogDescription>
                  Offre de {viewingOffer.supplierName} pour {viewingOffer.callForOffersTitle}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <div className="mt-1">{getStatusBadge(viewingOffer.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de soumission</p>
                    <p>{format(viewingOffer.createdAt, "PPP", { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prix total</p>
                    <p className="font-semibold text-lg">{viewingOffer.totalPrice.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Détails des ressources</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead>Garantie</TableHead>
                        <TableHead>Date de livraison</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOffer.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.resourceType}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice.toLocaleString('fr-FR')} €</TableCell>
                          <TableCell>{item.warranty} mois</TableCell>
                          <TableCell>{format(item.deliveryDate, "dd/MM/yyyy", { locale: fr })}</TableCell>
                          <TableCell>{(item.quantity * item.unitPrice).toLocaleString('fr-FR')} €</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prix compétitif</p>
                      <p className="text-sm text-gray-500">
                        {viewingOffer.totalPrice < 13000 ? "Bon rapport qualité-prix" : "Prix élevé par rapport aux autres offres"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Garantie</p>
                      <p className="text-sm text-gray-500">
                        {viewingOffer.items[0].warranty >= 24 ? "Garantie étendue" : "Garantie standard"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Délai de livraison</p>
                      <p className="text-sm text-gray-500">
                        {new Date(viewingOffer.items[0].deliveryDate).getTime() - new Date().getTime() < 15 * 24 * 60 * 60 * 1000 
                          ? "Livraison rapide" 
                          : "Délai standard"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date de soumission</p>
                      <p className="text-sm text-gray-500">
                        {format(viewingOffer.createdAt, "PPP", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setShowBlacklistDialog(true);
                  }}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Blacklister le fournisseur
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setViewingOffer(null)}>
                    Fermer
                  </Button>
                  
                  {viewingOffer.status === "pending" && (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-red-600"
                        onClick={() => {
                          setShowRejectDialog(true);
                        }}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                      
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setShowAcceptDialog(true);
                        }}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Accepter
                      </Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Accept Offer Dialog */}
        {viewingOffer && (
          <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Accepter cette offre</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous êtes sur le point d'accepter l'offre de {viewingOffer.supplierName} pour un montant total de {viewingOffer.totalPrice.toLocaleString('fr-FR')} €.
                  <br /><br />
                  Cette action rejettera automatiquement toutes les autres offres pour cet appel d'offres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowAcceptDialog(false)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleAcceptOffer} className="bg-green-600 hover:bg-green-700">
                  Confirmer l'acceptation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Reject Offer Dialog */}
        {viewingOffer && (
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rejeter cette offre</DialogTitle>
                <DialogDescription>
                  Veuillez fournir une raison pour le rejet de l'offre de {viewingOffer.supplierName}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Raison du rejet (sera communiquée au fournisseur)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Annuler</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectOffer}
                  disabled={!rejectionReason.trim()}
                >
                  Rejeter l'offre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Blacklist Supplier Dialog */}
        {viewingOffer && (
          <Dialog open={showBlacklistDialog} onOpenChange={setShowBlacklistDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Blacklister ce fournisseur</DialogTitle>
                <DialogDescription>
                  Vous êtes sur le point d'ajouter {viewingOffer.supplierName} à la liste noire des fournisseurs.
                  Cette action empêchera ce fournisseur de participer aux futurs appels d'offres.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Raison de la mise sur liste noire (usage interne uniquement)"
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBlacklistDialog(false)}>Annuler</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBlacklistSupplier}
                  disabled={!blacklistReason.trim()}
                >
                  Confirmer la mise sur liste noire
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
