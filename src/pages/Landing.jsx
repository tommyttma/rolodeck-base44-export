import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, TrendingUp, Check, ArrowRight } from "lucide-react";
import { base44 } from '@/api/base44Client';

export default function Landing() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin();
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      id: 'store',
      icon: Users,
      title: 'Store',
      headline: 'Your network, organized',
      description: 'Keep all your professional contacts in one beautifully organized place. Add photos, tags, notes, and track every interaction.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'know',
      title: 'Know',
      icon: Clock,
      headline: 'Never miss a moment',
      description: 'Get smart reminders for birthdays, holidays, and check-ins. Generate personalized messages with AI to show you care—from Diwali to Christmas.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'track',
      icon: TrendingUp,
      title: 'Track',
      headline: 'Build lasting relationships',
      description: 'See your networking patterns at a glance. Track interactions, follow-ups, and ensure you\'re staying connected with the people who matter most.',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Rolodeck</h1>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your personal<br />networking CRM
          </h2>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Turn casual connections into meaningful relationships. Track, nurture, and grow your professional network effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={handleSignIn}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              Sign in
            </Button>
            <Button 
              onClick={handleSignUp}
              size="lg"
              className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Create an account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {features.map(feature => (
              <button
                key={feature.id}
                onClick={() => scrollToSection(feature.id)}
                className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all font-medium"
              >
                {feature.title}
              </button>
            ))}
          </div>
        </div>

        {/* Features Sections */}
        <div className="space-y-24 mb-24">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.id} 
                id={feature.id}
                className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
              >
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.color} text-white mb-4`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{feature.title}</span>
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-4">{feature.headline}</h3>
                  <p className="text-xl text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
                <div className="flex-1">
                  <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur">
                    <CardContent className="p-8">
                      <div className={`w-full h-64 rounded-xl bg-gradient-to-br ${feature.color} opacity-20`} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Teaser */}
        <div className="text-center mb-24">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">Plans that scale with you</h3>
          <p className="text-xl text-slate-600 mb-8">
            Start free with 10 contacts, or go unlimited for less than a coffee
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Free</h4>
                <p className="text-4xl font-bold text-slate-900 mb-4">$0</p>
                <p className="text-slate-600 mb-4">Up to 10 contacts</p>
                <Check className="w-6 h-6 text-green-600 mx-auto" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur ring-2 ring-blue-500 scale-105">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
                  Most Popular
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Pro</h4>
                <p className="text-4xl font-bold text-slate-900 mb-4">$2.99</p>
                <p className="text-slate-600 mb-4">Up to 100 contacts</p>
                <Check className="w-6 h-6 text-green-600 mx-auto" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Ultra</h4>
                <p className="text-4xl font-bold text-slate-900 mb-4">$4.99</p>
                <p className="text-slate-600 mb-4">Unlimited contacts</p>
                <Check className="w-6 h-6 text-green-600 mx-auto" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to transform your networking?
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join professionals who never miss a chance to connect
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleSignIn}
                  variant="secondary"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                >
                  Sign in
                </Button>
                <Button 
                  onClick={handleSignUp}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto bg-white text-blue-600 hover:bg-blue-50 border-0"
                >
                  Create an account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
