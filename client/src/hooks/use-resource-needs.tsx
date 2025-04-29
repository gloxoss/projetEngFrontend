import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResourceNeed } from '@shared/schema';
import { apiService } from '../lib/apiService';
import { useToast } from './use-toast';

export function useResourceNeeds() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all resource needs
  const { data: resourceNeeds, isLoading, error } = useQuery<ResourceNeed[]>({
    queryKey: ['resourceNeeds'],
    queryFn: () => apiService.getResourceNeeds(),
  });

  // Create a new resource need
  const createResourceNeedMutation = useMutation({
    mutationFn: (needData: any) => apiService.createResourceNeed(needData),
    onSuccess: () => {
      // Invalidate the resource needs query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['resourceNeeds'] });
      toast({
        title: 'Besoin créé',
        description: 'Votre besoin a été soumis avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Échec de la création du besoin: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Validate resource needs (for department heads)
  const validateResourceNeedsMutation = useMutation({
    mutationFn: (needIds: number[]) => apiService.validateResourceNeeds(needIds),
    onSuccess: () => {
      // Invalidate the resource needs query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['resourceNeeds'] });
      toast({
        title: 'Besoins validés',
        description: 'Les besoins sélectionnés ont été validés avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Échec de la validation des besoins: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Get department needs (for department heads)
  const { data: departmentNeeds, isLoading: isDepartmentNeedsLoading } = useQuery<ResourceNeed[]>({
    queryKey: ['departmentNeeds'],
    queryFn: () => apiService.getDepartmentNeeds(),
    // Only fetch if we're on the department needs page
    enabled: false,
  });

  return {
    resourceNeeds: resourceNeeds || [],
    isLoading,
    error,
    createResourceNeed: createResourceNeedMutation.mutate,
    isCreating: createResourceNeedMutation.isPending,
    validateResourceNeeds: validateResourceNeedsMutation.mutate,
    isValidating: validateResourceNeedsMutation.isPending,
    departmentNeeds: departmentNeeds || [],
    isDepartmentNeedsLoading,
  };
}