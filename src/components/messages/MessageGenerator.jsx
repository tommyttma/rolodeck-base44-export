import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Copy, Check, RefreshCw, X, Mail, Linkedin, MessageCircle } from "lucide-react";
import { base44 } from '@/api/base44Client';

export default function MessageGenerator({ contact, messageType, occasionName, onClose }) {
  const [tone, setTone] = useState('friendly');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const getFullName = () => {
    if (contact.first_name || contact.last_name) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    }
    return contact.name || 'Unknown';
  };

  const generateMessage = async () => {
    setIsGenerating(true);
    
    const context = `
      Contact Name: ${getFullName()}
      First Name: ${contact.first_name || 'Unknown'}
      Company: ${contact.company || 'Unknown'}
      Role: ${contact.role || 'Unknown'}
      How we met: ${contact.how_we_met || 'Not specified'}
      Notes about them: ${contact.notes || 'None'}
    `;

    let prompt = '';
    if (messageType === 'birthday') {
      prompt = `Generate a ${tone} birthday message for a professional contact. Keep it warm but professional. 
      ${context}
      
      Generate a short birthday message (2-3 sentences max). Be genuine and personal if there are notes about them. Use their first name.`;
    } else if (messageType === 'holiday' || messageType === 'occasion') {
      const occasion = occasionName || 'holiday season';
      prompt = `Generate a ${tone} ${occasion} greeting for a professional contact. Keep it warm but professional.
      ${context}
      
      Generate a short ${occasion} message (2-3 sentences max). Make it feel personal, not generic. Use their first name.`;
    } else {
      prompt = `Generate a ${tone} check-in message for a professional contact I haven't spoken to in a while. 
      ${context}
      
      Generate a natural check-in message (2-3 sentences max) that:
      - Uses their first name
      - References how we know each other if available
      - Shows genuine interest in them
      - Optionally mentions wanting to catch up
      - Doesn't feel salesy or transactional`;
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" }
        }
      }
    });
    
    setGeneratedMessage(response.message);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInEmail = () => {
    const subject = messageType === 'birthday' 
      ? `Happy Birthday, ${contact.first_name || getFullName()}!`
      : messageType === 'holiday' || messageType === 'occasion'
      ? `${occasionName || 'Happy Holidays'}!`
      : `Checking in - ${contact.first_name || getFullName()}`;
    
    const mailtoLink = `mailto:${contact.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedMessage)}`;
    window.open(mailtoLink, '_blank');
  };

  const openLinkedIn = () => {
    if (contact.linkedin_url) {
      window.open(contact.linkedin_url, '_blank');
    }
  };

  const getTitle = () => {
    if (messageType === 'birthday') return '🎂 Birthday Message';
    if (messageType === 'holiday') return '🎄 Holiday Greeting';
    if (messageType === 'occasion') return `✨ ${occasionName || 'Occasion'} Greeting`;
    return '👋 Check-in Message';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-slate-600 mb-4">
          Generate a personalized message for <span className="font-medium text-slate-900">{getFullName()}</span>
        </p>

        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">Message Tone</Label>
            <RadioGroup 
              value={tone} 
              onValueChange={setTone}
              className="flex flex-wrap gap-3"
            >
              {[
                { value: 'friendly', label: 'Friendly' },
                { value: 'professional', label: 'Professional' },
                { value: 'casual', label: 'Casual' },
                { value: 'warm', label: 'Warm & Personal' }
              ].map(option => (
                <div key={option.value} className="flex items-center">
                  <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                  <Label 
                    htmlFor={option.value}
                    className="px-3 py-1.5 rounded-full border cursor-pointer peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:border-blue-300 peer-data-[state=checked]:text-blue-700 hover:bg-slate-50 transition-colors"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button 
            onClick={generateMessage} 
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Message
              </>
            )}
          </Button>

          {generatedMessage && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Generated Message</Label>
              <Textarea 
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                rows={5}
                className="bg-slate-50"
              />
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={copyToClipboard}
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={generateMessage}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {/* Send Options */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={openInEmail}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Open in Email
                  </Button>
                  {contact.linkedin_url && (
                    <Button 
                      variant="outline"
                      onClick={openLinkedIn}
                      className="gap-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      Open LinkedIn
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-slate-500 text-center">
                  For WhatsApp or iMessage, copy the message and paste it in your app
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
