import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppelOffres } from "@/hooks/use-appel-offres";
import { parseISO, isValid } from "date-fns";
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
import { CalendarIcon, Loader2, CheckCircle, AlertCircle, Clock, Eye, Edit, X, Plus } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Schema for creating a call for offers
const callForOffersSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  startDate: z.date({
    required_error: "La date de début est requise",
  }),
  endDate: z.date({
    required_error: "La date de fin est requise",
  }),
  resourceType: z.string().min(1, "Veuillez sélectionner un type de ressource"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  specifications: z.string().optional(),
});

type CallForOffersFormValues = z.infer<typeof callForOffersSchema>;

// Mock type for calls for offers
interface CallForOffers {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "draft" | "open" | "closed" | "awarded";
  resources: {
    type: string;
    quantity: number;
    specifications?: string;
  }[];
  createdAt: Date;
}

export default function CallsForOffersManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [pageError, setPageError] = useState<Error | null>(null);

  // Wrap the hook in a try-catch to prevent white screen on errors
  let callsForOffers: CallForOffers[] = [];
  let isLoading = false;
  let error = null;
  let createCallForOffers = (data: any) => {
    console.error("API not initialized");
    toast({
      title: "Erreur",
      description: "Impossible de créer l'appel d'offres. L'API n'est pas initialisée.",
      variant: "destructive",
    });
    return Promise.reject("API not initialized");
  };
  let isSubmitting = false;
  let closeCallForOffers = (id: number) => {
    console.error("API not initialized");
    toast({
      title: "Erreur",
      description: "Impossible de clôturer l'appel d'offres. L'API n'est pas initialisée.",
      variant: "destructive",
    });
    return Promise.reject("API not initialized");
  };

  try {
    const apiHook = useAppelOffres();
    callsForOffers = apiHook.callsForOffers || [];
    isLoading = apiHook.isLoading;
    error = apiHook.error;
    createCallForOffers = apiHook.createCallForOffers;
    isSubmitting = apiHook.isCreating;
    closeCallForOffers = apiHook.closeCallForOffers;
  } catch (err) {
    console.error("Error initializing API hook:", err);
    setPageError(err instanceof Error ? err : new Error(String(err)));
  }

  const [isCreating, setIsCreating] = useState(false);
  const [viewingCall, setViewingCall] = useState<CallForOffers | null>(null);
  const [editingCall, setEditingCall] = useState<CallForOffers | null>(null);
  const [resourcesList, setResourcesList] = useState<{type: string; quantity: number; specifications?: string}[]>([]);

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

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors du chargement des appels d'offres: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const form = useForm<CallForOffersFormValues>({
    resolver: zodResolver(callForOffersSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      resourceType: "",
      quantity: 1,
      specifications: "",
    },
  });

  const onSubmit = (values: CallForOffersFormValues) => {
    // Add the resource to the list
    setResourcesList([...resourcesList, {
      type: values.resourceType,
      quantity: values.quantity,
      specifications: values.specifications
    }]);

    // Reset the resource fields
    form.setValue("resourceType", "");
    form.setValue("quantity", 1);
    form.setValue("specifications", "");
  };

  const handleCreateCallForOffers = () => {
    if (resourcesList.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins une ressource à l'appel d'offres",
        variant: "destructive",
      });
      return;
    }

    const values = form.getValues();

    // Create a new call for offers
    const newCallData = {
      title: values.title,
      description: values.description,
      startDate: values.startDate,
      endDate: values.endDate,
      status: "open",
      resources: resourcesList,
    };

    // Call the API to create the call for offers
    createCallForOffers(newCallData);

    setIsCreating(false);
    setResourcesList([]);
    form.reset();
  };

  const handleRemoveResource = (index: number) => {
    const newList = [...resourcesList];
    newList.splice(index, 1);
    setResourcesList(newList);
  };

  const handleCloseCall = (id: number) => {
    // Call the API to close the call for offers
    closeCallForOffers(id);
  };

  // Helper function to safely parse dates
  const safeParseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();

    if (dateValue instanceof Date) {
      return isValid(dateValue) ? dateValue : new Date();
    }

    if (typeof dateValue === 'string') {
      try {
        // Try to parse ISO string
        const parsedDate = parseISO(dateValue);
        return isValid(parsedDate) ? parsedDate : new Date();
      } catch (e) {
        console.error('Error parsing date:', dateValue, e);
        return new Date();
      }
    }

    // If all else fails, return current date
    return new Date();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200">
            <Clock className="w-3 h-3" />
            Brouillon
          </Badge>
        );
      case "open":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Ouvert
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200">
            <AlertCircle className="w-3 h-3" />
            Clôturé
          </Badge>
        );
      case "awarded":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3" />
            Attribué
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

  // Display error if there's a page-level error
  if (pageError) {
    return (
      <AppLayout title="Gestion des appels d'offres">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-red-800 mb-2">Erreur lors du chargement de la page</h2>
          <p className="text-red-600 mb-4">{pageError.message}</p>
          <Button onClick={() => window.location.reload()}>
            Rafraîchir la page
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gestion des appels d'offres">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Appels d'offres</h2>
          <Button onClick={() => setIsCreating(true)}>
            Créer un appel d'offres
          </Button>
        </div>

        {/* List of calls for offers */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12 bg-gray-50 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Chargement des appels d'offres...</span>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Liste des appels d'offres</CardTitle>
              <CardDescription>
                Consultez et gérez les appels d'offres en cours et passés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Date de début</TableHead>
                      <TableHead>Date de fin</TableHead>
                      <TableHead>Ressources</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callsForOffers.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.title}</TableCell>
                        <TableCell>{format(safeParseDate(call.startDate), "dd/MM/yyyy", { locale: fr })}</TableCell>
                        <TableCell>{format(safeParseDate(call.endDate), "dd/MM/yyyy", { locale: fr })}</TableCell>
                        <TableCell>{call.resources?.length || 0} type(s)</TableCell>
                        <TableCell>{getStatusBadge(call.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-primary"
                              onClick={() => setViewingCall(call)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {call.status === "draft" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-primary"
                                onClick={() => setEditingCall(call)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {call.status === "open" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-primary"
                                onClick={() => handleCloseCall(call.id)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="h-4 w-4" />
                                    Clôturer
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {callsForOffers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Aucun appel d'offres disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Call for Offers Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Créer un nouvel appel d'offres</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour créer un nouvel appel d'offres
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de l'appel d'offres</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Acquisition d'ordinateurs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date de début</FormLabel>
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
                                  date < new Date()
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date de fin</FormLabel>
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
                                  date <= form.getValues().startDate
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez l'appel d'offres en détail..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Ressources demandées</h3>

                  {resourcesList.length > 0 && (
                    <div className="mb-4 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantité</TableHead>
                            <TableHead>Spécifications</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resourcesList.map((resource, index) => (
                            <TableRow key={index}>
                              <TableCell>{resource.type}</TableCell>
                              <TableCell>{resource.quantity}</TableCell>
                              <TableCell>{resource.specifications || "-"}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveResource(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="resourceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de ressource</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Ordinateur">Ordinateur</SelectItem>
                              <SelectItem value="Imprimante">Imprimante</SelectItem>
                              <SelectItem value="Scanner">Scanner</SelectItem>
                              <SelectItem value="Projecteur">Projecteur</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spécifications</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Intel Core i7, 16GB RAM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une ressource
                  </Button>
                </div>
              </form>
            </Form>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setResourcesList([]);
                form.reset();
              }}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateCallForOffers}
                disabled={resourcesList.length === 0 || !form.formState.isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer l'appel d'offres"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Call for Offers Dialog */}
        {viewingCall && (
          <Dialog open={!!viewingCall} onOpenChange={(open) => !open && setViewingCall(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{viewingCall.title}</DialogTitle>
                <DialogDescription>
                  Créé le {format(safeParseDate(viewingCall.createdAt), "PPP", { locale: fr })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <div className="mt-1">{getStatusBadge(viewingCall.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de début</p>
                    <p>{format(safeParseDate(viewingCall.startDate), "PPP", { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de fin</p>
                    <p>{format(safeParseDate(viewingCall.endDate), "PPP", { locale: fr })}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-1">{viewingCall.description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Ressources demandées</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Spécifications</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingCall.resources.map((resource, index) => (
                        <TableRow key={index}>
                          <TableCell>{resource.type}</TableCell>
                          <TableCell>{resource.quantity}</TableCell>
                          <TableCell>{resource.specifications || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingCall(null)}>
                  Fermer
                </Button>
                {viewingCall.status === "open" && (
                  <Button
                    onClick={() => {
                      handleCloseCall(viewingCall.id);
                      setViewingCall(null);
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Clôture en cours...
                      </>
                    ) : (
                      "Clôturer l'appel d'offres"
                    )}
                  </Button>
                )}
                {viewingCall.status === "closed" && (
                  <Button onClick={() => {
                    navigate("/resource-manager/supplier-offers");
                    setViewingCall(null);
                  }}>
                    Voir les offres reçues
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
