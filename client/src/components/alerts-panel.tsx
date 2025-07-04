import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Alert } from "@/types/surveillance";

interface AlertsPanelProps {
  alerts: Alert[];
  onResolveAlert: (alertId: number) => void;
}

export function AlertsPanel({ alerts, onResolveAlert }: AlertsPanelProps) {
  const queryClient = useQueryClient();

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest('PUT', `/api/alerts/${alertId}/resolve`);
    },
    onSuccess: (_, alertId) => {
      onResolveAlert(alertId);
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-amber-500/30 bg-amber-500/10';
      default: return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-blue-400';
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('fr-FR');
  };

  return (
    <Card className="bg-card border-border h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Alertes Récentes</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
            Tout effacer
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune alerte récente</p>
            </div>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-3 ${getAlertColor(alert.type)} ${
                  alert.isResolved ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${getAlertBadgeColor(alert.type)}`} />
                    <Badge variant="outline" className={`text-xs ${getAlertBadgeColor(alert.type)} border-current`}>
                      {alert.type.toUpperCase()}
                    </Badge>
                    {alert.isResolved && (
                      <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                        RÉSOLU
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(alert.createdAt)}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {alert.title}
                </h4>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {alert.description}
                </p>
                
                {alert.confidence && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Confiance IA: <span className="text-green-400">{(alert.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${getAlertBadgeColor(alert.type)}`}>
                    {alert.zone?.name || `Zone ${alert.zoneId}`}
                  </span>
                  {!alert.isResolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/80 h-auto p-1"
                      onClick={() => resolveAlertMutation.mutate(alert.id)}
                      disabled={resolveAlertMutation.isPending}
                    >
                      {resolveAlertMutation.isPending ? 'Résolution...' : 'Résoudre'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
