import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Phone, Mail, Linkedin, Calendar, MessageCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

const typeConfig = {
  coffee_chat: { icon: Coffee, label: 'Coffee Chat', color: 'bg-amber-100 text-amber-700' },
  phone_call: { icon: Phone, label: 'Phone Call', color: 'bg-green-100 text-green-700' },
  email: { icon: Mail, label: 'Email', color: 'bg-blue-100 text-blue-700' },
  linkedin_message: { icon: Linkedin, label: 'LinkedIn', color: 'bg-sky-100 text-sky-700' },
  event: { icon: Calendar, label: 'Event', color: 'bg-purple-100 text-purple-700' },
  other: { icon: MessageCircle, label: 'Other', color: 'bg-slate-100 text-slate-700' }
};

export default function InteractionList({ interactions }) {
  if (!interactions || interactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <MessageCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p>No interactions logged yet</p>
        <p className="text-sm">Add your first interaction above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => {
        const config = typeConfig[interaction.type] || typeConfig.other;
        const Icon = config.icon;
        
        return (
          <Card key={interaction.id} className="p-4 border-0 bg-slate-50">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="secondary" className={config.color}>
                    {config.label}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    {format(parseISO(interaction.date), 'MMM d, yyyy')}
                  </span>
                </div>
                {interaction.summary && (
                  <p className="text-slate-700 text-sm mt-2">{interaction.summary}</p>
                )}
                {interaction.follow_up_needed && interaction.follow_up_notes && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-medium text-amber-700 mb-1">Follow-up needed:</p>
                    <p className="text-sm text-amber-800">{interaction.follow_up_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
