export interface SurveillanceZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  alertThreshold: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: Date;
}

export interface Alert {
  id: number;
  zoneId: number | null;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  aiAnalysis?: string;
  confidence?: number;
  threatLevel?: number;
  isResolved: boolean;
  createdAt: Date;
  zone?: SurveillanceZone;
}

export interface SurveillanceMetrics {
  id: number;
  activeZones: number;
  alerts24h: number;
  aiDetections: number;
  systemUptime: number;
  lastUpdated: Date;
}

export interface ThreatLevel {
  zoneId: number;
  zoneName: string;
  threatLevel: number;
}

export interface WebSocketMessage {
  type: 'NEW_ALERT' | 'ZONE_CREATED' | 'ZONE_UPDATED' | 'ZONE_DELETED' | 'ALERT_RESOLVED';
  data: any;
}
