import { Card, CardContent } from "@/components/ui/card";
import { MapPin, AlertTriangle, Brain, CheckCircle } from "lucide-react";
import type { SurveillanceMetrics } from "@/types/surveillance";

interface MetricsOverviewProps {
  metrics?: SurveillanceMetrics;
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const metricsData = [
    {
      title: "Zones Actives",
      value: metrics?.activeZones || 0,
      change: "+2 depuis hier",
      changeType: "positive" as const,
      icon: MapPin,
      iconColor: "text-blue-400",
    },
    {
      title: "Alertes 24h",
      value: metrics?.alerts24h || 0,
      change: "+3 vs moyenne",
      changeType: "negative" as const,
      icon: AlertTriangle,
      iconColor: "text-amber-400",
    },
    {
      title: "Détections IA",
      value: metrics?.aiDetections || 0,
      change: "98.7% précision",
      changeType: "positive" as const,
      icon: Brain,
      iconColor: "text-purple-400",
    },
    {
      title: "Disponibilité",
      value: `${metrics?.systemUptime?.toFixed(1) || 99.9}%`,
      change: "Dernière MAJ: 2min",
      changeType: "neutral" as const,
      icon: CheckCircle,
      iconColor: "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {metricsData.map((metric) => (
        <Card key={metric.title} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
              <metric.icon className={`w-4 h-4 ${metric.iconColor}`} />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
            <p className={`text-xs mt-1 ${
              metric.changeType === 'positive' ? 'text-green-400' :
              metric.changeType === 'negative' ? 'text-red-400' :
              'text-muted-foreground'
            }`}>
              {metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
