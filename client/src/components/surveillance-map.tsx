import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Expand, Plus, Minus, Satellite, Layers, Target, Search } from "lucide-react";
import type { SurveillanceZone, Alert } from "@/types/surveillance";

interface SurveillanceMapProps {
  zones: SurveillanceZone[];
  alerts: Alert[];
}

export function SurveillanceMap({ zones, alerts }: SurveillanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [satelliteView, setSatelliteView] = useState(false);
  const [layersEnabled, setLayersEnabled] = useState(true);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

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
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg font-semibold">Carte de Surveillance</CardTitle>
            <Badge variant="outline" className="text-xs text-green-400 border-green-400">
              EN TEMPS RÉEL
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={heatmapEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            >
              <Flame className="w-4 h-4 mr-1" />
              Densité
            </Button>
            <Button
              variant={satelliteView ? "default" : "secondary"}
              size="sm"
              onClick={() => setSatelliteView(!satelliteView)}
            >
              <Satellite className="w-4 h-4 mr-1" />
              Satellite
            </Button>
            <Button
              variant={layersEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => setLayersEnabled(!layersEnabled)}
            >
              <Layers className="w-4 h-4 mr-1" />
              Calques
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
          className="relative w-full h-full bg-background rounded-lg border border-border overflow-hidden glass-effect"
          style={{
            backgroundImage: satelliteView 
              ? "url('https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600')"
              : "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: satelliteView 
              ? 'grayscale(10%) brightness(0.6) contrast(1.1)'
              : 'grayscale(20%) sepia(10%) hue-rotate(200deg) brightness(0.4)',
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
                  className={`absolute border-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 ${getStatusColor(status)} ${
                    status === 'critical' ? 'alert-pulse critical-glow' : ''
                  } ${selectedZone === zone.id ? 'ring-4 ring-primary/50' : ''} zone-indicator`}
                  style={{
                    ...position,
                    width: position.size,
                    height: position.size,
                  }}
                  onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`w-4 h-4 rounded-full ${getStatusDotColor(status)} ${
                      status === 'warning' ? 'animate-ping' : ''
                    } flex items-center justify-center`}>
                      {status === 'critical' && <Target className="w-2 h-2 text-white" />}
                    </div>
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 glass-effect text-foreground text-xs px-3 py-1 rounded-full whitespace-nowrap border border-border">
                    <div className="flex items-center space-x-1">
                      <span>{zone.name}</span>
                      {status === 'critical' && (
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          CRITIQUE
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Zone details panel when selected */}
                  {selectedZone === zone.id && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 glass-effect text-foreground text-xs p-3 rounded-lg border border-border min-w-48 z-10">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordonnées:</span>
                          <span>{zone.latitude.toFixed(4)}°, {zone.longitude.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rayon:</span>
                          <span>{zone.radius}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seuil:</span>
                          <span className="capitalize">{zone.alertThreshold}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Statut:</span>
                          <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'} className="text-xs">
                            {status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
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
          
          {/* Enhanced map legend with more details */}
          <div className="absolute bottom-4 left-4 glass-effect rounded-lg p-4 max-w-xs">
            <div className="flex items-center space-x-2 mb-3">
              <Search className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Légende de Surveillance</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Alerte critique</span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {alerts.filter(a => a.type === 'critical' && !a.isResolved).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">Surveillance renforcée</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {alerts.filter(a => a.type === 'warning' && !a.isResolved).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">Statut normal</span>
                </div>
                <Badge variant="outline" className="text-xs text-green-400">
                  {zones.filter(z => z.isActive).length - alerts.filter(a => !a.isResolved).length}
                </Badge>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Zones actives:</span>
                  <span className="text-primary">{zones.filter(z => z.isActive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode surveillance:</span>
                  <span className="text-green-400">24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap overlay when enabled */}
          {heatmapEnabled && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/20 rounded-full blur-xl" />
              <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-amber-500/15 rounded-full blur-lg" />
              <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-yellow-500/10 rounded-full blur-md" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
