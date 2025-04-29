import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../lib/apiService';
import { useToast } from './use-toast';

// Types for appel d'offres
interface CallForOffers {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'open' | 'closed' | 'awarded';
  resources: {
    type: string;
    quantity: number;
    specifications?: string;
  }[];
  createdAt: Date;
}

interface SupplierOffer {
  id: number;
  callForOffersId: number;
  supplierId: number;
  totalPrice: number;
  items: {
    resourceType: string;
    quantity: number;
    brand: string;
    unitPrice: number;
    warranty: number; // in months
    deliveryDate: Date;
  }[];
  status: 'pending' | 'accepted' | 'rejected';
  feedback?: string;
  createdAt: Date;
}

export function useAppelOffres() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all calls for offers
  const { data: callsForOffers, isLoading, error } = useQuery<CallForOffers[]>({
    queryKey: ['callsForOffers'],
    queryFn: async () => {
      console.log('Fetching calls for offers...');
      try {
        const data = await apiService.getCallsForOffers();
        console.log('Calls for offers fetched successfully:', data);
        return data;
      } catch (err) {
        console.error('Error fetching calls for offers:', err);
        throw err;
      }
    },
  });

  // Get a call for offers by ID
  const getCallForOffersById = (id: number) => {
    return useQuery<CallForOffers>({
      queryKey: ['callForOffers', id],
      queryFn: () => apiService.getCallForOffersById(id),
      enabled: !!id,
    });
  };

  // Create a new call for offers
  const createCallForOffersMutation = useMutation({
    mutationFn: (callData: any) => apiService.createCallForOffers(callData),
    onSuccess: () => {
      // Invalidate the calls for offers query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['callsForOffers'] });
      toast({
        title: 'Appel d\'offres créé',
        description: 'L\'appel d\'offres a été créé avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating call for offers:', error);
      toast({
        title: 'Erreur',
        description: `Échec de la création de l'appel d'offres: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Close a call for offers
  const closeCallForOffersMutation = useMutation({
    mutationFn: (id: number) => apiService.closeCallForOffers(id),
    onSuccess: () => {
      // Invalidate the calls for offers queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['callsForOffers'] });
      queryClient.invalidateQueries({ queryKey: ['callForOffers'] });
      toast({
        title: 'Appel d\'offres clôturé',
        description: 'L\'appel d\'offres a été clôturé avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error closing call for offers:', error);
      toast({
        title: 'Erreur',
        description: `Échec de la clôture de l'appel d'offres: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Get submissions for a call for offers
  const getSubmissionsForCall = (callId: number) => {
    return useQuery<SupplierOffer[]>({
      queryKey: ['submissions', callId],
      queryFn: () => apiService.getSubmissionsForCall(callId),
      enabled: !!callId,
    });
  };

  // Create a submission for a call for offers
  const createSubmissionMutation = useMutation({
    mutationFn: ({ callId, offerData }: { callId: number; offerData: any }) =>
      apiService.createSubmission(callId, offerData),
    onSuccess: () => {
      // Invalidate the submissions query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: 'Soumission créée',
        description: 'Votre offre a été soumise avec succès',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating submission:', error);
      toast({
        title: 'Erreur',
        description: `Échec de la soumission de l'offre: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Accept a submission
  const acceptSubmissionMutation = useMutation({
    mutationFn: (id: number) => apiService.acceptSubmission(id),
    onSuccess: () => {
      // Invalidate the submissions query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: 'Soumission acceptu00e9e',
        description: 'L\'offre a u00e9tu00e9 acceptu00e9e avec succu00e8s',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `u00c9chec de l'acceptation de l'offre: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Reject a submission
  const rejectSubmissionMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback?: string }) =>
      apiService.rejectSubmission(id, feedback),
    onSuccess: () => {
      // Invalidate the submissions query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: 'Soumission rejetu00e9e',
        description: 'L\'offre a u00e9tu00e9 rejetu00e9e',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `u00c9chec du rejet de l'offre: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    callsForOffers: callsForOffers || [],
    isLoading,
    error,
    getCallForOffersById,
    createCallForOffers: createCallForOffersMutation.mutate,
    isCreating: createCallForOffersMutation.isPending,
    closeCallForOffers: closeCallForOffersMutation.mutate,
    isClosing: closeCallForOffersMutation.isPending,
    getSubmissionsForCall,
    createSubmission: createSubmissionMutation.mutate,
    isSubmitting: createSubmissionMutation.isPending,
    acceptSubmission: acceptSubmissionMutation.mutate,
    isAccepting: acceptSubmissionMutation.isPending,
    rejectSubmission: rejectSubmissionMutation.mutate,
    isRejecting: rejectSubmissionMutation.isPending,
  };
}