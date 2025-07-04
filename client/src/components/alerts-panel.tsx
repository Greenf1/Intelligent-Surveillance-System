import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, Clock, CheckCircle2, Eye, MoreHorizontal } from "lucide-react";
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
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg font-semibold">Alertes Récentes</CardTitle>
            <Badge variant="outline" className="text-xs text-amber-400 border-amber-400">
              <Clock className="w-3 h-3 mr-1" />
              TEMPS RÉEL
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {alerts.filter(a => !a.isResolved).length} actives
            </Badge>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
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
                className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-lg ${getAlertColor(alert.type)} ${
                  alert.isResolved ? 'opacity-60' : alert.type === 'critical' ? 'alert-pulse' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${getAlertBadgeColor(alert.type)}`} />
                    <Badge variant="outline" className={`text-xs font-semibold ${getAlertBadgeColor(alert.type)} border-current`}>
                      {alert.type.toUpperCase()}
                    </Badge>
                    {alert.isResolved && (
                      <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        RÉSOLU
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {formatTime(alert.createdAt)}
                    </div>
                    {alert.threatLevel && (
                      <div className={`text-xs font-bold ${
                        alert.threatLevel >= 70 ? 'text-red-400' :
                        alert.threatLevel >= 40 ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                        Menace: {alert.threatLevel}%
                      </div>
                    )}
                  </div>
                </div>
                
                <h4 className="text-sm font-semibold text-foreground mb-2 leading-tight">
                  {alert.title}
                </h4>
                
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {alert.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  {alert.confidence && (
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Confiance:</span>
                      <span className="text-green-400 font-medium">{(alert.confidence * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <span className="text-muted-foreground">Zone:</span>
                    <span className={`font-medium ${getAlertBadgeColor(alert.type)}`}>
                      {alert.zone?.name || `Zone ${alert.zoneId}`}
                    </span>
                  </div>
                </div>
                
                {alert.aiAnalysis && (
                  <div className="bg-muted/30 rounded p-2 mb-3">
                    <div className="text-xs text-muted-foreground">
                      <strong>Analyse IA:</strong> Patterns détectés et recommandations disponibles
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-xs h-auto p-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Détails
                    </Button>
                  </div>
                  {!alert.isResolved && (
                    <Button
                      variant={alert.type === 'critical' ? 'destructive' : 'default'}
                      size="sm"
                      className="text-xs h-auto px-3 py-1"
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
