import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Eye, 
  Brain, 
  Satellite, 
  Target, 
  Lock,
  ArrowRight,
  CheckCircle,
  Globe,
  Users
} from "lucide-react";

export default function Landing() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDemo, setActiveDemo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const demoTimer = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(demoTimer);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Intelligence Artificielle",
      description: "Analyse comportementale avancée avec GPT-4 pour détecter les patterns suspects",
      color: "text-purple-400"
    },
    {
      icon: Satellite,
      title: "Surveillance Géographique",
      description: "Monitoring en temps réel de zones sans infrastructure physique",
      color: "text-blue-400"
    },
    {
      icon: Target,
      title: "Détection Prédictive",
      description: "Algorithmes prédictifs pour anticiper les menaces potentielles",
      color: "text-red-400"
    },
    {
      icon: Lock,
      title: "Sécurité Maximale",
      description: "Chiffrement AES-256 et authentification multi-facteurs",
      color: "text-green-400"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Disponibilité", icon: CheckCircle },
    { value: "< 30s", label: "Temps de réponse", icon: Eye },
    { value: "24/7", label: "Surveillance", icon: Globe },
    { value: "Illimité", label: "Zones couvertes", icon: Users },
  ];

  const demoCards = [
    {
      title: "Détection d'Anomalie",
      description: "Pattern de mouvement coordonné détecté",
      status: "CRITIQUE",
      color: "border-red-500/50 bg-red-500/10"
    },
    {
      title: "Analyse Comportementale",
      description: "Regroupement suspect identifié par IA",
      status: "ATTENTION",
      color: "border-amber-500/50 bg-amber-500/10"
    },
    {
      title: "Surveillance Active",
      description: "Monitoring en cours sur 5 zones",
      status: "NORMAL",
      color: "border-green-500/50 bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2080%2080%22%20width%3D%2280%22%20height%3D%2280%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2240%22%20r%3D%221%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SurveillanceIA</h1>
                <p className="text-xs text-muted-foreground">Système de Surveillance Intelligent</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-xs text-muted-foreground">
                {currentTime.toLocaleTimeString('fr-FR')}
              </div>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Lock className="w-4 h-4 mr-2" />
                Connexion Sécurisée
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30 bg-primary/10">
              <Target className="w-3 h-3 mr-1" />
              Système de Surveillance Avancé
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Surveillance Intelligente
              <br />
              <span className="text-primary">Sans Infrastructure</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Système de surveillance militaire de nouvelle génération utilisant l'intelligence artificielle 
              pour la détection d'anomalies et l'analyse comportementale en temps réel.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
              >
                Accéder au Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Eye className="w-5 h-5 mr-2" />
                Démonstration
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fonctionnalités Avancées</h2>
            <p className="text-lg text-muted-foreground">
              Technologie de pointe pour une surveillance militaire efficace
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Démonstration En Direct</h2>
            <p className="text-lg text-muted-foreground">
              Aperçu des capacités de surveillance en temps réel
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              {demoCards.map((demo, index) => (
                <Card 
                  key={index} 
                  className={`transition-all duration-500 ${
                    activeDemo === index 
                      ? `${demo.color} scale-105 shadow-lg` 
                      : 'bg-card/30 border-border/30'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          demo.status === 'CRITIQUE' ? 'text-red-400 border-red-400' :
                          demo.status === 'ATTENTION' ? 'text-amber-400 border-amber-400' :
                          'text-green-400 border-green-400'
                        }`}
                      >
                        {demo.status}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${
                        activeDemo === index ? 'animate-pulse' : ''
                      } ${
                        demo.status === 'CRITIQUE' ? 'bg-red-400' :
                        demo.status === 'ATTENTION' ? 'bg-amber-400' :
                        'bg-green-400'
                      }`} />
                    </div>
                    <h4 className="font-semibold mb-2">{demo.title}</h4>
                    <p className="text-sm text-muted-foreground">{demo.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <Card className="bg-primary/10 border-primary/20 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Prêt à Sécuriser Votre Territoire ?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez les forces de sécurité qui font confiance à SurveillanceIA 
                pour protéger leurs zones sensibles avec une technologie de pointe.
              </p>
              
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Accéder au Système
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="mt-6 text-sm text-muted-foreground">
                Authentification sécurisée requise • Chiffrement de niveau militaire
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                SurveillanceIA v2.1.3 • Système de Surveillance Intelligent
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 • Classification : Confidentiel Défense
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}