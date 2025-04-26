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
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Trash2, 
  Ban,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";

// Mock type for blacklisted suppliers
interface BlacklistedSupplier {
  id: number;
  name: string;
  reason: string;
  blacklistedAt: Date;
  blacklistedBy: string;
}

export default function SupplierBlacklist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [viewingSupplier, setViewingSupplier] = useState<BlacklistedSupplier | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Mock data for blacklisted suppliers
  const [blacklistedSuppliers, setBlacklistedSuppliers] = useState<BlacklistedSupplier[]>([
    {
      id: 1,
      name: "Tech Fraudsters Inc.",
      reason: "Fausses spécifications techniques dans les offres précédentes",
      blacklistedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      blacklistedBy: "Jean Dupont",
    },
    {
      id: 2,
      name: "Unreliable Supplies Ltd.",
      reason: "Retards de livraison répétés et non-respect des engagements",
      blacklistedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      blacklistedBy: "Marie Martin",
    },
    {
      id: 3,
      name: "Overpriced Equipment Co.",
      reason: "Surfacturation systématique et pratiques commerciales douteuses",
      blacklistedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      blacklistedBy: "Pierre Durand",
    },
  ]);

  const handleRemoveFromBlacklist = () => {
    if (!viewingSupplier) return;
    
    // Remove the supplier from the blacklist
    setBlacklistedSuppliers(blacklistedSuppliers.filter(supplier => supplier.id !== viewingSupplier.id));
    
    toast({
      title: "Fournisseur réhabilité",
      description: `${viewingSupplier.name} a été retiré de la liste noire.`,
      variant: "default",
    });
    
    setShowRemoveDialog(false);
    setViewingSupplier(null);
  };

  // Filter suppliers based on search query
  const filteredSuppliers = blacklistedSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Liste noire des fournisseurs">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fournisseurs sur liste noire</CardTitle>
            <CardDescription>
              Consultez et gérez la liste des fournisseurs exclus des appels d'offres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Input
                  placeholder="Rechercher un fournisseur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du fournisseur</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Date d'exclusion</TableHead>
                    <TableHead>Ajouté par</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{supplier.reason}</TableCell>
                      <TableCell>{format(supplier.blacklistedAt, "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>{supplier.blacklistedBy}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 text-primary"
                            onClick={() => setViewingSupplier(supplier)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 text-red-600"
                            onClick={() => {
                              setViewingSupplier(supplier);
                              setShowRemoveDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {searchQuery 
                          ? "Aucun fournisseur ne correspond à votre recherche" 
                          : "Aucun fournisseur sur liste noire"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Supplier Details Dialog */}
        {viewingSupplier && (
          <Dialog open={!!viewingSupplier && !showRemoveDialog} onOpenChange={(open) => !open && setViewingSupplier(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails du fournisseur blacklisté</DialogTitle>
                <DialogDescription>
                  Informations sur {viewingSupplier.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom du fournisseur</p>
                  <p className="font-semibold">{viewingSupplier.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Raison de l'exclusion</p>
                  <p>{viewingSupplier.reason}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date d'exclusion</p>
                    <p>{format(viewingSupplier.blacklistedAt, "PPP", { locale: fr })}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ajouté par</p>
                    <p>{viewingSupplier.blacklistedBy}</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                  <div className="text-red-600">
                    <Ban className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-red-800">Fournisseur exclu</p>
                    <p className="text-sm text-red-700">
                      Ce fournisseur ne peut pas participer aux appels d'offres tant qu'il figure sur la liste noire.
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingSupplier(null)}>
                  Fermer
                </Button>
                <Button 
                  variant="outline" 
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => setShowRemoveDialog(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Réhabiliter ce fournisseur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Remove from Blacklist Dialog */}
        {viewingSupplier && (
          <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réhabiliter ce fournisseur</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous êtes sur le point de retirer {viewingSupplier.name} de la liste noire.
                  <br /><br />
                  Ce fournisseur pourra à nouveau participer aux appels d'offres.
                  Êtes-vous sûr de vouloir continuer ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowRemoveDialog(false)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveFromBlacklist} className="bg-green-600 hover:bg-green-700">
                  Confirmer la réhabilitation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </AppLayout>
  );
}
