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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckCircle, Truck, Package, Eye, Plus, Barcode } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Schema for delivery form
const deliveryFormSchema = z.object({
  supplierId: z.number({
    required_error: "Veuillez sélectionner un fournisseur",
  }),
  deliveryDate: z.date({
    required_error: "La date de livraison est requise",
  }),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      resourceType: z.string().min(1, "Le type de ressource est requis"),
      quantity: z.number().min(1, "La quantité doit être au moins 1"),
      inventoryPrefix: z.string().min(1, "Le préfixe d'inventaire est requis"),
      startNumber: z.number().min(1, "Le numéro de début est requis"),
    })
  ).min(1, "Au moins un article est requis"),
});

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>;

// Mock type for deliveries
interface Delivery {
  id: number;
  supplierId: number;
  supplierName: string;
  deliveryDate: Date;
  notes?: string;
  status: "pending" | "received" | "incomplete";
  items: {
    resourceType: string;
    quantity: number;
    inventoryPrefix: string;
    startNumber: number;
    inventoryNumbers: string[];
  }[];
  createdAt: Date;
}

export default function DeliveriesManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [isCreating, setIsCreating] = useState(false);
  const [viewingDelivery, setViewingDelivery] = useState<Delivery | null>(null);
  const [items, setItems] = useState<{
    resourceType: string;
    quantity: number;
    inventoryPrefix: string;
    startNumber: number;
  }[]>([]);

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

  // Mock data for suppliers
  const suppliers = [
    { id: 1, name: "Tech Solutions" },
    { id: 2, name: "Office Equipment Inc." },
    { id: 3, name: "Informatique Pro" },
  ];

  // Mock data for deliveries
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 1,
      supplierId: 1,
      supplierName: "Tech Solutions",
      deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: "Livraison d'ordinateurs pour le département d'informatique",
      status: "received",
      items: [
        {
          resourceType: "Ordinateur",
          quantity: 10,
          inventoryPrefix: "ORD",
          startNumber: 1,
          inventoryNumbers: Array.from({ length: 10 }, (_, i) => `ORD-${i + 1}`),
        },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      supplierId: 2,
      supplierName: "Office Equipment Inc.",
      deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: "Livraison d'imprimantes",
      status: "received",
      items: [
        {
          resourceType: "Imprimante",
          quantity: 5,
          inventoryPrefix: "IMP",
          startNumber: 1,
          inventoryNumbers: Array.from({ length: 5 }, (_, i) => `IMP-${i + 1}`),
        },
      ],
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  ]);

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      deliveryDate: new Date(),
      notes: "",
      items: [],
    },
  });

  const itemForm = useForm({
    resolver: zodResolver(
      z.object({
        resourceType: z.string().min(1, "Le type de ressource est requis"),
        quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
        inventoryPrefix: z.string().min(1, "Le préfixe d'inventaire est requis"),
        startNumber: z.coerce.number().min(1, "Le numéro de début est requis"),
      })
    ),
    defaultValues: {
      resourceType: "",
      quantity: 1,
      inventoryPrefix: "",
      startNumber: 1,
    },
  });

  const addItem = (data: any) => {
    setItems([...items, data]);
    itemForm.reset();
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const onSubmit = (values: DeliveryFormValues) => {
    // Find the supplier
    const supplier = suppliers.find(s => s.id === values.supplierId);
    
    if (!supplier) {
      toast({
        title: "Erreur",
        description: "Fournisseur introuvable",
        variant: "destructive",
      });
      return;
    }
    
    // Create inventory numbers for each item
    const itemsWithInventoryNumbers = items.map(item => ({
      ...item,
      inventoryNumbers: Array.from(
        { length: item.quantity }, 
        (_, i) => `${item.inventoryPrefix}-${item.startNumber + i}`
      ),
    }));
    
    // Create a new delivery
    const newDelivery: Delivery = {
      id: deliveries.length + 1,
      supplierId: supplier.id,
      supplierName: supplier.name,
      deliveryDate: values.deliveryDate,
      notes: values.notes,
      status: "received",
      items: itemsWithInventoryNumbers,
      createdAt: new Date(),
    };
    
    setDeliveries([...deliveries, newDelivery]);
    
    toast({
      title: "Livraison enregistrée",
      description: `La livraison de ${supplier.name} a été enregistrée avec succès.`,
      variant: "default",
    });
    
    setIsCreating(false);
    setItems([]);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Truck className="w-3 h-3" />
            En attente
          </Badge>
        );
      case "received":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Reçue
          </Badge>
        );
      case "incomplete":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <Package className="w-3 h-3" />
            Incomplète
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

  return (
    <AppLayout title="Réception des livraisons">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Gestion des livraisons</h2>
          <Button onClick={() => setIsCreating(true)}>
            Enregistrer une livraison
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Livraisons récentes</CardTitle>
            <CardDescription>
              Consultez et gérez les livraisons de ressources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date de livraison</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Quantité totale</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.supplierName}</TableCell>
                      <TableCell>{format(delivery.deliveryDate, "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>
                        {delivery.items.map(item => item.resourceType).join(", ")}
                      </TableCell>
                      <TableCell>
                        {delivery.items.reduce((total, item) => total + item.quantity, 0)}
                      </TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 text-primary"
                          onClick={() => setViewingDelivery(delivery)}
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deliveries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune livraison disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Delivery Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Enregistrer une livraison</DialogTitle>
              <DialogDescription>
                Enregistrez une nouvelle livraison et attribuez des numéros d'inventaire
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fournisseur</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un fournisseur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de livraison</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date()
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notes sur la livraison (optionnel)" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Articles livrés</h3>
                  
                  {items.length > 0 && (
                    <div className="mb-4 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantité</TableHead>
                            <TableHead>Préfixe d'inventaire</TableHead>
                            <TableHead>Numéro de début</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.resourceType}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.inventoryPrefix}</TableCell>
                              <TableCell>{item.startNumber}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => removeItem(index)}
                                >
                                  Supprimer
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3">Ajouter un article</h4>
                    <form
                      onSubmit={itemForm.handleSubmit(addItem)}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <div>
                        <FormLabel>Type de ressource</FormLabel>
                        <Select
                          onValueChange={(value) => itemForm.setValue("resourceType", value)}
                          value={itemForm.watch("resourceType")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ordinateur">Ordinateur</SelectItem>
                            <SelectItem value="Imprimante">Imprimante</SelectItem>
                            <SelectItem value="Scanner">Scanner</SelectItem>
                            <SelectItem value="Projecteur">Projecteur</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        {itemForm.formState.errors.resourceType && (
                          <p className="text-sm text-red-500 mt-1">
                            {itemForm.formState.errors.resourceType.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <FormLabel>Quantité</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          {...itemForm.register("quantity", { valueAsNumber: true })}
                        />
                        {itemForm.formState.errors.quantity && (
                          <p className="text-sm text-red-500 mt-1">
                            {itemForm.formState.errors.quantity.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <FormLabel>Préfixe d'inventaire</FormLabel>
                        <Input
                          placeholder="Ex: ORD"
                          {...itemForm.register("inventoryPrefix")}
                        />
                        {itemForm.formState.errors.inventoryPrefix && (
                          <p className="text-sm text-red-500 mt-1">
                            {itemForm.formState.errors.inventoryPrefix.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <FormLabel>Numéro de début</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          {...itemForm.register("startNumber", { valueAsNumber: true })}
                        />
                        {itemForm.formState.errors.startNumber && (
                          <p className="text-sm text-red-500 mt-1">
                            {itemForm.formState.errors.startNumber.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="col-span-2 md:col-span-4 flex justify-end">
                        <Button type="submit" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter l'article
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreating(false);
                    setItems([]);
                    form.reset();
                  }}>
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    disabled={items.length === 0 || !form.formState.isValid}
                  >
                    Enregistrer la livraison
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Delivery Details Dialog */}
        {viewingDelivery && (
          <Dialog open={!!viewingDelivery} onOpenChange={(open) => !open && setViewingDelivery(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Détails de la livraison</DialogTitle>
                <DialogDescription>
                  Livraison de {viewingDelivery.supplierName} du {format(viewingDelivery.deliveryDate, "PPP", { locale: fr })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fournisseur</p>
                    <p className="font-semibold">{viewingDelivery.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de livraison</p>
                    <p>{format(viewingDelivery.deliveryDate, "PPP", { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <div className="mt-1">{getStatusBadge(viewingDelivery.status)}</div>
                  </div>
                </div>
                
                {viewingDelivery.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="mt-1">{viewingDelivery.notes}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Articles livrés</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Numéros d'inventaire</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingDelivery.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.resourceType}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.inventoryNumbers.map((num, i) => (
                                <Badge key={i} variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                                  <Barcode className="w-3 h-3" />
                                  {num}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingDelivery(null)}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
