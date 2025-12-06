import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function InteractionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    type: 'coffee_chat',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    follow_up_needed: false,
    follow_up_notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      type: 'coffee_chat',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      follow_up_needed: false,
      follow_up_notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 rounded-xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coffee_chat">☕ Coffee Chat</SelectItem>
              <SelectItem value="phone_call">📞 Phone Call</SelectItem>
              <SelectItem value="email">✉️ Email</SelectItem>
              <SelectItem value="linkedin_message">💼 LinkedIn</SelectItem>
              <SelectItem value="event">📅 Event</SelectItem>
              <SelectItem value="other">💬 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Date</Label>
          <Input 
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="bg-white"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Summary</Label>
        <Textarea
          value={formData.summary}
          onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="What did you discuss? Any key takeaways?"
          rows={3}
          className="bg-white"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox 
          id="follow_up"
          checked={formData.follow_up_needed}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, follow_up_needed: checked }))}
        />
        <Label htmlFor="follow_up" className="cursor-pointer">Follow-up needed</Label>
      </div>
      
      {formData.follow_up_needed && (
        <div className="space-y-2">
          <Label>Follow-up Notes</Label>
          <Input
            value={formData.follow_up_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, follow_up_notes: e.target.value }))}
            placeholder="What do you need to follow up on?"
            className="bg-white"
          />
        </div>
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Log Interaction
      </Button>
    </form>
  );
}
