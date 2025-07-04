import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const surveillanceZones = pgTable("surveillance_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius").notNull(), // in meters
  alertThreshold: text("alert_threshold").notNull(), // 'low', 'medium', 'high'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  zoneId: integer("zone_id").references(() => surveillanceZones.id),
  type: text("type").notNull(), // 'critical', 'warning', 'info'
  title: text("title").notNull(),
  description: text("description").notNull(),
  aiAnalysis: text("ai_analysis"),
  confidence: real("confidence"),
  threatLevel: integer("threat_level"), // 0-100
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const surveillanceMetrics = pgTable("surveillance_metrics", {
  id: serial("id").primaryKey(),
  activeZones: integer("active_zones").notNull(),
  alerts24h: integer("alerts_24h").notNull(),
  aiDetections: integer("ai_detections").notNull(),
  systemUptime: real("system_uptime").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Insert schemas
export const upsertUserSchema = createInsertSchema(users);

export const insertSurveillanceZoneSchema = createInsertSchema(surveillanceZones).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertSurveillanceMetricsSchema = createInsertSchema(surveillanceMetrics).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type SurveillanceZone = typeof surveillanceZones.$inferSelect;
export type InsertSurveillanceZone = z.infer<typeof insertSurveillanceZoneSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type SurveillanceMetrics = typeof surveillanceMetrics.$inferSelect;
export type InsertSurveillanceMetrics = z.infer<typeof insertSurveillanceMetricsSchema>;
