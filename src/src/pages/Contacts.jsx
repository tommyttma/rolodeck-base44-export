import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Plus, Filter, Users, X } from "lucide-react";
import { createPageUrl } from '@/utils';
import ContactCard from '@/components/contacts/ContactCard';
import ContactForm from '@/components/contacts/ContactForm';

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [userTier, setUserTier] = useState('free');

  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date')
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setUserTier(user.subscription_tier || 'free');
    };
    loadUser();
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowForm(false);
      setEditingContact(null);
    }
  });

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    contacts.forEach(c => c.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !searchQuery || 
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => contact.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [contacts, searchQuery, selectedTags]);

  const getContactLimit = () => {
    if (userTier === 'free') return 10;
    if (userTier === 'pro') return 100;
    return Infinity;
  };

  const canAddContact = () => {
    return contacts.length < getContactLimit();
  };

  const handleSubmit = (data) => {
    if (!editingContact && !canAddContact()) {
      alert(`You've reached your contact limit. Upgrade to add more contacts.`);
      window.location.href = createPageUrl('Upgrade');
      return;
    }
    
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddClick = () => {
    if (!canAddContact()) {
      window.location.href = createPageUrl('Upgrade');
      return;
    }
    setEditingContact(null);
    setShowForm(true);
  };

  const handleContactClick = (contact) => {
    window.location.href = createPageUrl('ContactDetail') + `?id=${contact.id}`;
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
            <p className="text-slate-600 mt-1">
              {contacts.length} {userTier !== 'ultra' && `of ${getContactLimit()}`} contacts
            </p>
          </div>
          <Button 
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by name, company, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 h-12"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-500" />
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contacts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onClick={() => handleContactClick(contact)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-0 bg-white/80">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery || selectedTags.length > 0 ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || selectedTags.length > 0 
                ? 'Try adjusting your search or filters'
                : 'Start building your professional network'}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <Button 
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Contact
              </Button>
            )}
          </Card>
        )}

        {/* Add/Edit Sheet */}
        <Sheet open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingContact(null); }}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</SheetTitle>
            </SheetHeader>
            <ContactForm
              contact={editingContact}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingContact(null); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
