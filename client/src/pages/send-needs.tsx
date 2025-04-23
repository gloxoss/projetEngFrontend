import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ResourceNeed } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, CheckCircle, AlertCircle, SendIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Schema for additional information when sending needs
const sendNeedsFormSchema = z.object({
  comments: z.string().optional(),
  priority: z.string({
    required_error: "Veuillez sélectionner une priorité",
  }),
  expectedDate: z.date().optional(),
});

type SendNeedsFormValues = z.infer<typeof sendNeedsFormSchema>;

export default function SendNeeds() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Only department heads should access this page
  if (user?.role !== "department_head") {
    toast({
      title: "Accès refusé",
      description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
      variant: "destructive",
    });
    navigate("/dashboard");
    return null;
  }

  const form = useForm<SendNeedsFormValues>({
    resolver: zodResolver(sendNeedsFormSchema),
    defaultValues: {
      comments: "",
      priority: "normal",
      expectedDate: undefined,
    },
  });

  const { data: resourceNeeds = [] } = useQuery<ResourceNeed[]>({
    queryKey: ["/api/resource-needs"],
  });

  // Filtered validated needs only
  const validatedNeeds = resourceNeeds.filter(need => need.status === "validated");

  const sendMutation = useMutation({
    mutationFn: async (data: SendNeedsFormValues) => {
      // In a real implementation, we would send the form data too
      const response = await apiRequest("POST", "/api/resource-needs/send", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-needs"] });
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer les besoins: ${error.message}`,
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    },
  });

  const onSubmit = (values: SendNeedsFormValues) => {
    setShowConfirmDialog(true);
  };

  const confirmSend = () => {
    sendMutation.mutate(form.getValues());
  };

  const handleBackToDashboard = () => {
    setShowSuccessDialog(false);
    navigate("/dashboard");
  };

  // Group needs by type for summary
  const needsByType = validatedNeeds.reduce((acc, need) => {
    if (!acc[need.resourceType]) {
      acc[need.resourceType] = [];
    }
    acc[need.resourceType].push(need);
    return acc;
  }, {} as Record<string, ResourceNeed[]>);

  return (
    <AppLayout title="Envoyer les besoins au responsable">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Envoyer les besoins au responsable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Vous êtes sur le point d'envoyer tous les besoins validés au responsable des ressources. Cette action est définitive.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary of needs */}
            <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Résumé des besoins à envoyer</h4>
              </div>

              <ul role="list" className="divide-y divide-gray-200">
                {Object.keys(needsByType).length === 0 ? (
                  <li className="px-4 py-3 text-center text-gray-500">
                    Aucun besoin validé à envoyer. Veuillez d'abord valider des besoins.
                  </li>
                ) : (
                  Object.entries(needsByType).map(([type, needs]) => {
                    const totalQuantity = needs.reduce((sum, need) => sum + need.quantity, 0);
                    const specifications = Array.from(new Set(needs.map(need => need.specifications))).filter(Boolean).join(", ");
                    
                    return (
                      <li key={type} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-800 mr-2">{type}s:</span>
                          <span className="text-sm text-gray-500">{totalQuantity} ({specifications})</span>
                        </div>
                        <div className="flex items-center">
                          <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Validé
                          </Badge>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commentaires supplémentaires</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informations complémentaires pour le responsable des ressources..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Ajoutez des précisions ou des contextes sur ces besoins
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:w-64">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priorité</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une priorité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="normal">Normale</SelectItem>
                              <SelectItem value="high">Élevée</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Niveau de priorité pour ces besoins
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col mt-4">
                          <FormLabel>Date souhaitée</FormLabel>
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Date souhaitée pour la livraison
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/department-needs")}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendMutation.isPending || Object.keys(needsByType).length === 0}
                    className="flex items-center gap-2"
                  >
                    <SendIcon className="h-4 w-4" />
                    Envoyer au responsable
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer l'envoi</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir envoyer ces besoins au responsable des ressources? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSend}>
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Confirmer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Envoi réussi</AlertDialogTitle>
              <AlertDialogDescription>
                Les besoins ont été envoyés avec succès au responsable des ressources. Vous serez notifié lorsqu'ils seront traités.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleBackToDashboard}>
                Retour au tableau de bord
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
