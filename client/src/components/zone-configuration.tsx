import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { insertSurveillanceZoneSchema } from "@shared/schema";
import type { SurveillanceZone, InsertSurveillanceZone } from "@/types/surveillance";
import { z } from "zod";

interface ZoneConfigurationProps {
  zones: SurveillanceZone[];
  onZoneUpdate: () => void;
}

const formSchema = insertSurveillanceZoneSchema.extend({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(50).max(5000),
});

export function ZoneConfiguration({ zones, onZoneUpdate }: ZoneConfigurationProps) {
  const [editingZone, setEditingZone] = useState<SurveillanceZone | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      latitude: 48.8566,
      longitude: 2.3522,
      radius: 500,
      alertThreshold: "medium",
      isActive: true,
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: async (data: InsertSurveillanceZone) => {
      await apiRequest('POST', '/api/zones', data);
    },
    onSuccess: () => {
      onZoneUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/zones'] });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSurveillanceZone> }) => {
      await apiRequest('PUT', `/api/zones/${id}`, data);
    },
    onSuccess: () => {
      onZoneUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/zones'] });
      setDialogOpen(false);
      setEditingZone(null);
      form.reset();
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/zones/${id}`);
    },
    onSuccess: () => {
      onZoneUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/zones'] });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, data });
    } else {
      createZoneMutation.mutate(data);
    }
  };

  const openEditDialog = (zone: SurveillanceZone) => {
    setEditingZone(zone);
    form.setValue('name', zone.name);
    form.setValue('latitude', zone.latitude);
    form.setValue('longitude', zone.longitude);
    form.setValue('radius', zone.radius);
    form.setValue('alertThreshold', zone.alertThreshold);
    form.setValue('isActive', zone.isActive);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingZone(null);
    form.reset();
    setDialogOpen(true);
  };

  const getStatusColor = (threshold: string) => {
    switch (threshold) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Configuration des Zones</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {zones.map((zone) => (
          <div key={zone.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(zone.alertThreshold)}`} />
                <div>
                  <h4 className="text-sm font-medium">{zone.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {zone.latitude.toFixed(4)}° N, {zone.longitude.toFixed(4)}° E
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => openEditDialog(zone)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-destructive hover:text-destructive"
                  onClick={() => deleteZoneMutation.mutate(zone.id)}
                  disabled={deleteZoneMutation.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-muted-foreground">Rayon (m)</Label>
                <div className="text-foreground">{zone.radius}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Seuil alerte</Label>
                <div className="text-foreground capitalize">{zone.alertThreshold}</div>
              </div>
            </div>
          </div>
        ))}
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openCreateDialog}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une zone
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? 'Modifier la zone' : 'Ajouter une zone'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la zone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Zone Alpha" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.0001"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.0001"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="radius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rayon (mètres)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="alertThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seuil d'alerte</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Faible</SelectItem>
                              <SelectItem value="medium">Moyen</SelectItem>
                              <SelectItem value="high">Élevé</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createZoneMutation.isPending || updateZoneMutation.isPending}
                  >
                    {editingZone ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
