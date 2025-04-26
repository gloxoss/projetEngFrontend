import {
  User,
  ResourceNeed,
  Resource,
  MaintenanceReport,
  Notification,
  Department
} from "@shared/schema";

// Additional types for supplier and technician features
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
  status: "pending" | "accepted" | "rejected";
  feedback?: string;
  createdAt: Date;
}

interface Intervention {
  id: number;
  maintenanceReportId: number;
  technicianId: number;
  startDate: Date;
  endDate: Date | null;
  status: "pending" | "in_progress" | "completed";
  notes: string;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

// Mock user data for different roles
const mockUsers: Record<string, User> = {
  teacher: {
    id: 1,
    username: "teacher",
    password: "password", // In a real app, this would be hashed
    fullName: "Jean Dupont",
    role: "teacher",
    departmentId: 1,
  },
  department_head: {
    id: 2,
    username: "department_head",
    password: "password",
    fullName: "Marie Martin",
    role: "department_head",
    departmentId: 1,
  },
  resource_manager: {
    id: 3,
    username: "resource_manager",
    password: "password",
    fullName: "Pierre Durand",
    role: "resource_manager",
    departmentId: null,
  },
  technician: {
    id: 4,
    username: "technician",
    password: "password",
    fullName: "Sophie Lefebvre",
    role: "technician",
    departmentId: null,
  },
  supplier: {
    id: 5,
    username: "supplier",
    password: "password",
    fullName: "Tech Solutions",
    role: "supplier",
    departmentId: null,
  },
};

// Mock departments
const mockDepartments: Department[] = [
  {
    id: 1,
    name: "Informatique",
    headId: 2,
  },
  {
    id: 2,
    name: "Mathématiques",
    headId: null,
  },
  {
    id: 3,
    name: "Physique",
    headId: null,
  },
];

// Mock resource needs
const mockResourceNeeds: ResourceNeed[] = [
  {
    id: 1,
    resourceType: "Ordinateur",
    quantity: 5,
    specifications: "Intel Core i7, 16GB RAM, 512GB SSD",
    comments: "Pour le laboratoire d'informatique",
    status: "pending",
    userId: 1,
    departmentId: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: null,
  },
  {
    id: 2,
    resourceType: "Imprimante",
    quantity: 2,
    specifications: "Laser, couleur, réseau",
    comments: "Pour la salle des professeurs",
    status: "validated",
    userId: 1,
    departmentId: 1,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    resourceType: "Projecteur",
    quantity: 3,
    specifications: "4K, 5000 lumens",
    comments: "Pour les salles de cours",
    status: "sent",
    userId: 2,
    departmentId: 1,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

// Mock resources
const mockResources: Resource[] = [
  {
    id: 1,
    resourceType: "Ordinateur",
    inventoryNumber: "ORD-001",
    specifications: "Intel Core i7, 16GB RAM, 512GB SSD",
    status: "functional",
    assignedToId: 1,
    departmentId: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: null,
  },
  {
    id: 2,
    resourceType: "Imprimante",
    inventoryNumber: "IMP-001",
    specifications: "Laser, couleur, réseau",
    status: "functional",
    assignedToId: null,
    departmentId: 1,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: null,
  },
  {
    id: 3,
    resourceType: "Scanner",
    inventoryNumber: "SCA-001",
    specifications: "Haute résolution, chargeur automatique",
    status: "maintenance",
    assignedToId: null,
    departmentId: 1,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    resourceType: "Projecteur",
    inventoryNumber: "PRO-001",
    specifications: "4K, 5000 lumens",
    status: "out_of_order",
    assignedToId: null,
    departmentId: 2,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// Mock maintenance reports
const mockMaintenanceReports: MaintenanceReport[] = [
  {
    id: 1,
    resourceId: 3,
    description: "Le scanner ne s'allume plus",
    occurrenceDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    urgency: "medium",
    status: "in_progress",
    reportedById: 1,
    assignedToId: 4,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    resourceId: 4,
    description: "Le projecteur affiche des couleurs incorrectes",
    occurrenceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    urgency: "high",
    status: "pending",
    reportedById: 2,
    assignedToId: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: null,
  },
];

// Mock calls for offers
const mockCallsForOffers: CallForOffers[] = [
  {
    id: 1,
    title: "Appel d'offres - Ordinateurs",
    description: "Appel d'offres pour l'acquisition d'ordinateurs pour le département d'informatique",
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: "open",
    resources: [
      { type: "Ordinateur", quantity: 10, specifications: "Intel Core i7, 16GB RAM, 512GB SSD" },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: "Appel d'offres - Imprimantes",
    description: "Appel d'offres pour l'acquisition d'imprimantes laser",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    status: "open",
    resources: [
      { type: "Imprimante", quantity: 5, specifications: "Laser, couleur, réseau" },
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: "Appel d'offres - Projecteurs",
    description: "Appel d'offres pour l'acquisition de projecteurs pour les salles de cours",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: "closed",
    resources: [
      { type: "Projecteur", quantity: 3, specifications: "4K, 5000 lumens" },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    title: "Appel d'offres - Scanners",
    description: "Appel d'offres pour l'acquisition de scanners haute résolution",
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: "awarded",
    resources: [
      { type: "Scanner", quantity: 2, specifications: "Haute résolution, chargeur automatique" },
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
];

// Mock supplier offers
const mockSupplierOffers: SupplierOffer[] = [
  {
    id: 1,
    callForOffersId: 1,
    supplierId: 5, // Tech Solutions
    totalPrice: 12000,
    items: [
      {
        resourceType: "Ordinateur",
        quantity: 10,
        brand: "Dell",
        unitPrice: 1200,
        warranty: 24,
        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    callForOffersId: 2,
    supplierId: 5, // Tech Solutions
    totalPrice: 3000,
    items: [
      {
        resourceType: "Imprimante",
        quantity: 5,
        brand: "HP",
        unitPrice: 600,
        warranty: 12,
        deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    callForOffersId: 3,
    supplierId: 5, // Tech Solutions
    totalPrice: 4500,
    items: [
      {
        resourceType: "Projecteur",
        quantity: 3,
        brand: "Epson",
        unitPrice: 1500,
        warranty: 24,
        deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
    status: "accepted",
    feedback: "Offre acceptée pour son excellent rapport qualité-prix et la garantie étendue.",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    callForOffersId: 4,
    supplierId: 5, // Tech Solutions
    totalPrice: 2400,
    items: [
      {
        resourceType: "Scanner",
        quantity: 2,
        brand: "Canon",
        unitPrice: 1200,
        warranty: 12,
        deliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
    status: "rejected",
    feedback: "Prix trop élevé par rapport aux autres offres reçues.",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];

// Mock interventions
const mockInterventions: Intervention[] = [
  {
    id: 1,
    maintenanceReportId: 1,
    technicianId: 4, // Sophie Lefebvre
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: null,
    status: "in_progress",
    notes: "Problème d'alimentation identifié. Pièce de rechange commandée.",
    resolution: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    maintenanceReportId: 2,
    technicianId: 4, // Sophie Lefebvre
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endDate: null,
    status: "pending",
    notes: "Intervention planifiée pour demain.",
    resolution: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: null,
  },
];

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    title: "Besoin validé",
    message: "Votre demande d'ordinateurs a été validée par le chef de département",
    type: "success",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    userId: 2,
    title: "Nouveau besoin",
    message: "Un nouveau besoin a été soumis par Jean Dupont",
    type: "info",
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    userId: 3,
    title: "Besoin envoyé",
    message: "Un besoin validé a été envoyé par le département d'informatique",
    type: "info",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    userId: 4,
    title: "Nouvelle panne",
    message: "Une nouvelle panne a été signalée pour le scanner SCA-001",
    type: "warning",
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    userId: 5,
    title: "Offre acceptée",
    message: "Votre offre pour l'appel d'offres 'Projecteurs' a été acceptée",
    type: "success",
    isRead: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 6,
    userId: 5,
    title: "Offre rejetée",
    message: "Votre offre pour l'appel d'offres 'Scanners' a été rejetée",
    type: "error",
    isRead: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 7,
    userId: 5,
    title: "Nouvel appel d'offres",
    message: "Un nouvel appel d'offres pour des ordinateurs a été publié",
    type: "info",
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

// Store the current user in localStorage
let currentUser: User | null = null;

// Mock API service
export const mockService = {
  // Authentication
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    // Find the user
    const user = Object.values(mockUsers).find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Store the current user
    currentUser = user;

    // Generate a fake token
    const token = `mock_token_${user.role}_${Date.now()}`;

    // Store the token in localStorage
    localStorage.setItem("jwt_token", token);

    return { user, token };
  },

  register: async (userData: any): Promise<{ user: User; token: string }> => {
    // In a real app, this would create a new user
    // For mock purposes, we'll just return a predefined user based on the role
    const role = userData.role || "teacher";
    const user = { ...mockUsers[role], username: userData.username, fullName: userData.fullName };

    // Store the current user
    currentUser = user;

    // Generate a fake token
    const token = `mock_token_${user.role}_${Date.now()}`;

    // Store the token in localStorage
    localStorage.setItem("jwt_token", token);

    return { user, token };
  },

  logout: async (): Promise<void> => {
    // Clear the current user
    currentUser = null;

    // Remove the token from localStorage
    localStorage.removeItem("jwt_token");
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Check if we have a token
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      return null;
    }

    // If we have a current user, return it
    if (currentUser) {
      return currentUser;
    }

    // Otherwise, extract the role from the token and return a predefined user
    const rolePart = token.split("_")[1];
    if (rolePart && mockUsers[rolePart]) {
      currentUser = mockUsers[rolePart];
      return currentUser;
    }

    return null;
  },

  // Resource Needs
  getResourceNeeds: async (): Promise<ResourceNeed[]> => {
    // In a real app, this would filter based on user role and department
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (currentUser.role === "department_head") {
      // Department heads see needs from their department
      return mockResourceNeeds.filter(need => need.departmentId === currentUser?.departmentId);
    } else if (currentUser.role === "resource_manager") {
      // Resource managers see all needs
      return mockResourceNeeds;
    } else if (currentUser.role === "teacher") {
      // Teachers see their own needs
      return mockResourceNeeds.filter(need => need.userId === currentUser?.id);
    }

    return [];
  },

  createResourceNeed: async (needData: any): Promise<ResourceNeed> => {
    // In a real app, this would create a new need in the database
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const newNeed: ResourceNeed = {
      id: mockResourceNeeds.length + 1,
      resourceType: needData.resourceType,
      quantity: needData.quantity,
      specifications: needData.specifications || null,
      comments: needData.comments || null,
      status: "pending",
      userId: currentUser.id,
      departmentId: currentUser.departmentId || 1,
      createdAt: new Date(),
      updatedAt: null,
    };

    // Add to mock data
    mockResourceNeeds.push(newNeed);

    return newNeed;
  },

  validateResourceNeeds: async (needIds: number[]): Promise<ResourceNeed[]> => {
    // In a real app, this would update needs in the database
    if (!currentUser || currentUser.role !== "department_head") {
      throw new Error("Not authorized");
    }

    const updatedNeeds: ResourceNeed[] = [];

    for (const id of needIds) {
      const need = mockResourceNeeds.find(n => n.id === id);
      if (need && need.status === "pending") {
        need.status = "validated";
        need.updatedAt = new Date();
        updatedNeeds.push(need);
      }
    }

    return updatedNeeds;
  },

  // Resources
  getResources: async (): Promise<Resource[]> => {
    // In a real app, this might filter based on user role and department
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    return mockResources;
  },

  // Maintenance Reports
  getMaintenanceReports: async (): Promise<MaintenanceReport[]> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (currentUser.role === "technician") {
      // Technicians see all reports
      return mockMaintenanceReports;
    } else {
      // Others see reports related to their department
      const departmentResources = mockResources.filter(r => r.departmentId === currentUser?.departmentId);
      const departmentResourceIds = departmentResources.map(r => r.id);
      return mockMaintenanceReports.filter(r => departmentResourceIds.includes(r.resourceId));
    }
  },

  createMaintenanceReport: async (reportData: any): Promise<MaintenanceReport> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const newReport: MaintenanceReport = {
      id: mockMaintenanceReports.length + 1,
      resourceId: reportData.resourceId,
      description: reportData.description,
      occurrenceDate: reportData.occurrenceDate || new Date(),
      urgency: reportData.urgency,
      status: "pending",
      reportedById: currentUser.id,
      assignedToId: null,
      createdAt: new Date(),
      updatedAt: null,
    };

    // Add to mock data
    mockMaintenanceReports.push(newReport);

    return newReport;
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    // Return notifications for the current user
    return mockNotifications.filter(n => n.userId === currentUser?.id);
  },

  markNotificationAsRead: async (id: number): Promise<void> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const notification = mockNotifications.find(n => n.id === id && n.userId === currentUser?.id);
    if (notification) {
      notification.isRead = true;
    }
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    return mockDepartments;
  },

  // Supplier functionality
  getCallsForOffers: async (): Promise<CallForOffers[]> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (currentUser.role === "supplier") {
      // Suppliers see only open calls
      return mockCallsForOffers.filter(call => call.status === "open");
    } else if (currentUser.role === "resource_manager") {
      // Resource managers see all calls
      return mockCallsForOffers;
    }

    return [];
  },

  getCallForOffersById: async (id: number): Promise<CallForOffers | null> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const call = mockCallsForOffers.find(c => c.id === id);

    if (!call) {
      return null;
    }

    if (currentUser.role === "supplier" && call.status !== "open") {
      throw new Error("Not authorized");
    }

    return call;
  },

  getSupplierOffers: async (): Promise<SupplierOffer[]> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (currentUser.role === "supplier") {
      // Suppliers see only their own offers
      return mockSupplierOffers.filter(offer => offer.supplierId === currentUser?.id);
    } else if (currentUser.role === "resource_manager") {
      // Resource managers see all offers
      return mockSupplierOffers;
    }

    return [];
  },

  getSupplierOffersByCallId: async (callId: number): Promise<SupplierOffer[]> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (currentUser.role === "supplier") {
      // Suppliers see only their own offers for this call
      return mockSupplierOffers.filter(
        offer => offer.callForOffersId === callId && offer.supplierId === currentUser?.id
      );
    } else if (currentUser.role === "resource_manager") {
      // Resource managers see all offers for this call
      return mockSupplierOffers.filter(offer => offer.callForOffersId === callId);
    }

    return [];
  },

  createSupplierOffer: async (offerData: any): Promise<SupplierOffer> => {
    if (!currentUser || currentUser.role !== "supplier") {
      throw new Error("Not authorized");
    }

    // Check if the call exists and is open
    const call = mockCallsForOffers.find(c => c.id === offerData.callForOffersId);
    if (!call || call.status !== "open") {
      throw new Error("Call for offers not found or not open");
    }

    // Calculate total price
    const totalPrice = offerData.items.reduce(
      (total: number, item: any) => total + (item.unitPrice * item.quantity),
      0
    );

    const newOffer: SupplierOffer = {
      id: mockSupplierOffers.length + 1,
      callForOffersId: offerData.callForOffersId,
      supplierId: currentUser.id,
      totalPrice,
      items: offerData.items.map((item: any) => ({
        resourceType: item.resourceType,
        quantity: item.quantity,
        brand: item.brand,
        unitPrice: item.unitPrice,
        warranty: item.warranty,
        deliveryDate: item.deliveryDate,
      })),
      status: "pending",
      createdAt: new Date(),
    };

    // Add to mock data
    mockSupplierOffers.push(newOffer);

    return newOffer;
  },

  // Technician functionality
  getInterventions: async (): Promise<Intervention[]> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (currentUser.role === "technician") {
      // Technicians see interventions assigned to them
      return mockInterventions.filter(intervention => intervention.technicianId === currentUser?.id);
    } else if (currentUser.role === "resource_manager") {
      // Resource managers see all interventions
      return mockInterventions;
    }

    return [];
  },

  getInterventionById: async (id: number): Promise<Intervention | null> => {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const intervention = mockInterventions.find(i => i.id === id);

    if (!intervention) {
      return null;
    }

    if (currentUser.role === "technician" && intervention.technicianId !== currentUser.id) {
      throw new Error("Not authorized");
    }

    return intervention;
  },

  startIntervention: async (reportId: number): Promise<Intervention> => {
    if (!currentUser || currentUser.role !== "technician") {
      throw new Error("Not authorized");
    }

    // Check if the report exists
    const report = mockMaintenanceReports.find(r => r.id === reportId);
    if (!report) {
      throw new Error("Maintenance report not found");
    }

    // Check if there's already an intervention for this report
    const existingIntervention = mockInterventions.find(i => i.maintenanceReportId === reportId);
    if (existingIntervention) {
      throw new Error("An intervention already exists for this report");
    }

    // Create a new intervention
    const newIntervention: Intervention = {
      id: mockInterventions.length + 1,
      maintenanceReportId: reportId,
      technicianId: currentUser.id,
      startDate: new Date(),
      endDate: null,
      status: "in_progress",
      notes: "Intervention démarrée",
      resolution: null,
      createdAt: new Date(),
      updatedAt: null,
    };

    // Update the report status
    report.status = "in_progress";
    report.assignedToId = currentUser.id;
    report.updatedAt = new Date();

    // Add to mock data
    mockInterventions.push(newIntervention);

    return newIntervention;
  },

  updateIntervention: async (id: number, data: any): Promise<Intervention> => {
    if (!currentUser || currentUser.role !== "technician") {
      throw new Error("Not authorized");
    }

    // Find the intervention
    const intervention = mockInterventions.find(i => i.id === id);
    if (!intervention) {
      throw new Error("Intervention not found");
    }

    // Check if the technician is assigned to this intervention
    if (intervention.technicianId !== currentUser.id) {
      throw new Error("Not authorized");
    }

    // Update the intervention
    if (data.notes) {
      intervention.notes = data.notes;
    }

    if (data.status) {
      intervention.status = data.status;
    }

    if (data.resolution) {
      intervention.resolution = data.resolution;
    }

    if (data.status === "completed") {
      intervention.endDate = new Date();

      // Update the maintenance report
      const report = mockMaintenanceReports.find(r => r.id === intervention.maintenanceReportId);
      if (report) {
        report.status = "resolved";
        report.updatedAt = new Date();
      }
    }

    intervention.updatedAt = new Date();

    return intervention;
  },
};

// Function to intercept fetch requests and route them to the mock service
export function setupMockApi() {
  const originalFetch = window.fetch;

  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === "string" ? input : (input instanceof Request ? input.url : input.toString());
    const method = init?.method || "GET";

    console.log(`Mock API: ${method} ${url}`);

    // Extract the path from the URL
    const path = url.replace(/^(https?:\/\/[^/]+)?\/api\//, "");

    // Parse the request body if present
    let body = null;
    if (init?.body) {
      try {
        body = JSON.parse(init.body.toString());
      } catch (e) {
        console.error("Failed to parse request body:", e);
      }
    }

    // Handle different API endpoints
    try {
      let response: any;

      // Auth endpoints
      if (path === "auth/login" && method === "POST") {
        response = await mockService.login(body.username, body.password);
      } else if (path === "auth/register" && method === "POST") {
        response = await mockService.register(body);
      } else if (path === "auth/logout" && method === "POST") {
        await mockService.logout();
        response = { success: true };
      } else if (path === "auth/user" && method === "GET") {
        response = await mockService.getCurrentUser();
        if (!response) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
      }

      // Resource needs endpoints
      else if (path === "resource-needs" && method === "GET") {
        response = await mockService.getResourceNeeds();
      } else if (path === "resource-needs" && method === "POST") {
        response = await mockService.createResourceNeed(body);
      } else if (path.match(/^resource-needs\/validate$/) && method === "POST") {
        response = await mockService.validateResourceNeeds(body);
      }

      // Resources endpoints
      else if (path === "resources" && method === "GET") {
        response = await mockService.getResources();
      }

      // Maintenance reports endpoints
      else if (path === "maintenance-reports" && method === "GET") {
        response = await mockService.getMaintenanceReports();
      } else if (path === "maintenance-reports" && method === "POST") {
        response = await mockService.createMaintenanceReport(body);
      }

      // Notifications endpoints
      else if (path === "notifications" && method === "GET") {
        response = await mockService.getNotifications();
      } else if (path.match(/^notifications\/\d+\/read$/) && method === "POST") {
        const id = parseInt(path.split("/")[1]);
        await mockService.markNotificationAsRead(id);
        response = { success: true };
      }

      // Departments endpoints
      else if (path === "departments" && method === "GET") {
        response = await mockService.getDepartments();
      }

      // Supplier endpoints
      else if (path === "calls-for-offers" && method === "GET") {
        response = await mockService.getCallsForOffers();
      } else if (path.match(/^calls-for-offers\/\d+$/) && method === "GET") {
        const id = parseInt(path.split("/")[1]);
        response = await mockService.getCallForOffersById(id);
        if (!response) {
          return new Response(JSON.stringify({ error: "Call for offers not found" }), { status: 404 });
        }
      } else if (path === "supplier-offers" && method === "GET") {
        response = await mockService.getSupplierOffers();
      } else if (path.match(/^calls-for-offers\/\d+\/offers$/) && method === "GET") {
        const callId = parseInt(path.split("/")[1]);
        response = await mockService.getSupplierOffersByCallId(callId);
      } else if (path === "supplier-offers" && method === "POST") {
        response = await mockService.createSupplierOffer(body);
      }

      // Technician endpoints
      else if (path === "interventions" && method === "GET") {
        response = await mockService.getInterventions();
      } else if (path.match(/^interventions\/\d+$/) && method === "GET") {
        const id = parseInt(path.split("/")[1]);
        response = await mockService.getInterventionById(id);
        if (!response) {
          return new Response(JSON.stringify({ error: "Intervention not found" }), { status: 404 });
        }
      } else if (path.match(/^maintenance-reports\/\d+\/start-intervention$/) && method === "POST") {
        const reportId = parseInt(path.split("/")[1]);
        response = await mockService.startIntervention(reportId);
      } else if (path.match(/^interventions\/\d+$/) && method === "PUT") {
        const id = parseInt(path.split("/")[1]);
        response = await mockService.updateIntervention(id, body);
      }

      // If no mock handler is found, pass through to the original fetch
      else {
        console.log(`No mock handler for ${method} ${path}, passing through to original fetch`);
        return originalFetch(input, init);
      }

      // Return a successful response
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Mock API error:", error);

      // Return an error response
      return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
        status: error.message === "Not authenticated" || error.message === "Not authorized" ? 401 : 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };

  console.log("Mock API service initialized");
}
