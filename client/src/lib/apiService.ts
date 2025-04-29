import { apiRequest } from './queryClient';
import { User, ResourceNeed, Resource, MaintenanceReport, Notification, Department } from '@shared/schema';

// Types for API responses
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

// API service for connecting to Spring Boot backend
export const apiService = {
  // Authentication
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await apiRequest('POST', '/auth/login', { username, password });
    return await res.json();
  },

  register: async (userData: any): Promise<{ user: User; token: string }> => {
    const res = await apiRequest('POST', '/auth/register', userData);
    return await res.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest('POST', '/auth/logout');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await apiRequest('GET', '/auth/user');
      return await res.json();
    } catch (error) {
      return null;
    }
  },

  // Resource Needs
  getResourceNeeds: async (): Promise<ResourceNeed[]> => {
    const res = await apiRequest('GET', '/enseignants/besoins');
    return await res.json();
  },

  createResourceNeed: async (needData: any): Promise<ResourceNeed> => {
    console.log('Creating resource need with data:', needData);
    try {
      // Make sure we're sending the correct teacher ID
      // The Spring Boot API expects a valid teacherId that exists in the database
      const dataWithTeacherId = {
        ...needData,
        // Use the user's actual ID from the needData, and ensure it's a valid teacher ID
        // The backend expects the field to be named teacherId
        teacherId: needData.userId,
      };
      console.log('Sending data with teacherId:', dataWithTeacherId);

      const res = await apiRequest('POST', '/enseignants/SubmitBesoins', dataWithTeacherId);
      const result = await res.json();
      console.log('Resource need created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating resource need:', error);
      throw error;
    }
  },

  validateResourceNeeds: async (needIds: number[]): Promise<ResourceNeed[]> => {
    const res = await apiRequest('POST', '/chefdep/submit-besoins', { needIds });
    return await res.json();
  },

  // Resources
  getResources: async (): Promise<Resource[]> => {
    const res = await apiRequest('GET', '/ressources');
    return await res.json();
  },

  getAvailableResources: async (): Promise<Resource[]> => {
    const res = await apiRequest('GET', '/ressources/disponibles');
    return await res.json();
  },

  getAssignedResources: async (): Promise<Resource[]> => {
    const res = await apiRequest('GET', '/ressources/affectees');
    return await res.json();
  },

  createResource: async (resourceData: any): Promise<Resource> => {
    const res = await apiRequest('POST', '/ressources', resourceData);
    return await res.json();
  },

  updateResource: async (id: number, resourceData: any): Promise<Resource> => {
    const res = await apiRequest('PUT', `/ressources/${id}`, resourceData);
    return await res.json();
  },

  deleteResource: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/ressources/${id}`);
  },

  assignResource: async (id: number, assignmentData: any): Promise<Resource> => {
    const res = await apiRequest('PUT', `/ressources/${id}/affectation`, assignmentData);
    return await res.json();
  },

  // Maintenance Reports
  getMaintenanceReports: async (): Promise<MaintenanceReport[]> => {
    const res = await apiRequest('GET', '/pannes');
    return await res.json();
  },

  getMaintenanceReportById: async (id: number): Promise<MaintenanceReport> => {
    const res = await apiRequest('GET', `/pannes/${id}`);
    return await res.json();
  },

  createMaintenanceReport: async (reportData: any): Promise<MaintenanceReport> => {
    const res = await apiRequest('POST', '/enseignants/signal-panne', reportData);
    return await res.json();
  },

  createConstat: async (id: number, constatData: any): Promise<MaintenanceReport> => {
    const res = await apiRequest('POST', `/pannes/${id}/constat`, constatData);
    return await res.json();
  },

  updateMaintenanceStatus: async (id: number, statusData: any): Promise<MaintenanceReport> => {
    const res = await apiRequest('PUT', `/pannes/${id}/etat`, statusData);
    return await res.json();
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const res = await apiRequest('GET', '/departments');
    return await res.json();
  },

  // Appel d'offres (Call for Offers)
  getCallsForOffers: async (): Promise<CallForOffers[]> => {
    try {
      console.log('Fetching all calls for offers');
      const res = await apiRequest('GET', '/appel-offres');
      const data = await res.json();
      console.log('Calls for offers fetched successfully:', data);

      // Process the data to ensure dates are in the correct format
      const processedData = Array.isArray(data) ? data.map(call => ({
        ...call,
        startDate: call.startDate ? new Date(call.startDate) : new Date(),
        endDate: call.endDate ? new Date(call.endDate) : new Date(),
        createdAt: call.createdAt ? new Date(call.createdAt) : new Date(),
      })) : [];

      console.log('Processed calls for offers:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching calls for offers:', error);
      throw error;
    }
  },

  getCallForOffersById: async (id: number): Promise<CallForOffers> => {
    try {
      console.log(`Fetching call for offers with ID: ${id}`);
      const res = await apiRequest('GET', `/appel-offres/${id}`);
      const data = await res.json();
      console.log('Call for offers fetched successfully:', data);

      // Process the data to ensure dates are in the correct format
      const processedData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      };

      console.log('Processed call for offers:', processedData);
      return processedData;
    } catch (error) {
      console.error(`Error fetching call for offers with ID ${id}:`, error);
      throw error;
    }
  },

  createCallForOffers: async (callData: any): Promise<CallForOffers> => {
    try {
      console.log('Creating call for offers with data:', callData);
      // Ensure dates are in the correct format for the API
      const formattedData = {
        ...callData,
        startDate: callData.startDate instanceof Date ? callData.startDate.toISOString() : callData.startDate,
        endDate: callData.endDate instanceof Date ? callData.endDate.toISOString() : callData.endDate,
      };

      const res = await apiRequest('POST', '/appel-offres', formattedData);
      const data = await res.json();
      console.log('Call for offers created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating call for offers:', error);
      throw error;
    }
  },

  closeCallForOffers: async (id: number): Promise<CallForOffers> => {
    try {
      console.log(`Closing call for offers with ID: ${id}`);
      const res = await apiRequest('PUT', `/appel-offres/${id}/close`);
      const data = await res.json();
      console.log('Call for offers closed successfully:', data);
      return data;
    } catch (error) {
      console.error(`Error closing call for offers with ID ${id}:`, error);
      throw error;
    }
  },

  // Soumissions (Supplier Offers)
  getSubmissionsForCall: async (callId: number): Promise<SupplierOffer[]> => {
    try {
      console.log(`Fetching submissions for call for offers with ID: ${callId}`);
      const res = await apiRequest('GET', `/soumissions/appel-offre/${callId}`);
      const data = await res.json();
      console.log('Submissions fetched successfully:', data);
      return data;
    } catch (error) {
      console.error(`Error fetching submissions for call for offers with ID ${callId}:`, error);
      throw error;
    }
  },

  createSubmission: async (callId: number, offerData: any): Promise<SupplierOffer> => {
    try {
      console.log(`Creating submission for call for offers with ID: ${callId}`, offerData);
      // Format dates if present
      const formattedData = {
        ...offerData,
        items: offerData.items?.map((item: any) => ({
          ...item,
          deliveryDate: item.deliveryDate instanceof Date ? item.deliveryDate.toISOString() : item.deliveryDate,
        })),
      };

      const res = await apiRequest('POST', `/soumissions/appel-offre/${callId}`, formattedData);
      const data = await res.json();
      console.log('Submission created successfully:', data);
      return data;
    } catch (error) {
      console.error(`Error creating submission for call for offers with ID ${callId}:`, error);
      throw error;
    }
  },

  acceptSubmission: async (id: number): Promise<SupplierOffer> => {
    try {
      console.log(`Accepting submission with ID: ${id}`);
      const res = await apiRequest('PUT', `/soumissions/${id}/accept`);
      const data = await res.json();
      console.log('Submission accepted successfully:', data);
      return data;
    } catch (error) {
      console.error(`Error accepting submission with ID ${id}:`, error);
      throw error;
    }
  },

  rejectSubmission: async (id: number, feedback?: string): Promise<SupplierOffer> => {
    try {
      console.log(`Rejecting submission with ID: ${id}`, feedback ? `with feedback: ${feedback}` : '');
      const res = await apiRequest('PUT', `/soumissions/${id}/reject`, { feedback });
      const data = await res.json();
      console.log('Submission rejected successfully:', data);
      return data;
    } catch (error) {
      console.error(`Error rejecting submission with ID ${id}:`, error);
      throw error;
    }
  },

  // Chef de département
  getDepartmentNeeds: async (): Promise<ResourceNeed[]> => {
    const res = await apiRequest('GET', '/chefdep/besoins');
    return await res.json();
  },

  // Interventions
  getInterventions: async (): Promise<Intervention[]> => {
    const res = await apiRequest('GET', '/interventions');
    return await res.json();
  },

  getInterventionById: async (id: number): Promise<Intervention> => {
    const res = await apiRequest('GET', `/interventions/${id}`);
    return await res.json();
  },

  updateIntervention: async (id: number, interventionData: any): Promise<Intervention> => {
    const res = await apiRequest('PUT', `/interventions/${id}`, interventionData);
    return await res.json();
  },

  startIntervention: async (reportId: number): Promise<Intervention> => {
    const res = await apiRequest('POST', `/maintenance-reports/${reportId}/start-intervention`);
    return await res.json();
  },
};