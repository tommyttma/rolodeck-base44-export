import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Clock, Check, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";

export default function Settings() {
  const [settings, setSettings] = useState({
    email_reminders_enabled: false,
    reminder_time: '09:00',
    days_before_birthday: 3,
    days_before_occasion: 3
  });
  const [userEmail, setUserEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setUserEmail(user.email);
    };
    loadUser();
  }, []);

  // Load existing settings
  const { data: existingSettings } = useQuery({
    queryKey: ['reminderSettings'],
    queryFn: async () => {
      const allSettings = await base44.entities.ReminderSettings.list();
      return allSettings[0];
    }
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings({
        email_reminders_enabled: existingSettings.email_reminders_enabled || false,
        reminder_time: existingSettings.reminder_time || '09:00',
        days_before_birthday: existingSettings.days_before_birthday || 3,
        days_before_occasion: existingSettings.days_before_occasion || 3
      });
    }
  }, [existingSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    
    if (existingSettings) {
      await base44.entities.ReminderSettings.update(existingSettings.id, settings);
    } else {
      await base44.entities.ReminderSettings.create(settings);
    }
    
    queryClient.invalidateQueries({ queryKey: ['reminderSettings'] });
    toast.success('Settings saved!');
    setIsSaving(false);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Configure your reminder preferences</p>
        </div>

        {/* Email Reminder Settings */}
        <Card className="border-0 bg-white/80 backdrop-blur shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Reminders
            </CardTitle>
            <CardDescription>
              Get daily email digests with your upcoming check-ins, birthdays, and holiday reminders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-reminders" className="font-medium">Enable Email Reminders</Label>
                <p className="text-sm text-slate-500">
                  Receive daily reminders at {userEmail}
                </p>
              </div>
              <Switch
                id="email-reminders"
                checked={settings.email_reminders_enabled}
                onCheckedChange={(checked) => handleChange('email_reminders_enabled', checked)}
              />
            </div>

            {settings.email_reminders_enabled && (
              <>
                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <Select
                    value={settings.reminder_time}
                    onValueChange={(value) => handleChange('reminder_time', value)}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Days Before Birthday</Label>
                    <Select
                      value={String(settings.days_before_birthday)}
                      onValueChange={(value) => handleChange('days_before_birthday', parseInt(value))}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Days Before Occasion</Label>
                    <Select
                      value={String(settings.days_before_occasion)}
                      onValueChange={(value) => handleChange('days_before_occasion', parseInt(value))}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 bg-blue-50 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="p-2 bg-blue-100 rounded-lg h-fit">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">How Email Reminders Work</h3>
                <p className="text-sm text-slate-600">
                  When enabled, you'll receive a single daily email summarizing:
                </p>
                <ul className="text-sm text-slate-600 mt-2 space-y-1">
                  <li>• Contacts that need a check-in today</li>
                  <li>• Upcoming birthdays within your set timeframe</li>
                  <li>• Upcoming holidays/occasions for your contacts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
