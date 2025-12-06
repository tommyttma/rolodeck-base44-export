import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Plus, Upload, Camera, ScanLine } from "lucide-react";
import { base44 } from '@/api/base44Client';

const SUGGESTED_TAGS = ['Recruiter', 'Mentor', 'Peer', 'Former Colleague', 'Hiring Manager', 'Referral', 'Alumni', 'Industry Expert'];
const SUGGESTED_OCCASIONS = ['Christmas', 'New Year', 'Thanksgiving', 'Diwali', 'Lunar New Year', 'Hanukkah', 'Eid', 'Easter'];

export default function ContactForm({ contact, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    linkedin_url: '',
    how_we_met: '',
    birthday: '',
    notes: '',
    tags: [],
    occasions: [],
    check_in_frequency: 1,
    check_in_unit: 'months',
    photo_url: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [occasionInput, setOccasionInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isScanningCard, setIsScanningCard] = useState(false);

  useEffect(() => {
    if (contact) {
      // Handle migration from old 'name' field to first_name/last_name
      let firstName = contact.first_name || '';
      let lastName = contact.last_name || '';
      
      if (!firstName && contact.name) {
        const nameParts = contact.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      // Handle migration from check_in_frequency_days to new format
      let frequency = contact.check_in_frequency || 1;
      let unit = contact.check_in_unit || 'months';
      
      if (contact.check_in_frequency_days && !contact.check_in_unit) {
        if (contact.check_in_frequency_days % 365 === 0) {
          frequency = contact.check_in_frequency_days / 365;
          unit = 'years';
        } else if (contact.check_in_frequency_days % 30 === 0) {
          frequency = contact.check_in_frequency_days / 30;
          unit = 'months';
        } else if (contact.check_in_frequency_days % 7 === 0) {
          frequency = contact.check_in_frequency_days / 7;
          unit = 'weeks';
        } else {
          frequency = contact.check_in_frequency_days;
          unit = 'days';
        }
      }

      setFormData({
        first_name: firstName,
        last_name: lastName,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        role: contact.role || '',
        linkedin_url: contact.linkedin_url || '',
        how_we_met: contact.how_we_met || '',
        birthday: contact.birthday || '',
        notes: contact.notes || '',
        tags: contact.tags || [],
        occasions: contact.occasions || [],
        check_in_frequency: frequency,
        check_in_unit: unit,
        photo_url: contact.photo_url || ''
      });
    }
  }, [contact]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleChange('tags', [...formData.tags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addOccasion = (occasion) => {
    const trimmed = occasion.trim();
    if (trimmed && !formData.occasions.includes(trimmed)) {
      handleChange('occasions', [...formData.occasions, trimmed]);
    }
    setOccasionInput('');
  };

  const removeOccasion = (occasionToRemove) => {
    handleChange('occasions', formData.occasions.filter(o => o !== occasionToRemove));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange('photo_url', file_url);
    setIsUploading(false);
  };

  const handleBusinessCardScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningCard(true);
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const extractedData = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract contact information from this business card image. Return the data in JSON format.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          first_name: { type: "string" },
          last_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          company: { type: "string" },
          role: { type: "string" }
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      first_name: extractedData.first_name || prev.first_name,
      last_name: extractedData.last_name || prev.last_name,
      email: extractedData.email || prev.email,
      phone: extractedData.phone || prev.phone,
      company: extractedData.company || prev.company,
      role: extractedData.role || prev.role
    }));

    setIsScanningCard(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getInitials = () => {
    const first = formData.first_name?.[0] || '';
    const last = formData.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload & Business Card Scanner */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-slate-100">
              <AvatarImage src={formData.photo_url} alt="Contact photo" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </label>
          </div>
        </div>

        {/* Business Card Scanner */}
        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleBusinessCardScan}
            className="hidden"
            disabled={isScanningCard}
          />
          {isScanningCard ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-blue-600">Scanning business card...</span>
            </>
          ) : (
            <>
              <ScanLine className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">Scan Business Card</span>
            </>
          )}
        </label>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            placeholder="John"
            required
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            placeholder="Smith"
            className="bg-white"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@company.com"
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Acme Inc."
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Job Title</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="Senior Product Manager"
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            value={formData.linkedin_url}
            onChange={(e) => handleChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/johnsmith"
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthday">Birthday</Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e) => handleChange('birthday', e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Check-in Frequency */}
      <div className="space-y-2">
        <Label>Check-in Reminder</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            value={formData.check_in_frequency}
            onChange={(e) => handleChange('check_in_frequency', parseInt(e.target.value) || 1)}
            className="bg-white w-20"
          />
          <Select
            value={formData.check_in_unit}
            onValueChange={(value) => handleChange('check_in_unit', value)}
          >
            <SelectTrigger className="bg-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-slate-500">
          Remind me to check in every {formData.check_in_frequency} {formData.check_in_unit}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="how_we_met">How You Met</Label>
        <Input
          id="how_we_met"
          value={formData.how_we_met}
          onChange={(e) => handleChange('how_we_met', e.target.value)}
          placeholder="Met at a networking event in January 2024"
          className="bg-white"
        />
      </div>
      
      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, idx) => (
            <Badge key={idx} className="bg-blue-100 text-blue-700 gap-1 pr-1">
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            className="bg-white"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => addTag(tagInput)}
            disabled={!tagInput.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTED_TAGS.filter(tag => !formData.tags.includes(tag)).slice(0, 5).map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addTag(tag)}
              className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Occasions */}
      <div className="space-y-2">
        <Label>Occasions They Celebrate</Label>
        <p className="text-xs text-slate-500">Add holidays or special occasions to send greetings</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.occasions.map((occasion, idx) => (
            <Badge key={idx} className="bg-purple-100 text-purple-700 gap-1 pr-1">
              {occasion}
              <button 
                type="button" 
                onClick={() => removeOccasion(occasion)}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={occasionInput}
            onChange={(e) => setOccasionInput(e.target.value)}
            placeholder="Add an occasion..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addOccasion(occasionInput);
              }
            }}
            className="bg-white"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => addOccasion(occasionInput)}
            disabled={!occasionInput.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTED_OCCASIONS.filter(o => !formData.occasions.includes(o)).slice(0, 6).map((occasion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addOccasion(occasion)}
              className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            >
              + {occasion}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any personal notes, interests, topics discussed..."
          rows={4}
          className="bg-white"
        />
      </div>
      
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isUploading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? 'Saving...' : (contact ? 'Update Contact' : 'Add Contact')}
        </Button>
      </div>
    </form>
  );
}
