import { pgTable, varchar, integer, boolean, timestamp, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication and roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // "department_head", "teacher", "resource_manager", "supplier", "technician"
  departmentId: integer("department_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  departmentId: true,
});

// Department table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  headId: integer("head_id"),
});

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  headId: true,
});

// Resource Need table
export const resourceNeeds = pgTable("resource_needs", {
  id: serial("id").primaryKey(),
  resourceType: text("resource_type").notNull(),
  quantity: integer("quantity").notNull(),
  specifications: text("specifications"),
  comments: text("comments"),
  status: text("status").notNull().default("pending"), // pending, validated, rejected, sent
  userId: integer("user_id").notNull(),
  departmentId: integer("department_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertResourceNeedSchema = createInsertSchema(resourceNeeds).pick({
  resourceType: true,
  quantity: true,
  specifications: true,
  comments: true,
  userId: true,
  departmentId: true,
});

// Resource table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  resourceType: text("resource_type").notNull(),
  inventoryNumber: text("inventory_number").notNull().unique(),
  specifications: text("specifications"),
  status: text("status").notNull().default("functional"), // functional, maintenance, out_of_order
  assignedToId: integer("assigned_to_id"),
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  resourceType: true,
  inventoryNumber: true,
  specifications: true,
  status: true,
  assignedToId: true,
  departmentId: true,
});

// Maintenance Report table
export const maintenanceReports = pgTable("maintenance_reports", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull(),
  description: text("description").notNull(),
  occurrenceDate: timestamp("occurrence_date").notNull(),
  urgency: text("urgency").notNull(), // low, medium, high, critical
  status: text("status").notNull().default("pending"), // pending, in_progress, resolved
  reportedById: integer("reported_by_id").notNull(),
  assignedToId: integer("assigned_to_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertMaintenanceReportSchema = createInsertSchema(maintenanceReports).pick({
  resourceId: true,
  description: true,
  occurrenceDate: true,
  urgency: true,
  reportedById: true,
  assignedToId: true,
});

// Notification table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type ResourceNeed = typeof resourceNeeds.$inferSelect;
export type InsertResourceNeed = z.infer<typeof insertResourceNeedSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type MaintenanceReport = typeof maintenanceReports.$inferSelect;
export type InsertMaintenanceReport = z.infer<typeof insertMaintenanceReportSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
