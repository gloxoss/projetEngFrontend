import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertResourceNeedSchema, insertMaintenanceReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  // Resource Needs
  app.get("/api/resource-needs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const user = req.user;
    
    if (user.role === "department_head") {
      const needs = await storage.getResourceNeedsByDepartment(user.departmentId!);
      res.json(needs);
    } else {
      const needs = await storage.getResourceNeedsByUser(user.id);
      res.json(needs);
    }
  });

  app.post("/api/resource-needs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const data = insertResourceNeedSchema.parse({
        ...req.body,
        userId: req.user.id,
        departmentId: req.user.departmentId
      });
      
      const need = await storage.createResourceNeed(data);
      res.status(201).json(need);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.put("/api/resource-needs/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const id = parseInt(req.params.id);
    const need = await storage.getResourceNeed(id);
    
    if (!need) {
      return res.status(404).json({ message: "Resource need not found" });
    }
    
    // Check if user has permission
    if (req.user.role !== "department_head" && need.userId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to modify this resource need" });
    }
    
    try {
      const updatedNeed = await storage.updateResourceNeed(id, req.body);
      res.json(updatedNeed);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/resource-needs/validate", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "department_head") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request body" });
    }
    
    try {
      const validatedNeeds = await storage.validateResourceNeeds(ids);
      res.json(validatedNeeds);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/resource-needs/send", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "department_head") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const sentNeeds = await storage.sendResourceNeeds(req.user.departmentId!);
      res.json(sentNeeds);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Resources
  app.get("/api/resources", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const departmentId = req.user.departmentId;
    if (!departmentId) {
      return res.status(400).json({ message: "User is not associated with a department" });
    }
    
    const resources = await storage.getResourcesByDepartment(departmentId);
    res.json(resources);
  });

  app.get("/api/resources/assigned", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const resources = await storage.getResourcesByUser(req.user.id);
    res.json(resources);
  });

  // Maintenance Reports
  app.get("/api/maintenance-reports", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const reports = await storage.getMaintenanceReportsByUser(req.user.id);
    res.json(reports);
  });

  app.post("/api/maintenance-reports", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const data = insertMaintenanceReportSchema.parse({
        ...req.body,
        reportedById: req.user.id
      });
      
      const report = await storage.createMaintenanceReport(data);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const notifications = await storage.getNotificationsByUser(req.user.id);
    res.json(notifications);
  });

  app.get("/api/notifications/count", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const count = await storage.getUnreadNotificationCountByUser(req.user.id);
    res.json({ count });
  });

  app.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const id = parseInt(req.params.id);
    const notification = await storage.getNotification(id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to mark this notification as read" });
    }
    
    try {
      const updatedNotification = await storage.markNotificationAsRead(id);
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Department
  app.get("/api/departments", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const departments = await storage.getAllDepartments();
    res.json(departments);
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
