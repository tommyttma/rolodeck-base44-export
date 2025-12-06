import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Users, Zap, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Upgrade() {
  const [userTier, setUserTier] = useState('free');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setUserTier(user.subscription_tier || 'free');
    };
    loadUser();
  }, []);

  const handleUpgrade = async (tier) => {
    if (tier === 'free') return;
    
    // Redirect to billing page
    window.location.href = createPageUrl('Billing');
  };

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 contacts',
        'Basic reminders',
        'AI message generation',
        'Birthday tracking'
      ],
      icon: Users,
      color: 'from-slate-500 to-slate-600',
      buttonText: 'Current Plan'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$2.99',
      period: 'per month',
      description: 'Great for active networkers',
      features: [
        'Up to 100 contacts',
        'All Free features',
        'Email reminders',
        'Custom occasions',
        'Interaction tracking'
      ],
      icon: Zap,
      color: 'from-blue-500 to-indigo-600',
      buttonText: 'Upgrade to Pro',
      popular: true
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: '$4.99',
      period: 'per month',
      description: 'For power networkers',
      features: [
        'Unlimited contacts',
        'All Pro features',
        'Priority support',
        'Advanced analytics',
        'Export capabilities'
      ],
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      buttonText: 'Upgrade to Ultra'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Choose Your Plan</h1>
          <p className="text-lg text-slate-600">
            Upgrade to unlock more contacts and powerful features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = userTier === tier.id;
            
            return (
              <Card 
                key={tier.id}
                className={`relative border-0 shadow-lg ${
                  tier.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} mx-auto mb-4 flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-1">{tier.name}</CardTitle>
                  <CardDescription className="text-sm mb-4">{tier.description}</CardDescription>
                  <div>
                    <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-slate-600 ml-2">{tier.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isCurrent || isLoading || tier.id === 'free'}
                    className={`w-full ${
                      isCurrent 
                        ? 'bg-slate-200 text-slate-600 cursor-not-allowed' 
                        : tier.id === 'free'
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : `bg-gradient-to-r ${tier.color} hover:opacity-90 text-white`
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : tier.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ / Info */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-slate-900">Can I downgrade later?</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Yes, you can change your plan at any time. If you downgrade, you can still view all existing contacts, but you won't be able to add new ones until you're within your plan's limit.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">What happens to my data if I downgrade?</p>
                  <p className="text-slate-600 text-sm mt-1">
                    All your contacts and data remain safe and accessible. However, if you exceed your plan's contact limit, you'll need to remove contacts or upgrade again to add new ones.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">How does billing work?</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Plans are billed monthly. You can cancel anytime and continue using your plan until the end of the billing period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
