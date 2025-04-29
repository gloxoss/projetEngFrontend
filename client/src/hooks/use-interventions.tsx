import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../lib/apiService';
import { useToast } from './use-toast';

// Types for interventions
interface Intervention {
  id: number;
  maintenanceReportId: number;
  technicianId: number;
  startDate: Date;
  endDate: Date | null;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export function useInterventions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all interventions
  const { data: interventions, isLoading, error } = useQuery<Intervention[]>({
    queryKey: ['interventions'],
    queryFn: () => apiService.getInterventions(),
  });

  // Get an intervention by ID
  const getInterventionById = (id: number) => {
    return useQuery<Intervention>({
      queryKey: ['intervention', id],
      queryFn: () => apiService.getInterventionById(id),
      enabled: !!id,
    });
  };

  // Update an intervention
  const updateInterventionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiService.updateIntervention(id, data),
    onSuccess: () => {
      // Invalidate the interventions queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      queryClient.invalidateQueries({ queryKey: ['intervention'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceReports'] });
      toast({
        title: 'Intervention mise à jour',
        description: 'L\'intervention a été mise à jour avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Échec de la mise à jour de l'intervention: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Start a new intervention
  const startInterventionMutation = useMutation({
    mutationFn: (reportId: number) => apiService.startIntervention(reportId),
    onSuccess: () => {
      // Invalidate the interventions queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceReports'] });
      toast({
        title: 'Intervention démarrée',
        description: 'L\'intervention a été démarrée avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Échec du démarrage de l'intervention: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    interventions: interventions || [],
    isLoading,
    error,
    getInterventionById,
    updateIntervention: updateInterventionMutation.mutate,
    isUpdating: updateInterventionMutation.isPending,
    startIntervention: startInterventionMutation.mutate,
    isStarting: startInterventionMutation.isPending,
  };
}
