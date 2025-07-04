import { storage } from "../storage";
import { generateAlertAnalysis } from "./openai";
import type { InsertAlert, SurveillanceZone } from "@shared/schema";

export class SurveillanceService {
  private simulationInterval: NodeJS.Timeout | null = null;
  private onAlertCallback?: (alert: any) => void;

  constructor() {
    this.startSimulation();
  }

  setAlertCallback(callback: (alert: any) => void) {
    this.onAlertCallback = callback;
  }

  private startSimulation() {
    // Simulate surveillance data every 30 seconds
    this.simulationInterval = setInterval(async () => {
      await this.simulateSurveillanceData();
    }, 30000);
  }

  private async simulateSurveillanceData() {
    try {
      const zones = await storage.getAllSurveillanceZones();
      
      for (const zone of zones) {
        if (!zone.isActive) continue;

        // Simulate detection probability based on alert threshold
        const detectionProbability = this.getDetectionProbability(zone.alertThreshold);
        
        if (Math.random() < detectionProbability) {
          await this.generateZoneAlert(zone);
        }
      }

      // Update metrics
      await this.updateMetrics();
    } catch (error) {
      console.error('Surveillance simulation error:', error);
    }
  }

  private getDetectionProbability(threshold: string): number {
    switch (threshold) {
      case 'high': return 0.15; // 15% chance per 30s interval
      case 'medium': return 0.08; // 8% chance
      case 'low': return 0.03; // 3% chance
      default: return 0.05;
    }
  }

  private async generateZoneAlert(zone: SurveillanceZone) {
    // Simulate zone data
    const zoneData = {
      name: zone.name,
      populationDensity: Math.floor(Math.random() * 200) - 50, // -50% to +150% change
      movementPatterns: this.generateMovementPatterns(),
      anomalies: this.generateAnomalies(),
    };

    try {
      // Get AI analysis
      const analysis = await generateAlertAnalysis(zoneData);
      
      // Create alert
      const alertData: InsertAlert = {
        zoneId: zone.id,
        type: analysis.type,
        title: analysis.title,
        description: analysis.description,
        aiAnalysis: JSON.stringify({
          recommendations: analysis.recommendations,
          patterns: zoneData.movementPatterns,
          anomalies: zoneData.anomalies,
        }),
        confidence: analysis.confidence,
        threatLevel: analysis.threatLevel,
        isResolved: false,
      };

      const alert = await storage.createAlert(alertData);
      
      // Notify via callback (WebSocket)
      if (this.onAlertCallback) {
        this.onAlertCallback({
          ...alert,
          zone: zone,
          analysis: analysis,
        });
      }

      console.log(`Alert generated for ${zone.name}: ${analysis.title}`);
    } catch (error) {
      console.error(`Failed to generate alert for ${zone.name}:`, error);
    }
  }

  private generateMovementPatterns(): string[] {
    const patterns = [
      'coordinated movement',
      'random dispersal',
      'linear formation',
      'circular gathering',
      'rapid displacement',
      'stationary clustering',
      'directional flow',
      'convergence pattern',
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    return patterns.slice(0, count);
  }

  private generateAnomalies(): string[] {
    const anomalies = [
      'unusual density spike',
      'coordinated timing',
      'pattern deviation',
      'velocity anomaly',
      'group formation',
      'communication patterns',
      'equipment signatures',
      'behavioral clustering',
    ];
    
    const count = Math.floor(Math.random() * 2) + 1;
    return anomalies.slice(0, count);
  }

  private async updateMetrics() {
    const zones = await storage.getAllSurveillanceZones();
    const alerts = await storage.getAllAlerts();
    
    // Count alerts from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const alerts24h = alerts.filter(alert => 
      new Date(alert.createdAt!) > twentyFourHoursAgo
    ).length;

    const activeZones = zones.filter(zone => zone.isActive).length;
    
    await storage.updateSurveillanceMetrics({
      activeZones,
      alerts24h,
      aiDetections: alerts.length,
      systemUptime: 99.9 - Math.random() * 0.2, // Simulate small variations
    });
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  public async getThreatLevels() {
    const zones = await storage.getAllSurveillanceZones();
    const threatLevels = await Promise.all(
      zones.map(async (zone) => {
        const zoneAlerts = await storage.getAlertsByZone(zone.id);
        const recentAlerts = zoneAlerts.filter(alert => 
          new Date(alert.createdAt!) > new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
        );
        
        const avgThreatLevel = recentAlerts.length > 0
          ? recentAlerts.reduce((sum, alert) => sum + (alert.threatLevel || 0), 0) / recentAlerts.length
          : Math.random() * 30; // Base threat level 0-30%

        return {
          zoneId: zone.id,
          zoneName: zone.name,
          threatLevel: Math.round(avgThreatLevel),
        };
      })
    );

    return threatLevels;
  }
}

export const surveillanceService = new SurveillanceService();
