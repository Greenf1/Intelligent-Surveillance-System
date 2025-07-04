import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { MetricsOverview } from "@/components/metrics-overview";
import { SurveillanceMap } from "@/components/surveillance-map";
import { AlertsPanel } from "@/components/alerts-panel";
import { ZoneConfiguration } from "@/components/zone-configuration";
import { AnalyticsPanel } from "@/components/analytics-panel";
import { CommandCenter } from "@/components/command-center";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, RefreshCw, Shield, AlertTriangle } from "lucide-react";
import type { Alert, SurveillanceZone, SurveillanceMetrics, WebSocketMessage } from "@/types/surveillance";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [zones, setZones] = useState<SurveillanceZone[]>([]);

  // Fetch initial data
  const { data: initialAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['/api/alerts?limit=20'],
  });

  const { data: initialZones, refetch: refetchZones } = useQuery({
    queryKey: ['/api/zones'],
  });

  const { data: metrics } = useQuery({
    queryKey: ['/api/metrics'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Handle WebSocket messages
  const { isConnected } = useWebSocket((message: WebSocketMessage) => {
    switch (message.type) {
      case 'NEW_ALERT':
        setAlerts(prev => [message.data, ...prev.slice(0, 19)]);
        break;
      case 'ZONE_CREATED':
        setZones(prev => [...prev, message.data]);
        break;
      case 'ZONE_UPDATED':
        setZones(prev => prev.map(zone => 
          zone.id === message.data.id ? message.data : zone
        ));
        break;
      case 'ZONE_DELETED':
        setZones(prev => prev.filter(zone => zone.id !== message.data.id));
        break;
      case 'ALERT_RESOLVED':
        setAlerts(prev => prev.map(alert =>
          alert.id === message.data.id ? { ...alert, isResolved: true } : alert
        ));
        break;
    }
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize state with fetched data
  useEffect(() => {
    if (initialAlerts) setAlerts(initialAlerts as Alert[]);
  }, [initialAlerts]);

  useEffect(() => {
    if (initialZones) setZones(initialZones as SurveillanceZone[]);
  }, [initialZones]);

  const unresolvedAlertCount = alerts.filter(alert => !alert.isResolved).length;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        alertCount={unresolvedAlertCount}
        systemStatus={systemStatus as { status: string; apis: { openai: string; database: string; } } | undefined}
      />
      
      <main className="flex-1 flex flex-col">
        {/* Enhanced Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4 glass-effect">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Dashboard de Surveillance</h2>
                  <p className="text-sm text-muted-foreground">
                    Surveillance temps réel - {currentTime.toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
              
              {/* Critical Alert Indicator */}
              {alerts.filter(a => a.type === 'critical' && !a.isResolved).length > 0 && (
                <div className="flex items-center space-x-2 bg-red-500/20 border border-red-500/30 px-3 py-2 rounded-lg critical-glow">
                  <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">
                    {alerts.filter(a => a.type === 'critical' && !a.isResolved).length} ALERTE(S) CRITIQUE(S)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced Connection Status */}
              <div className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-lg border border-border/50">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <div className="text-xs">
                  <div className="text-muted-foreground">
                    {isConnected ? 'Synchronisé' : 'Reconnexion...'}
                  </div>
                  <div className="text-green-400 font-medium">
                    Auto-refresh: 30s
                  </div>
                </div>
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${isConnected ? 'animate-spin' : ''}`} />
              </div>
              
              {/* Enhanced User Profile */}
              <div className="flex items-center space-x-3 glass-effect px-4 py-2 rounded-lg border border-border/50">
                <Avatar className="w-10 h-10 bg-primary/20 border border-primary/30">
                  <AvatarFallback>
                    <User className="w-5 h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium">Opérateur Alpha</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                      SUPERVISEUR
                    </Badge>
                    <span className="text-xs text-green-400">● En ligne</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-12 gap-6 h-full">
            
            {/* Metrics Overview */}
            <div className="col-span-12">
              <MetricsOverview metrics={metrics as SurveillanceMetrics | undefined} />
            </div>

            {/* Map and Alerts */}
            <div className="col-span-8">
              <SurveillanceMap zones={zones} alerts={alerts} />
            </div>
            
            <div className="col-span-4">
              <AlertsPanel 
                alerts={alerts} 
                onResolveAlert={(alertId) => {
                  // Optimistically update UI
                  setAlerts(prev => prev.map(alert =>
                    alert.id === alertId ? { ...alert, isResolved: true } : alert
                  ));
                  refetchAlerts();
                }}
              />
            </div>

            {/* Zone Configuration and Analytics */}
            <div className="col-span-6">
              <ZoneConfiguration 
                zones={zones} 
                onZoneUpdate={() => {
                  refetchZones();
                }}
              />
            </div>
            
            <div className="col-span-6">
              <AnalyticsPanel zones={zones} alerts={alerts} />
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
