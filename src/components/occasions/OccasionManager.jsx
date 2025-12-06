import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Calendar, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const DEFAULT_OCCASIONS = [
  { name: 'Christmas', date: '2024-12-25', icon: '🎄', is_default: true },
  { name: 'New Year', date: '2025-01-01', icon: '🎉', is_default: true },
  { name: 'Thanksgiving', date: '2024-11-28', icon: '🦃', is_default: true },
];

export default function OccasionManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newOccasion, setNewOccasion] = useState({ name: '', date: '', icon: '🎊' });
  
  const queryClient = useQueryClient();

  const { data: occasions = [] } = useQuery({
    queryKey: ['occasions'],
    queryFn: () => base44.entities.Occasion.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Occasion.create({ ...data, is_recurring: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
      setShowAddDialog(false);
      setNewOccasion({ name: '', date: '', icon: '🎊' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Occasion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    }
  });

  const initializeDefaultOccasions = async () => {
    for (const occasion of DEFAULT_OCCASIONS) {
      const exists = occasions.find(o => o.name === occasion.name);
      if (!exists) {
        await base44.entities.Occasion.create({ ...occasion, is_recurring: true });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['occasions'] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(newOccasion);
  };

  const EMOJI_OPTIONS = ['🎊', '🎉', '🎄', '🪔', '🌙', '🕎', '🐲', '🌸', '🎃', '❤️', '🙏', '✨'];

  return (
    <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-purple-500" />
            Your Occasions
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Occasion</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Occasion Name</Label>
                  <Input
                    value={newOccasion.name}
                    onChange={(e) => setNewOccasion(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Diwali, Lunar New Year"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date (this year)</Label>
                  <Input
                    type="date"
                    value={newOccasion.date}
                    onChange={(e) => setNewOccasion(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewOccasion(prev => ({ ...prev, icon: emoji }))}
                        className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                          newOccasion.icon === emoji 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                    Add Occasion
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {occasions.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-4">No occasions set up yet</p>
            <Button onClick={initializeDefaultOccasions} variant="outline" size="sm">
              Add Default Holidays
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {occasions.sort((a, b) => new Date(a.date) - new Date(b.date)).map(occasion => (
              <div 
                key={occasion.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{occasion.icon || '🎊'}</span>
                  <div>
                    <p className="font-medium text-slate-900">{occasion.name}</p>
                    <p className="text-sm text-slate-500">
                      {format(parseISO(occasion.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(occasion.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
