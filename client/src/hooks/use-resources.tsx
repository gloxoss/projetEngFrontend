import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Resource } from '@shared/schema';
import { apiService } from '../lib/apiService';
import { useToast } from './use-toast';

export function useResources() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all resources
  const { data: resources, isLoading, error } = useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: () => apiService.getResources(),
  });

  // Get available resources
  const { data: availableResources, isLoading: isAvailableLoading } = useQuery<Resource[]>({
    queryKey: ['availableResources'],
    queryFn: () => apiService.getAvailableResources(),
    // Only fetch when needed
    enabled: false,
  });

  // Get assigned resources
  const { data: assignedResources, isLoading: isAssignedLoading } = useQuery<Resource[]>({
    queryKey: ['assignedResources'],
    queryFn: () => apiService.getAssignedResources(),
    // Only fetch when needed
    enabled: false,
  });

  // Create a new resource
  const createResourceMutation = useMutation({
    mutationFn: (resourceData: any) => apiService.createResource(resourceData),
    onSuccess: () => {
      // Invalidate the resources queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['availableResources'] });
      queryClient.invalidateQueries({ queryKey: ['assignedResources'] });
      toast({
        title: 'Ressource cru00e9u00e9e',
        description: 'La ressource a u00e9tu00e9 ajoutu00e9e avec succu00e8s',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `u00c9chec de la cru00e9ation de la ressource: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update a resource
  const updateResourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiService.updateResource(id, data),
    onSuccess: () => {
      // Invalidate the resources queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['availableResources'] });
      queryClient.invalidateQueries({ queryKey: ['assignedResources'] });
      toast({
        title: 'Ressource mise u00e0 jour',
        description: 'La ressource a u00e9tu00e9 mise u00e0 jour avec succu00e8s',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `u00c9chec de la mise u00e0 jour de la ressource: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete a resource
  const deleteResourceMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteResource(id),
    onSuccess: () => {
      // Invalidate the resources queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['availableResources'] });
      queryClient.invalidateQueries({ queryKey: ['assignedResources'] });
      toast({
        title: 'Ressource supprimu00e9e',
        description: 'La ressource a u00e9tu00e9 supprimu00e9e avec succu00e8s',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `u00c9chec de la suppression de la ressource: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Assign a resource
  const assignResourceMutation = useMutation({
    mutationFn: ({ id, assignmentData }: { id: number; assignmentData: any }) => 
      apiService.assignResource(id, assignmentData),
    onSuccess: () => {
      // Invalidate the resources queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['availableResources'] });
      queryClient.invalidateQueries({ queryKey: ['assignedResources'] });
      toast({
        title: 'Ressource affectu00e9e',
        description: 'La ressource a u00e9tu00e9 affectu00e9e avec succu00e8s',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `u00c9chec de l'affectation de la ressource: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    resources: resources || [],
    isLoading,
    error,
    availableResources: availableResources || [],
    isAvailableLoading,
    assignedResources: assignedResources || [],
    isAssignedLoading,
    createResource: createResourceMutation.mutate,
    isCreating: createResourceMutation.isPending,
    updateResource: updateResourceMutation.mutate,
    isUpdating: updateResourceMutation.isPending,
    deleteResource: deleteResourceMutation.mutate,
    isDeleting: deleteResourceMutation.isPending,
    assignResource: assignResourceMutation.mutate,
    isAssigning: assignResourceMutation.isPending,
  };
}