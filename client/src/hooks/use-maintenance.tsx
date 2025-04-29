import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceReport } from '@shared/schema';
import { apiService } from '../lib/apiService';
import { useToast } from './use-toast';

export function useMaintenance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all maintenance reports
  const { data: maintenanceReports, isLoading, error } = useQuery<MaintenanceReport[]>({
    queryKey: ['maintenanceReports'],
    queryFn: () => apiService.getMaintenanceReports(),
  });

  // Get a maintenance report by ID
  const getMaintenanceReportById = (id: number) => {
    return useQuery<MaintenanceReport>({
      queryKey: ['maintenanceReport', id],
      queryFn: () => apiService.getMaintenanceReportById(id),
      enabled: !!id,
    });
  };

  // Create a new maintenance report
  const createMaintenanceReportMutation = useMutation({
    mutationFn: (reportData: any) => apiService.createMaintenanceReport(reportData),
    onSuccess: () => {
      // Invalidate the maintenance reports query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['maintenanceReports'] });
      toast({
        title: 'Panne signalée',
        description: 'La panne a été signalée avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Échec du signalement de la panne: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create a constat for a maintenance report
  const createConstatMutation = useMutation({
    mutationFn: ({ id, constatData }: { id: number; constatData: any }) => 
      apiService.createConstat(id, constatData),
    onSuccess: () => {
      // Invalidate the maintenance reports queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['maintenanceReports'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceReport'] });
      toast({
        title: 'Constat créé',
        description: 'Le constat a été créé avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Échec de la création du constat: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update the status of a maintenance report
  const updateMaintenanceStatusMutation = useMutation({
    mutationFn: ({ id, statusData }: { id: number; statusData: any }) => 
      apiService.updateMaintenanceStatus(id, statusData),
    onSuccess: () => {
      // Invalidate the maintenance reports queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['maintenanceReports'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceReport'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la panne a été mis à jour avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Échec de la mise à jour du statut: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    maintenanceReports: maintenanceReports || [],
    isLoading,
    error,
    getMaintenanceReportById,
    createMaintenanceReport: createMaintenanceReportMutation.mutate,
    isCreating: createMaintenanceReportMutation.isPending,
    createConstat: createConstatMutation.mutate,
    isCreatingConstat: createConstatMutation.isPending,
    updateMaintenanceStatus: updateMaintenanceStatusMutation.mutate,
    isUpdatingStatus: updateMaintenanceStatusMutation.isPending,
  };
}