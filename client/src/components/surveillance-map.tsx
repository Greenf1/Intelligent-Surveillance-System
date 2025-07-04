import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Expand, Plus, Minus } from "lucide-react";
import type { SurveillanceZone, Alert } from "@/types/surveillance";

interface SurveillanceMapProps {
  zones: SurveillanceZone[];
  alerts: Alert[];
}

export function SurveillanceMap({ zones, alerts }: SurveillanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);

  const getZoneStatus = (zoneId: number) => {
    const zoneAlerts = alerts.filter(alert => 
      alert.zoneId === zoneId && !alert.isResolved
    );
    
    if (zoneAlerts.some(alert => alert.type === 'critical')) {
      return 'critical';
    } else if (zoneAlerts.some(alert => alert.type === 'warning')) {
      return 'warning';
    }
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'border-red-500 bg-red-500/20';
      case 'warning': return 'border-amber-500 bg-amber-500/20';
      default: return 'border-green-500 bg-green-500/20';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Card className="bg-card border-border h-[600px]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Carte de Surveillance</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={heatmapEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            >
              <Flame className="w-4 h-4 mr-1" />
              Heatmap
            </Button>
            <Button variant="secondary" size="sm">
              <Expand className="w-4 h-4 mr-1" />
              Plein écran
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div 
          ref={mapRef}
          className="relative w-full h-full bg-background rounded-lg border border-border overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(20%) sepia(10%) hue-rotate(200deg) brightness(0.4)',
          }}
        >
          <div className="absolute inset-0">
            {/* Zone overlays */}
            {zones.map((zone, index) => {
              const status = getZoneStatus(zone.id);
              const positions = [
                { top: '20%', left: '25%', size: 96 }, // Zone Alpha
                { top: '40%', right: '15%', size: 80 }, // Zone Beta  
                { bottom: '30%', left: '15%', size: 64 }, // Zone Gamma
                { bottom: '20%', right: '25%', size: 72 }, // Zone Delta
              ];
              
              const position = positions[index] || positions[0];
              
              return (
                <div
                  key={zone.id}
                  className={`absolute border-2 rounded-full ${getStatusColor(status)} ${
                    status === 'critical' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    ...position,
                    width: position.size,
                    height: position.size,
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`w-3 h-3 rounded-full ${getStatusDotColor(status)} ${
                      status === 'warning' ? 'animate-ping' : ''
                    }`} />
                  </div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background/90 text-foreground text-xs px-2 py-1 rounded whitespace-nowrap border border-border">
                    {zone.name}
                    {status === 'critical' && ' - ALERTE'}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button
              variant="secondary"
              size="icon"
              className="w-8 h-8 bg-background/80 border border-border"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="w-8 h-8 bg-background/80 border border-border"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 border border-border rounded-lg p-3">
            <h4 className="text-xs font-semibold text-foreground mb-2">Légende</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Alerte critique</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Surveillance renforcée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
