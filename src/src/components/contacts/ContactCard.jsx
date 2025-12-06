import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Calendar, Clock } from "lucide-react";
import { format, differenceInDays, parseISO, addDays, addWeeks, addMonths, addYears } from "date-fns";

export default function ContactCard({ contact, onClick }) {
  const getFullName = () => {
    if (contact.first_name || contact.last_name) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    }
    return contact.name || 'Unknown';
  };

  const getInitials = () => {
    const first = contact.first_name?.[0] || contact.name?.[0] || '';
    const last = contact.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getDaysUntilCheckIn = () => {
    if (!contact.last_contact_date) return null;
    
    const lastContact = parseISO(contact.last_contact_date);
    let nextCheckIn;

    // Handle new format
    if (contact.check_in_frequency && contact.check_in_unit) {
      switch (contact.check_in_unit) {
        case 'days':
          nextCheckIn = addDays(lastContact, contact.check_in_frequency);
          break;
        case 'weeks':
          nextCheckIn = addWeeks(lastContact, contact.check_in_frequency);
          break;
        case 'months':
          nextCheckIn = addMonths(lastContact, contact.check_in_frequency);
          break;
        case 'years':
          nextCheckIn = addYears(lastContact, contact.check_in_frequency);
          break;
        default:
          nextCheckIn = addMonths(lastContact, 1);
      }
    } 
    // Handle legacy format
    else if (contact.check_in_frequency_days) {
      nextCheckIn = addDays(lastContact, contact.check_in_frequency_days);
    } else {
      return null;
    }

    return differenceInDays(nextCheckIn, new Date());
  };

  const daysUntilCheckIn = getDaysUntilCheckIn();
  const needsCheckIn = daysUntilCheckIn !== null && daysUntilCheckIn <= 0;

  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all">
          <AvatarImage src={contact.photo_url} alt={getFullName()} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 truncate">{getFullName()}</h3>
              {contact.role && (
                <p className="text-sm text-slate-500 truncate">{contact.role}</p>
              )}
            </div>
            {needsCheckIn && (
              <Badge className="bg-amber-100 text-amber-700 border-0 shrink-0">
                <Clock className="w-3 h-3 mr-1" />
                Check in
              </Badge>
            )}
          </div>
          
          {contact.company && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{contact.company}</span>
            </div>
          )}
          
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {contact.tags.slice(0, 3).map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-600 text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 3 && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-xs font-normal">
                  +{contact.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {contact.last_contact_date && (
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last contact: {format(parseISO(contact.last_contact_date), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
