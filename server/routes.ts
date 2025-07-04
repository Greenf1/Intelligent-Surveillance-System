import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { surveillanceService } from "./services/surveillance";
import { insertSurveillanceZoneSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Set up surveillance service callback
  surveillanceService.setAlertCallback((alert) => {
    broadcast({
      type: 'NEW_ALERT',
      data: alert,
    });
  });

  // Surveillance Zones Routes
  app.get('/api/zones', async (req, res) => {
    try {
      const zones = await storage.getAllSurveillanceZones();
      res.json(zones);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch zones' });
    }
  });

  app.post('/api/zones', async (req, res) => {
    try {
      const validatedData = insertSurveillanceZoneSchema.parse(req.body);
      const zone = await storage.createSurveillanceZone(validatedData);
      
      broadcast({
        type: 'ZONE_CREATED',
        data: zone,
      });
      
      res.status(201).json(zone);
    } catch (error) {
      res.status(400).json({ message: 'Invalid zone data' });
    }
  });

  app.put('/api/zones/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSurveillanceZoneSchema.partial().parse(req.body);
      const zone = await storage.updateSurveillanceZone(id, validatedData);
      
      if (!zone) {
        return res.status(404).json({ message: 'Zone not found' });
      }
      
      broadcast({
        type: 'ZONE_UPDATED',
        data: zone,
      });
      
      res.json(zone);
    } catch (error) {
      res.status(400).json({ message: 'Invalid zone data' });
    }
  });

  app.delete('/api/zones/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSurveillanceZone(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Zone not found' });
      }
      
      broadcast({
        type: 'ZONE_DELETED',
        data: { id },
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete zone' });
    }
  });

  // Alerts Routes
  app.get('/api/alerts', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const alerts = await storage.getRecentAlerts(limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  });

  app.put('/api/alerts/:id/resolve', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.resolveAlert(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      broadcast({
        type: 'ALERT_RESOLVED',
        data: { id },
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to resolve alert' });
    }
  });

  // Metrics Routes
  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await storage.getSurveillanceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  // Threat Levels Route
  app.get('/api/threat-levels', async (req, res) => {
    try {
      const threatLevels = await surveillanceService.getThreatLevels();
      res.json(threatLevels);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch threat levels' });
    }
  });

  // System Status Route
  app.get('/api/status', async (req, res) => {
    try {
      res.json({
        status: 'operational',
        apis: {
          openai: process.env.OPENAI_API_KEY ? 'connected' : 'disconnected',
          database: 'connected',
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get system status' });
    }
  });

  return httpServer;
}
