import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { MetricsOverview } from "@/components/metrics-overview";
import { SurveillanceMap } from "@/components/surveillance-map";
import { AlertsPanel } from "@/components/alerts-panel";
import { ZoneConfiguration } from "@/components/zone-configuration";
import { AnalyticsPanel } from "@/components/analytics-panel";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, RefreshCw } from "lucide-react";
import type { Alert, SurveillanceZone, WebSocketMessage } from "@/types/surveillance";

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
    if (initialAlerts) setAlerts(initialAlerts);
  }, [initialAlerts]);

  useEffect(() => {
    if (initialZones) setZones(initialZones);
  }, [initialZones]);

  const unresolvedAlertCount = alerts.filter(alert => !alert.isResolved).length;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        alertCount={unresolvedAlertCount}
        systemStatus={systemStatus}
      />
      
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Dashboard de Surveillance</h2>
              <p className="text-sm text-muted-foreground">
                Surveillance temps réel - {currentTime.toLocaleTimeString('fr-FR')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Auto-refresh: 30s' : 'Connexion...'}
                </span>
                <RefreshCw className={`w-3 h-3 text-muted-foreground ${isConnected ? 'animate-spin' : ''}`} />
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 bg-primary">
                  <AvatarFallback>
                    <User className="w-4 h-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium">Opérateur Alpha</p>
                  <p className="text-xs text-muted-foreground">Niveau: Superviseur</p>
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
              <MetricsOverview metrics={metrics} />
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
