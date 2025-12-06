import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Mail, Phone, Building2, Linkedin, Calendar, Clock, 
  Pencil, Trash2, MessageSquare, Cake, Sparkles, PartyPopper
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ContactForm from '@/components/contacts/ContactForm';
import InteractionList from '@/components/contacts/InteractionList';
import InteractionForm from '@/components/contacts/InteractionForm';
import MessageGenerator from '@/components/messages/MessageGenerator';

export default function ContactDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const contactId = urlParams.get('id');

  const [showEditForm, setShowEditForm] = useState(false);
  const [messageModal, setMessageModal] = useState({ open: false, type: null, occasionName: null });

  const queryClient = useQueryClient();

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      const contacts = await base44.entities.Contact.filter({ id: contactId });
      return contacts[0];
    },
    enabled: !!contactId
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions', contactId],
    queryFn: () => base44.entities.Interaction.filter({ contact_id: contactId }, '-date'),
    enabled: !!contactId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.update(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowEditForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Contact.delete(contactId),
    onSuccess: () => {
      window.location.href = createPageUrl('Contacts');
    }
  });

  const createInteractionMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Interaction.create({ ...data, contact_id: contactId });
      await base44.entities.Contact.update(contactId, { last_contact_date: data.date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
    }
  });

  if (isLoading || !contact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-slate-200 rounded mb-8" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

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
    } else if (contact.check_in_frequency_days) {
      nextCheckIn = addDays(lastContact, contact.check_in_frequency_days);
    } else {
      return null;
    }

    return differenceInDays(nextCheckIn, new Date());
  };

  const daysUntilCheckIn = getDaysUntilCheckIn();

  const getCheckInFrequencyText = () => {
    if (contact.check_in_frequency && contact.check_in_unit) {
      return `Every ${contact.check_in_frequency} ${contact.check_in_unit}`;
    }
    if (contact.check_in_frequency_days) {
      return `Every ${contact.check_in_frequency_days} days`;
    }
    return 'Not set';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to={createPageUrl('Contacts')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>

        {/* Contact Header Card */}
        <Card className="mb-6 border-0 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={contact.photo_url} alt={getFullName()} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900">{getFullName()}</h1>
                {contact.role && <p className="text-slate-600">{contact.role}</p>}
                {contact.company && (
                  <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                    <Building2 className="w-4 h-4" />
                    {contact.company}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this contact?')) {
                      deleteMutation.mutate();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Status Badge */}
            {daysUntilCheckIn !== null && daysUntilCheckIn <= 0 && (
              <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-700">
                <Clock className="w-3 h-3 mr-1" />
                Time to check in
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {contact.email && (
            <a href={`mailto:${contact.email}`}>
              <Button variant="outline" className="w-full gap-2 h-auto py-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="truncate text-sm">{contact.email}</span>
              </Button>
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`}>
              <Button variant="outline" className="w-full gap-2 h-auto py-3">
                <Phone className="w-4 h-4 text-green-600" />
                <span>{contact.phone}</span>
              </Button>
            </a>
          )}
          {contact.linkedin_url && (
            <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full gap-2 h-auto py-3">
                <Linkedin className="w-4 h-4 text-sky-600" />
                LinkedIn
              </Button>
            </a>
          )}
          <Button 
            variant="outline" 
            className="w-full gap-2 h-auto py-3"
            onClick={() => setMessageModal({ open: true, type: 'checkin', occasionName: null })}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Generate Message
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="interactions" className="space-y-6">
          <TabsList className="bg-white/80 p-1">
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="interactions" className="space-y-6">
            {/* Log New Interaction */}
            <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Log New Interaction</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractionForm 
                  onSubmit={(data) => createInteractionMutation.mutate(data)}
                  isLoading={createInteractionMutation.isPending}
                />
              </CardContent>
            </Card>

            {/* Interaction History */}
            <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Interaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractionList interactions={interactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
              <CardContent className="p-6 space-y-6">
                {contact.how_we_met && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">How You Met</h3>
                    <p className="text-slate-900">{contact.how_we_met}</p>
                  </div>
                )}

                {contact.birthday && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Cake className="w-4 h-4" />
                      Birthday
                    </h3>
                    <p className="text-slate-900">{format(parseISO(contact.birthday), 'MMMM d')}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Check-in Frequency
                  </h3>
                  <p className="text-slate-900">{getCheckInFrequencyText()}</p>
                  {contact.last_contact_date && (
                    <p className="text-sm text-slate-500">
                      Last contact: {format(parseISO(contact.last_contact_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>

                {contact.tags && contact.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {contact.occasions && contact.occasions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                      <PartyPopper className="w-4 h-4" />
                      Occasions They Celebrate
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {contact.occasions.map((occasion, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200"
                          onClick={() => setMessageModal({ open: true, type: 'occasion', occasionName: occasion })}
                        >
                          {occasion}
                          <MessageSquare className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Click an occasion to generate a greeting</p>
                  </div>
                )}

                {contact.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Notes</h3>
                    <p className="text-slate-900 whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Sheet */}
        <Sheet open={showEditForm} onOpenChange={setShowEditForm}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Edit Contact</SheetTitle>
            </SheetHeader>
            <ContactForm
              contact={contact}
              onSubmit={(data) => updateMutation.mutate(data)}
              onCancel={() => setShowEditForm(false)}
              isLoading={updateMutation.isPending}
            />
          </SheetContent>
        </Sheet>

        {/* Message Generator Modal */}
        {messageModal.open && (
          <MessageGenerator
            contact={contact}
            messageType={messageModal.type}
            occasionName={messageModal.occasionName}
            onClose={() => setMessageModal({ open: false, type: null, occasionName: null })}
          />
        )}
      </div>
    </div>
  );
}
