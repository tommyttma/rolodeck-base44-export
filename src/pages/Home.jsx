import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, Cake, Plus, TrendingUp } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { differenceInDays, parseISO, isSameMonth, isSameDay, addYears, addDays, addWeeks, addMonths } from "date-fns";
import ReminderCard from '@/components/dashboard/ReminderCard';
import MessageGenerator from '@/components/messages/MessageGenerator';

export default function Home() {
  const [messageModal, setMessageModal] = useState({ open: false, contact: null, type: null, occasionName: null });
  const [userTier, setUserTier] = useState('free');
  const [greeting, setGreeting] = useState('Your Network');

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list()
  });

  const { data: occasions = [] } = useQuery({
    queryKey: ['occasions'],
    queryFn: () => base44.entities.Occasion.list()
  });

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setUserTier(user.subscription_tier || 'free');
      
      const hour = new Date().getHours();
      let timeOfDay = 'Good evening';
      if (hour < 12) timeOfDay = 'Good morning';
      else if (hour < 18) timeOfDay = 'Good afternoon';
      
      const firstName = user.full_name?.split(' ')[0] || 'there';
      setGreeting(`${timeOfDay}, ${firstName}`);
    };
    loadUser();
  }, []);

  const getCheckInDaysRemaining = (contact) => {
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

  const stats = useMemo(() => {
    const total = contacts.length;
    const needCheckIn = contacts.filter(c => {
      const daysRemaining = getCheckInDaysRemaining(c);
      return daysRemaining !== null && daysRemaining <= 0;
    }).length;
    
    const thisMonth = contacts.filter(c => {
      return c.created_date && isSameMonth(parseISO(c.created_date), new Date());
    }).length;

    return { total, needCheckIn, thisMonth };
  }, [contacts]);

  const reminders = useMemo(() => {
    const today = new Date();
    const checkIns = [];
    const birthdays = [];

    contacts.forEach(contact => {
      // Check-in reminders
      const daysUntil = getCheckInDaysRemaining(contact);
      if (daysUntil !== null && daysUntil <= 7) {
        checkIns.push({ contact, daysUntil, type: 'checkin' });
      }

      // Birthday reminders
      if (contact.birthday) {
        const bday = parseISO(contact.birthday);
        let nextBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        if (nextBday < today && !isSameDay(nextBday, today)) {
          nextBday = addYears(nextBday, 1);
        }
        const daysUntilBday = differenceInDays(nextBday, today);
        if (daysUntilBday <= 14 && daysUntilBday >= 0) {
          birthdays.push({ contact, daysUntil: daysUntilBday, type: 'birthday' });
        }
      }

      // Occasion reminders
      if (contact.occasions && contact.occasions.length > 0) {
        occasions.forEach(occasion => {
          if (contact.occasions.includes(occasion.name)) {
            const occasionDate = parseISO(occasion.date);
            const daysUntilOccasion = differenceInDays(occasionDate, today);
            if (daysUntilOccasion <= 14 && daysUntilOccasion >= 0) {
              checkIns.push({ 
                contact, 
                daysUntil: daysUntilOccasion, 
                type: 'occasion',
                occasionName: occasion.name,
                occasionIcon: occasion.icon
              });
            }
          }
        });
      }
    });

    return {
      checkIns: checkIns.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 8),
      birthdays: birthdays.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5)
    };
  }, [contacts, occasions]);

  const handleAction = (contact, type, occasionName = null) => {
    setMessageModal({ open: true, contact, type, occasionName });
  };

  const handleViewContact = (contact) => {
    window.location.href = createPageUrl('ContactDetail') + `?id=${contact.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{greeting}</h1>
            <p className="text-slate-600 mt-1">Stay connected with the people who matter</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('Contacts')}>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Contacts</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Need Check-in</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.needCheckIn}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Added This Month</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.thisMonth}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-in Reminders */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-amber-500" />
                Time to Reconnect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.checkIns.length > 0 ? (
                reminders.checkIns.map((reminder, idx) => (
                  <ReminderCard
                    key={`${reminder.contact.id}-${reminder.type}-${idx}`}
                    contact={reminder.contact}
                    type={reminder.type}
                    daysInfo={reminder.daysUntil}
                    occasionName={reminder.occasionName}
                    occasionIcon={reminder.occasionIcon}
                    onAction={handleAction}
                    onViewContact={handleViewContact}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p>All caught up! No check-ins needed right now.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Birthday Reminders */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cake className="w-5 h-5 text-pink-500" />
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.birthdays.length > 0 ? (
                reminders.birthdays.map(({ contact, daysUntil }) => (
                  <ReminderCard
                    key={contact.id}
                    contact={contact}
                    type="birthday"
                    daysInfo={daysUntil}
                    onAction={handleAction}
                    onViewContact={handleViewContact}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Cake className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p>No upcoming birthdays in the next 2 weeks.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {contacts.length === 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">Start Building Your Network</h3>
              <p className="opacity-90 mb-6 max-w-md mx-auto">
                Add your first contact to start tracking your professional relationships and never miss a chance to connect.
              </p>
              <Link to={createPageUrl('Contacts')}>
                <Button variant="secondary" size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Add Your First Contact
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {messageModal.open && (
        <MessageGenerator
          contact={messageModal.contact}
          messageType={messageModal.type}
          occasionName={messageModal.occasionName}
          onClose={() => setMessageModal({ open: false, contact: null, type: null, occasionName: null })}
        />
      )}
    </div>
  );
}
