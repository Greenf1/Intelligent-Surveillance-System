import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Terminal, 
  Radio, 
  Settings, 
  Power, 
  Wifi, 
  Database, 
  Activity,
  Zap,
  Send,
  MessageSquare
} from "lucide-react";

interface CommandCenterProps {
  systemStatus?: {
    status: string;
    apis: {
      openai: string;
      database: string;
    };
    uptime?: number;
  };
}

export function CommandCenter({ systemStatus }: CommandCenterProps) {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState([
    { time: "07:45:32", command: "STATUS_CHECK", result: "All systems operational" },
    { time: "07:44:15", command: "ZONE_SCAN", result: "5 zones active, 3 alerts pending" },
    { time: "07:43:02", command: "AI_CALIBRATE", result: "Neural patterns updated" },
  ]);

  const quickCommands = [
    { label: "Scan All", command: "SCAN_ALL_ZONES", icon: Radio, variant: "default" as const },
    { label: "Emergency", command: "EMERGENCY_PROTOCOL", icon: Zap, variant: "destructive" as const },
    { label: "Calibrate", command: "AI_CALIBRATE", icon: Settings, variant: "secondary" as const },
    { label: "Status", command: "SYSTEM_STATUS", icon: Activity, variant: "outline" as const },
  ];

  const systemMetrics = [
    { 
      label: "Connexion réseau", 
      status: "Stable", 
      icon: Wifi, 
      color: "text-green-400",
      value: "99.9%" 
    },
    { 
      label: "Base de données", 
      status: systemStatus?.apis?.database === 'connected' ? "Connecté" : "Déconnecté", 
      icon: Database, 
      color: systemStatus?.apis?.database === 'connected' ? "text-green-400" : "text-red-400",
      value: "Active" 
    },
    { 
      label: "Surveillance IA", 
      status: systemStatus?.apis?.openai === 'connected' ? "Opérationnel" : "Hors ligne", 
      icon: Terminal, 
      color: systemStatus?.apis?.openai === 'connected' ? "text-green-400" : "text-red-400",
      value: "GPT-4" 
    },
    { 
      label: "Temps de fonctionnement", 
      status: "En ligne", 
      icon: Power, 
      color: "text-green-400",
      value: systemStatus?.uptime ? `${Math.floor(systemStatus.uptime / 3600)}h` : "24h" 
    },
  ];

  const executeCommand = () => {
    if (!command.trim()) return;
    
    const newEntry = {
      time: new Date().toLocaleTimeString('fr-FR'),
      command: command.toUpperCase(),
      result: "Command executed successfully"
    };
    
    setCommandHistory(prev => [newEntry, ...prev.slice(0, 4)]);
    setCommand("");
  };

  const executeQuickCommand = (cmd: string) => {
    const newEntry = {
      time: new Date().toLocaleTimeString('fr-FR'),
      command: cmd,
      result: `${cmd} executed successfully`
    };
    
    setCommandHistory(prev => [newEntry, ...prev.slice(0, 4)]);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Centre de Commande</CardTitle>
          <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
            <Terminal className="w-3 h-3 mr-1" />
            ACTIF
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {systemMetrics.map((metric) => (
            <div key={metric.label} className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <span className="text-xs text-foreground font-medium">{metric.value}</span>
              </div>
              <div className={`text-xs font-medium ${metric.color}`}>
                {metric.status}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Commands */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Commandes Rapides</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickCommands.map((cmd) => (
              <Button
                key={cmd.command}
                variant={cmd.variant}
                size="sm"
                className="text-xs justify-start"
                onClick={() => executeQuickCommand(cmd.command)}
              >
                <cmd.icon className="w-3 h-3 mr-2" />
                {cmd.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Command Input */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Ligne de Commande</h4>
          <div className="flex space-x-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Entrer une commande..."
              className="text-xs font-mono"
              onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
            />
            <Button size="sm" onClick={executeCommand}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Command History */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Historique</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {commandHistory.map((entry, index) => (
              <div key={index} className="bg-muted/20 rounded p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-primary">{entry.command}</span>
                  <span className="text-muted-foreground">{entry.time}</span>
                </div>
                <div className="text-green-400">{entry.result}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Communication Status */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Communication</span>
            </div>
            <Badge variant="outline" className="text-xs text-green-400 border-green-400">
              SÉCURISÉ
            </Badge>
          </div>
          <div className="text-xs text-green-400 mt-1">
            Chiffrement AES-256 • Liaison sécurisée établie
          </div>
        </div>
      </CardContent>
    </Card>
  );
}