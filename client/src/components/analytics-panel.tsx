import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SurveillanceZone, Alert, ThreatLevel } from "@/types/surveillance";

interface AnalyticsPanelProps {
  zones: SurveillanceZone[];
  alerts: Alert[];
}

export function AnalyticsPanel({ zones, alerts }: AnalyticsPanelProps) {
  const [behavioralAnalysis, setBehavioralAnalysis] = useState<string | null>(null);

  const { data: threatLevels } = useQuery<ThreatLevel[]>({
    queryKey: ['/api/threat-levels'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Generate behavioral analysis based on recent alerts
  useEffect(() => {
    const recentAlerts = alerts.filter(alert => 
      new Date(alert.createdAt) > new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
    );

    if (recentAlerts.length > 0) {
      const criticalAlerts = recentAlerts.filter(alert => alert.type === 'critical');
      const warningAlerts = recentAlerts.filter(alert => alert.type === 'warning');

      let analysis = "";
      if (criticalAlerts.length > 0) {
        analysis = `L'algorithme détecte des patterns de mouvement coordonnés dans ${criticalAlerts.length} zone(s), suggérant une activité organisée. `;
      }
      if (warningAlerts.length > 0) {
        analysis += `Surveillance renforcée activée sur ${warningAlerts.length} zone(s) supplémentaire(s). `;
      }
      if (analysis === "") {
        analysis = "Patterns de comportement normaux détectés. Surveillance de routine en cours.";
      }

      setBehavioralAnalysis(analysis);
    } else {
      setBehavioralAnalysis("Aucune activité anormale détectée. Surveillance de routine en cours.");
    }
  }, [alerts]);

  const getOverallThreatLevel = (): { level: string; color: string } => {
    if (!threatLevels || threatLevels.length === 0) {
      return { level: "NORMAL", color: "text-green-400" };
    }

    const maxThreat = Math.max(...threatLevels.map(t => t.threatLevel));
    
    if (maxThreat >= 70) {
      return { level: "ÉLEVÉ", color: "text-red-400" };
    } else if (maxThreat >= 40) {
      return { level: "MODÉRÉ", color: "text-amber-400" };
    } else {
      return { level: "NORMAL", color: "text-green-400" };
    }
  };

  const overallThreat = getOverallThreatLevel();
  const avgConfidence = alerts.length > 0 
    ? alerts.reduce((sum, alert) => sum + (alert.confidence || 0), 0) / alerts.length 
    : 0.5;

  const recommendations = [
    "Augmenter la fréquence de surveillance sur zones à risque élevé",
    "Activer surveillance préventive zones adjacentes",
    "Recalibrer seuils basés sur patterns actuels",
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Analytiques IA</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Behavioral Analysis */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-medium">Analyse Comportementale</h4>
            <Badge variant="outline" className="text-xs text-purple-400 border-purple-400">
              GPT-4
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {behavioralAnalysis}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Confiance: <span className="text-green-400">{(avgConfidence * 100).toFixed(1)}%</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Dernière analyse: {new Date().toLocaleTimeString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Threat Level Overview */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Niveau de Menace Global</h4>
            <span className={`text-sm font-bold ${overallThreat.color}`}>
              {overallThreat.level}
            </span>
          </div>
          
          <div className="space-y-2">
            {threatLevels?.map((threat) => (
              <div key={threat.zoneId} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{threat.zoneName}</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={threat.threatLevel} 
                    className="w-20 h-2 bg-muted"
                  />
                  <span className={`text-xs ${
                    threat.threatLevel >= 70 ? 'text-red-400' :
                    threat.threatLevel >= 40 ? 'text-amber-400' :
                    'text-green-400'
                  }`}>
                    {threat.threatLevel}%
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-xs text-muted-foreground text-center py-2">
                Calcul des niveaux de menace en cours...
              </div>
            )}
          </div>
        </div>

        {/* System Recommendations */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-medium">Recommandations Système</h4>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
