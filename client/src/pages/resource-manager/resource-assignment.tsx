import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckCircle, WrenchIcon, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Schema for resource assignment form
const assignmentFormSchema = z.object({
  resourceId: z.number({
    required_error: "Veuillez sélectionner une ressource",
  }),
  assignTo: z.string().min(1, "Veuillez sélectionner un destinataire"),
  assignmentDate: z.date({
    required_error: "La date d'affectation est requise",
  }),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export default function ResourceAssignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [isAssigning, setIsAssigning] = useState(false);

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

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  // Mock data for departments
  const departments = [
    { id: 1, name: "Informatique" },
    { id: 2, name: "Mathématiques" },
    { id: 3, name: "Physique" },
    { id: 4, name: "Chimie" },
  ];

  // Mock data for users
  const users = [
    { id: 1, name: "Jean Dupont", departmentId: 1, role: "teacher" },
    { id: 2, name: "Marie Martin", departmentId: 1, role: "department_head" },
    { id: 3, name: "Pierre Durand", departmentId: 2, role: "teacher" },
    { id: 4, name: "Sophie Lefebvre", departmentId: 3, role: "department_head" },
  ];

  // Mock data for current assignments
  const [assignments, setAssignments] = useState([
    { 
      id: 1, 
      resourceId: 1, 
      resourceType: "Ordinateur", 
      inventoryNumber: "INV-2023-001", 
      assignedTo: "Jean Dupont", 
      assignedToType: "user", 
      assignmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: "Pour les cours d'informatique"
    },
    { 
      id: 2, 
      resourceId: 2, 
      resourceType: "Imprimante", 
      inventoryNumber: "INV-2023-002", 
      assignedTo: "Département Informatique", 
      assignedToType: "department", 
      assignmentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      notes: "Imprimante partagée du département"
    },
  ]);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      assignmentDate: new Date(),
      notes: "",
    },
  });

  const onSubmit = (values: AssignmentFormValues) => {
    // Find the resource
    const resource = resources.find(r => r.id === values.resourceId);
    
    if (!resource) {
      toast({
        title: "Erreur",
        description: "Ressource introuvable",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new assignment
    const newAssignment = {
      id: assignments.length + 1,
      resourceId: resource.id,
      resourceType: resource.resourceType,
      inventoryNumber: resource.inventoryNumber,
      assignedTo: values.assignTo,
      assignedToType: values.assignTo.includes("Département") ? "department" : "user",
      assignmentDate: values.assignmentDate,
      notes: values.notes || ""
    };
    
    setAssignments([...assignments, newAssignment]);
    
    toast({
      title: "Affectation créée",
      description: `La ressource ${resource.resourceType} ${resource.inventoryNumber} a été affectée avec succès.`,
      variant: "default",
    });
    
    setIsAssigning(false);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "functional":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            En fonction
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <WrenchIcon className="w-3 h-3" />
            Maintenance
          </Badge>
        );
      case "out_of_order":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3" />
            Hors service
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

  // Filter only functional resources for assignment
  const functionalResources = resources.filter(resource => resource.status === "functional");

  return (
    <AppLayout title="Affectation des ressources">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Affectation des ressources</h2>
          <Button onClick={() => setIsAssigning(true)}>
            Nouvelle affectation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer une affectation</CardTitle>
            <CardDescription>
              Affectez des ressources aux départements ou aux utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Les affectations permettent de suivre l'utilisation des ressources par les départements et les utilisateurs.
                Seules les ressources en état de fonctionnement peuvent être affectées.
              </p>
            </div>

            <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle affectation</DialogTitle>
                  <DialogDescription>
                    Affectez une ressource à un département ou à un utilisateur
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="resourceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ressource</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une ressource" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {functionalResources.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  Aucune ressource disponible
                                </SelectItem>
                              ) : (
                                functionalResources.map((resource) => (
                                  <SelectItem key={resource.id} value={resource.id.toString()}>
                                    {resource.resourceType} - {resource.inventoryNumber}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affecter à</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un destinataire" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="" disabled>Sélectionner...</SelectItem>
                              <SelectItem value="header-departments" disabled className="font-semibold">
                                Départements
                              </SelectItem>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={`Département ${dept.name}`}>
                                  Département {dept.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="header-users" disabled className="font-semibold">
                                Utilisateurs
                              </SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.name}>
                                  {user.name} ({departments.find(d => d.id === user.departmentId)?.name})
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
                      name="assignmentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date d'affectation</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Notes sur l'affectation (optionnel)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAssigning(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        Créer l'affectation
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>N° Inventaire</TableHead>
                    <TableHead>Affecté à</TableHead>
                    <TableHead>Type d'affectation</TableHead>
                    <TableHead>Date d'affectation</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.resourceType} {assignment.inventoryNumber}
                      </TableCell>
                      <TableCell>{assignment.resourceType}</TableCell>
                      <TableCell>{assignment.inventoryNumber}</TableCell>
                      <TableCell>{assignment.assignedTo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "bg-gray-50 border-gray-200",
                          assignment.assignedToType === "department" 
                            ? "text-purple-700" 
                            : "text-blue-700"
                        )}>
                          {assignment.assignedToType === "department" ? "Département" : "Utilisateur"}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(assignment.assignmentDate, "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>{assignment.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {assignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucune affectation disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
