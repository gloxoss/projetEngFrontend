import {
  User,
  InsertUser,
  Department,
  InsertDepartment,
  ResourceNeed,
  InsertResourceNeed,
  Resource,
  InsertResource,
  MaintenanceReport,
  InsertMaintenanceReport,
  Notification,
  InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersByDepartment(departmentId: number): Promise<User[]>;
  
  // Department methods
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<Department>): Promise<Department | undefined>;
  getAllDepartments(): Promise<Department[]>;
  
  // Resource Need methods
  getResourceNeed(id: number): Promise<ResourceNeed | undefined>;
  createResourceNeed(resourceNeed: InsertResourceNeed): Promise<ResourceNeed>;
  updateResourceNeed(id: number, resourceNeed: Partial<ResourceNeed>): Promise<ResourceNeed | undefined>;
  getResourceNeedsByUser(userId: number): Promise<ResourceNeed[]>;
  getResourceNeedsByDepartment(departmentId: number): Promise<ResourceNeed[]>;
  validateResourceNeeds(ids: number[]): Promise<ResourceNeed[]>;
  sendResourceNeeds(departmentId: number): Promise<ResourceNeed[]>;
  
  // Resource methods
  getResource(id: number): Promise<Resource | undefined>;
  getResourceByInventoryNumber(inventoryNumber: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  getResourcesByDepartment(departmentId: number): Promise<Resource[]>;
  getResourcesByUser(userId: number): Promise<Resource[]>;
  
  // Maintenance Report methods
  getMaintenanceReport(id: number): Promise<MaintenanceReport | undefined>;
  createMaintenanceReport(report: InsertMaintenanceReport): Promise<MaintenanceReport>;
  updateMaintenanceReport(id: number, report: Partial<MaintenanceReport>): Promise<MaintenanceReport | undefined>;
  getMaintenanceReportsByUser(userId: number): Promise<MaintenanceReport[]>;
  getMaintenanceReportsByDepartment(departmentId: number): Promise<MaintenanceReport[]>;
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  getUnreadNotificationCountByUser(userId: number): Promise<number>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private departments: Map<number, Department>;
  private resourceNeeds: Map<number, ResourceNeed>;
  private resources: Map<number, Resource>;
  private maintenanceReports: Map<number, MaintenanceReport>;
  private notifications: Map<number, Notification>;
  
  private userId: number;
  private departmentId: number;
  private resourceNeedId: number;
  private resourceId: number;
  private maintenanceReportId: number;
  private notificationId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.departments = new Map();
    this.resourceNeeds = new Map();
    this.resources = new Map();
    this.maintenanceReports = new Map();
    this.notifications = new Map();
    
    this.userId = 1;
    this.departmentId = 1;
    this.resourceNeedId = 1;
    this.resourceId = 1;
    this.maintenanceReportId = 1;
    this.notificationId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with some data
    this.initializeData();
  }
  
  private initializeData() {
    // Sample department
    const department: Department = {
      id: this.departmentId++,
      name: "Informatique",
      headId: null
    };
    this.departments.set(department.id, department);
    
    // Sample users
    const headUser: User = {
      id: this.userId++,
      username: "chef",
      password: "$2b$10$I8B6DT4Pb/5RwP1J3QgE8OgXVbI5gTk4vZ4QR3i0o4hpGVN1P5Tva", // "password"
      fullName: "Dr. Professeur",
      role: "department_head",
      departmentId: department.id
    };
    this.users.set(headUser.id, headUser);
    
    const teacherUser: User = {
      id: this.userId++,
      username: "enseignant",
      password: "$2b$10$I8B6DT4Pb/5RwP1J3QgE8OgXVbI5gTk4vZ4QR3i0o4hpGVN1P5Tva", // "password"
      fullName: "Dr. Martin",
      role: "teacher",
      departmentId: department.id
    };
    this.users.set(teacherUser.id, teacherUser);
    
    // Update department with head ID
    department.headId = headUser.id;
    this.departments.set(department.id, department);
    
    // Sample resources
    const resources = [
      {
        id: this.resourceId++,
        resourceType: "Ordinateur",
        inventoryNumber: "INV-2023-001",
        specifications: "i5, 16GB RAM, 512GB SSD",
        status: "functional",
        assignedToId: teacherUser.id,
        departmentId: department.id,
        createdAt: new Date("2023-03-10"),
        updatedAt: null
      },
      {
        id: this.resourceId++,
        resourceType: "Imprimante",
        inventoryNumber: "INV-2023-002",
        specifications: "Laser, Couleur, Wifi",
        status: "functional",
        assignedToId: null,
        departmentId: department.id,
        createdAt: new Date("2023-03-05"),
        updatedAt: null
      },
      {
        id: this.resourceId++,
        resourceType: "Scanner",
        inventoryNumber: "INV-2023-003",
        specifications: "Pro, Auto Document Feeder",
        status: "maintenance",
        assignedToId: null,
        departmentId: department.id,
        createdAt: new Date("2023-02-28"),
        updatedAt: null
      }
    ];
    
    resources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
    
    // Sample resource needs
    const resourceNeeds = [
      {
        id: this.resourceNeedId++,
        resourceType: "Ordinateur",
        quantity: 3,
        specifications: "i7, 32GB RAM, 1TB SSD",
        comments: "",
        status: "pending",
        userId: teacherUser.id,
        departmentId: department.id,
        createdAt: new Date("2023-02-12"),
        updatedAt: null
      },
      {
        id: this.resourceNeedId++,
        resourceType: "Imprimante",
        quantity: 1,
        specifications: "Laser couleur, recto-verso automatique",
        comments: "",
        status: "validated",
        userId: teacherUser.id,
        departmentId: department.id,
        createdAt: new Date("2023-02-05"),
        updatedAt: new Date("2023-02-07")
      }
    ];
    
    resourceNeeds.forEach(need => {
      this.resourceNeeds.set(need.id, need);
    });
    
    // Sample maintenance reports
    const maintenanceReports = [
      {
        id: this.maintenanceReportId++,
        resourceId: 3, // Scanner
        description: "Le chargeur automatique ne fonctionne plus, les feuilles restent bloquées.",
        occurrenceDate: new Date("2023-02-28"),
        urgency: "medium",
        status: "in_progress",
        reportedById: teacherUser.id,
        assignedToId: null,
        createdAt: new Date("2023-02-28"),
        updatedAt: null
      }
    ];
    
    maintenanceReports.forEach(report => {
      this.maintenanceReports.set(report.id, report);
    });
    
    // Sample notifications
    const notifications = [
      {
        id: this.notificationId++,
        userId: teacherUser.id,
        title: "Ressource affectée",
        message: "Imprimante HP LaserJet Pro vous a été affectée",
        type: "success",
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        id: this.notificationId++,
        userId: teacherUser.id,
        title: "Besoin validé",
        message: "Votre demande d'ordinateur a été validée",
        type: "info",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: this.notificationId++,
        userId: teacherUser.id,
        title: "Maintenance prévue",
        message: "Maintenance des serveurs prévue ce weekend",
        type: "warning",
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
    
    notifications.forEach(notification => {
      this.notifications.set(notification.id, notification);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByDepartment(departmentId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.departmentId === departmentId);
  }

  // Department methods
  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = this.departmentId++;
    const newDepartment: Department = { ...department, id };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: number, department: Partial<Department>): Promise<Department | undefined> {
    const existingDepartment = this.departments.get(id);
    if (!existingDepartment) return undefined;
    
    const updatedDepartment = { ...existingDepartment, ...department };
    this.departments.set(id, updatedDepartment);
    return updatedDepartment;
  }

  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  // Resource Need methods
  async getResourceNeed(id: number): Promise<ResourceNeed | undefined> {
    return this.resourceNeeds.get(id);
  }

  async createResourceNeed(resourceNeed: InsertResourceNeed): Promise<ResourceNeed> {
    const id = this.resourceNeedId++;
    const newResourceNeed: ResourceNeed = {
      ...resourceNeed,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: null
    };
    this.resourceNeeds.set(id, newResourceNeed);
    return newResourceNeed;
  }

  async updateResourceNeed(id: number, resourceNeed: Partial<ResourceNeed>): Promise<ResourceNeed | undefined> {
    const existingResourceNeed = this.resourceNeeds.get(id);
    if (!existingResourceNeed) return undefined;
    
    const updatedResourceNeed = {
      ...existingResourceNeed,
      ...resourceNeed,
      updatedAt: new Date()
    };
    this.resourceNeeds.set(id, updatedResourceNeed);
    return updatedResourceNeed;
  }

  async getResourceNeedsByUser(userId: number): Promise<ResourceNeed[]> {
    return Array.from(this.resourceNeeds.values())
      .filter(need => need.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getResourceNeedsByDepartment(departmentId: number): Promise<ResourceNeed[]> {
    return Array.from(this.resourceNeeds.values())
      .filter(need => need.departmentId === departmentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async validateResourceNeeds(ids: number[]): Promise<ResourceNeed[]> {
    const updatedNeeds: ResourceNeed[] = [];
    
    for (const id of ids) {
      const need = this.resourceNeeds.get(id);
      if (need && need.status === "pending") {
        const updatedNeed = {
          ...need,
          status: "validated",
          updatedAt: new Date()
        };
        this.resourceNeeds.set(id, updatedNeed);
        updatedNeeds.push(updatedNeed);
        
        // Create notification for the user
        await this.createNotification({
          userId: updatedNeed.userId,
          title: "Besoin validé",
          message: `Votre demande de ${updatedNeed.quantity} ${updatedNeed.resourceType}(s) a été validée.`,
          type: "info"
        });
      }
    }
    
    return updatedNeeds;
  }

  async sendResourceNeeds(departmentId: number): Promise<ResourceNeed[]> {
    const needsToSend = Array.from(this.resourceNeeds.values())
      .filter(need => need.departmentId === departmentId && need.status === "validated");
    
    for (const need of needsToSend) {
      need.status = "sent";
      need.updatedAt = new Date();
      this.resourceNeeds.set(need.id, need);
      
      // Create notification for the department head
      const department = this.departments.get(departmentId);
      if (department && department.headId) {
        await this.createNotification({
          userId: department.headId,
          title: "Besoins envoyés",
          message: `Les besoins du département ont été envoyés au responsable des ressources.`,
          type: "success"
        });
      }
    }
    
    return needsToSend;
  }

  // Resource methods
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async getResourceByInventoryNumber(inventoryNumber: string): Promise<Resource | undefined> {
    return Array.from(this.resources.values()).find(resource => resource.inventoryNumber === inventoryNumber);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceId++;
    const newResource: Resource = {
      ...resource,
      id,
      createdAt: new Date(),
      updatedAt: null
    };
    this.resources.set(id, newResource);
    
    // Create notification for the assigned user
    if (newResource.assignedToId) {
      await this.createNotification({
        userId: newResource.assignedToId,
        title: "Ressource affectée",
        message: `${newResource.resourceType} - ${newResource.specifications} vous a été affecté(e).`,
        type: "success"
      });
    }
    
    return newResource;
  }

  async updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined> {
    const existingResource = this.resources.get(id);
    if (!existingResource) return undefined;
    
    const updatedResource = {
      ...existingResource,
      ...resource,
      updatedAt: new Date()
    };
    this.resources.set(id, updatedResource);
    
    // Create notification for the user if assignment changed
    if (resource.assignedToId && resource.assignedToId !== existingResource.assignedToId) {
      await this.createNotification({
        userId: resource.assignedToId,
        title: "Ressource affectée",
        message: `${updatedResource.resourceType} - ${updatedResource.specifications} vous a été affecté(e).`,
        type: "success"
      });
    }
    
    return updatedResource;
  }

  async getResourcesByDepartment(departmentId: number): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(resource => resource.departmentId === departmentId);
  }

  async getResourcesByUser(userId: number): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(resource => resource.assignedToId === userId);
  }

  // Maintenance Report methods
  async getMaintenanceReport(id: number): Promise<MaintenanceReport | undefined> {
    return this.maintenanceReports.get(id);
  }

  async createMaintenanceReport(report: InsertMaintenanceReport): Promise<MaintenanceReport> {
    const id = this.maintenanceReportId++;
    const newReport: MaintenanceReport = {
      ...report,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: null
    };
    this.maintenanceReports.set(id, newReport);
    
    // Update resource status
    const resource = this.resources.get(report.resourceId);
    if (resource) {
      resource.status = "maintenance";
      resource.updatedAt = new Date();
      this.resources.set(resource.id, resource);
    }
    
    return newReport;
  }

  async updateMaintenanceReport(id: number, report: Partial<MaintenanceReport>): Promise<MaintenanceReport | undefined> {
    const existingReport = this.maintenanceReports.get(id);
    if (!existingReport) return undefined;
    
    const updatedReport = {
      ...existingReport,
      ...report,
      updatedAt: new Date()
    };
    this.maintenanceReports.set(id, updatedReport);
    
    // If status changed to resolved, update resource status
    if (report.status === "resolved" && existingReport.status !== "resolved") {
      const resource = this.resources.get(existingReport.resourceId);
      if (resource) {
        resource.status = "functional";
        resource.updatedAt = new Date();
        this.resources.set(resource.id, resource);
        
        // Notify owner of resolution
        if (resource.assignedToId) {
          await this.createNotification({
            userId: resource.assignedToId,
            title: "Maintenance terminée",
            message: `La maintenance de ${resource.resourceType} (${resource.inventoryNumber}) est terminée.`,
            type: "success"
          });
        }
      }
    }
    
    return updatedReport;
  }

  async getMaintenanceReportsByUser(userId: number): Promise<MaintenanceReport[]> {
    return Array.from(this.maintenanceReports.values())
      .filter(report => report.reportedById === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMaintenanceReportsByDepartment(departmentId: number): Promise<MaintenanceReport[]> {
    // Get resources assigned to the department
    const resources = Array.from(this.resources.values())
      .filter(resource => resource.departmentId === departmentId)
      .map(resource => resource.id);
    
    return Array.from(this.maintenanceReports.values())
      .filter(report => resources.includes(report.resourceId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotificationCountByUser(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }
}

export const storage = new MemStorage();
