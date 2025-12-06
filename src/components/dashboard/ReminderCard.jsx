import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, Clock, MessageSquare } from "lucide-react";

export default function ReminderCard({ contact, type, daysInfo, occasionName, occasionIcon, onAction, onViewContact }) {
  const getInitials = () => {
    const first = contact.first_name?.[0] || contact.name?.[0] || '';
    const last = contact.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = () => {
    if (contact.first_name || contact.last_name) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    }
    return contact.name || 'Unknown';
  };

  const getIcon = () => {
    if (type === 'birthday') return <Cake className="w-4 h-4" />;
    if (type === 'occasion') return <span className="text-sm">{occasionIcon || '🎊'}</span>;
    return <Clock className="w-4 h-4" />;
  };

  const getColor = () => {
    if (type === 'birthday') return 'bg-pink-50 border-pink-100';
    if (type === 'occasion') return 'bg-purple-50 border-purple-100';
    return 'bg-amber-50 border-amber-100';
  };

  const getIconColor = () => {
    if (type === 'birthday') return 'bg-pink-100 text-pink-600';
    if (type === 'occasion') return 'bg-purple-100 text-purple-600';
    return 'bg-amber-100 text-amber-600';
  };

  const getMessage = () => {
    if (type === 'birthday') {
      if (daysInfo === 0) return "Birthday is today! 🎉";
      return `Birthday in ${daysInfo} day${daysInfo === 1 ? '' : 's'}`;
    }
    if (type === 'occasion') {
      if (daysInfo === 0) return `${occasionName} is today!`;
      return `${occasionName} in ${daysInfo} day${daysInfo === 1 ? '' : 's'}`;
    }
    if (daysInfo <= 0) return `Overdue by ${Math.abs(daysInfo)} day${Math.abs(daysInfo) === 1 ? '' : 's'}`;
    return `Check-in in ${daysInfo} day${daysInfo === 1 ? '' : 's'}`;
  };

  return (
    <Card className={`p-4 border ${getColor()} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer ring-2 ring-white" 
          onClick={() => onViewContact(contact)}
        >
          <AvatarImage src={contact.photo_url} alt={getFullName()} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p 
            className="font-medium text-slate-900 truncate cursor-pointer hover:text-blue-600"
            onClick={() => onViewContact(contact)}
          >
            {getFullName()}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className={`p-1 rounded-full ${getIconColor()}`}>
              {getIcon()}
            </span>
            <span>{getMessage()}</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onAction(contact, type === 'occasion' ? 'occasion' : type, occasionName)}
          className="shrink-0 gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Message</span>
        </Button>
      </div>
    </Card>
  );
}
