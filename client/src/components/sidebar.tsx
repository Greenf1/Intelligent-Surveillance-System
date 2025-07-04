import { Shield, MapPin, AlertTriangle, BarChart3, Settings, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  alertCount: number;
  systemStatus?: {
    status: string;
    apis: {
      openai: string;
      database: string;
    };
  };
}

export function Sidebar({ alertCount, systemStatus }: SidebarProps) {
  const navigationItems = [
    { icon: MapPin, label: "Surveillance", active: true },
    { icon: AlertTriangle, label: "Alertes", badge: alertCount },
    { icon: BarChart3, label: "Analytiques" },
    { icon: Settings, label: "Configuration" },
    { icon: History, label: "Historique" },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">SurveillanceIA</h1>
            <p className="text-xs text-muted-foreground">v2.1.3</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
              item.active
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Statut Système</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">
                {systemStatus?.status === 'operational' ? 'Opérationnel' : 'Maintenance'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">APIs</span>
            <span className="text-xs text-green-400">
              {systemStatus?.apis?.openai === 'connected' ? '✓ OpenAI GPT' : '✗ OpenAI GPT'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground"></span>
            <span className="text-xs text-green-400">✓ Google Maps</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
