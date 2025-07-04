import { 
  users, 
  surveillanceZones, 
  alerts, 
  surveillanceMetrics,
  type User, 
  type UpsertUser,
  type SurveillanceZone,
  type InsertSurveillanceZone,
  type Alert,
  type InsertAlert,
  type SurveillanceMetrics,
  type InsertSurveillanceMetrics
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Surveillance Zones
  getAllSurveillanceZones(): Promise<SurveillanceZone[]>;
  getSurveillanceZone(id: number): Promise<SurveillanceZone | undefined>;
  createSurveillanceZone(zone: InsertSurveillanceZone): Promise<SurveillanceZone>;
  updateSurveillanceZone(id: number, zone: Partial<InsertSurveillanceZone>): Promise<SurveillanceZone | undefined>;
  deleteSurveillanceZone(id: number): Promise<boolean>;

  // Alerts
  getAllAlerts(): Promise<Alert[]>;
  getRecentAlerts(limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<boolean>;
  getAlertsByZone(zoneId: number): Promise<Alert[]>;

  // Metrics
  getSurveillanceMetrics(): Promise<SurveillanceMetrics | undefined>;
  updateSurveillanceMetrics(metrics: InsertSurveillanceMetrics): Promise<SurveillanceMetrics>;
}

export class MemStorage implements IStorage {
  private surveillanceZones: Map<number, SurveillanceZone>;
  private alerts: Map<number, Alert>;
  private metrics: SurveillanceMetrics | undefined;
  private users: Map<string, User>;
  private currentZoneId: number;
  private currentAlertId: number;
  private currentMetricsId: number;

  constructor() {
    this.surveillanceZones = new Map();
    this.alerts = new Map();
    this.users = new Map();
    this.currentZoneId = 1;
    this.currentAlertId = 1;
    this.currentMetricsId = 1;

    // Initialize with sample zones
    this.initializeSampleData();
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  private initializeSampleData() {
    // Create sample surveillance zones
    const sampleZones: InsertSurveillanceZone[] = [
      {
        name: "Zone Alpha",
        latitude: 48.8566,
        longitude: 2.3522,
        radius: 500,
        alertThreshold: "high",
        isActive: true,
      },
      {
        name: "Zone Beta",
        latitude: 48.8606,
        longitude: 2.3376,
        radius: 300,
        alertThreshold: "medium",
        isActive: true,
      },
      {
        name: "Zone Gamma",
        latitude: 48.8534,
        longitude: 2.3488,
        radius: 400,
        alertThreshold: "low",
        isActive: true,
      },
      {
        name: "Zone Delta",
        latitude: 48.8584,
        longitude: 2.3558,
        radius: 350,
        alertThreshold: "medium",
        isActive: true,
      },
    ];

    sampleZones.forEach(zone => {
      const id = this.currentZoneId++;
      const newZone: SurveillanceZone = {
        ...zone,
        id,
        createdAt: new Date(),
        isActive: true,
      };
      this.surveillanceZones.set(id, newZone);
    });

    // Initialize metrics
    this.metrics = {
      id: this.currentMetricsId++,
      activeZones: this.surveillanceZones.size,
      alerts24h: 0,
      aiDetections: 0,
      systemUptime: 99.9,
      lastUpdated: new Date(),
    };
  }

  // Legacy user methods (kept for compatibility)
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firstName === username || user.lastName === username,
    );
  }

  // Surveillance Zone methods
  async getAllSurveillanceZones(): Promise<SurveillanceZone[]> {
    return Array.from(this.surveillanceZones.values());
  }

  async getSurveillanceZone(id: number): Promise<SurveillanceZone | undefined> {
    return this.surveillanceZones.get(id);
  }

  async createSurveillanceZone(zone: InsertSurveillanceZone): Promise<SurveillanceZone> {
    const id = this.currentZoneId++;
    const newZone: SurveillanceZone = {
      ...zone,
      id,
      createdAt: new Date(),
      isActive: zone.isActive ?? true,
    };
    this.surveillanceZones.set(id, newZone);
    return newZone;
  }

  async updateSurveillanceZone(id: number, zone: Partial<InsertSurveillanceZone>): Promise<SurveillanceZone | undefined> {
    const existingZone = this.surveillanceZones.get(id);
    if (!existingZone) return undefined;

    const updatedZone: SurveillanceZone = {
      ...existingZone,
      ...zone,
    };
    this.surveillanceZones.set(id, updatedZone);
    return updatedZone;
  }

  async deleteSurveillanceZone(id: number): Promise<boolean> {
    return this.surveillanceZones.delete(id);
  }

  // Alert methods
  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
    const allAlerts = await this.getAllAlerts();
    return allAlerts.slice(0, limit);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const newAlert: Alert = {
      ...alert,
      id,
      createdAt: new Date(),
      zoneId: alert.zoneId ?? null,
      aiAnalysis: alert.aiAnalysis ?? null,
      confidence: alert.confidence ?? null,
      threatLevel: alert.threatLevel ?? null,
      isResolved: alert.isResolved ?? false,
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async resolveAlert(id: number): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    const updatedAlert: Alert = {
      ...alert,
      isResolved: true,
    };
    this.alerts.set(id, updatedAlert);
    return true;
  }

  async getAlertsByZone(zoneId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      alert => alert.zoneId === zoneId
    );
  }

  // Metrics methods
  async getSurveillanceMetrics(): Promise<SurveillanceMetrics | undefined> {
    return this.metrics;
  }

  async updateSurveillanceMetrics(metrics: InsertSurveillanceMetrics): Promise<SurveillanceMetrics> {
    this.metrics = {
      id: this.currentMetricsId,
      ...metrics,
      lastUpdated: new Date(),
    };
    return this.metrics;
  }
}

export const storage = new MemStorage();
