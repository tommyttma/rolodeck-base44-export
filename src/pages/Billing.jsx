import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Lock, Check } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Billing() {
  const [userTier, setUserTier] = useState('free');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingZip: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setUserTier(user.subscription_tier || 'free');
    };
    loadUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Payment method added successfully!');
    setIsProcessing(false);
    window.location.href = createPageUrl('Upgrade');
  };

  const handleChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Upgrade')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Plans
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Payment Method</h1>
          <p className="text-slate-600 mt-1">Add your payment details to upgrade your plan</p>
        </div>

        {/* Security Notice */}
        <Card className="border-0 bg-blue-50 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="p-2 bg-blue-100 rounded-lg h-fit">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Your payment is secure</h3>
                <p className="text-sm text-slate-600">
                  All transactions are encrypted and secure. We never store your full card details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Card Details
            </CardTitle>
            <CardDescription>Enter your payment information below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
                  className="bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={(e) => handleChange('expiryDate', formatExpiryDate(e.target.value))}
                    maxLength={5}
                    className="bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').substr(0, 4))}
                    className="bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  placeholder="John Smith"
                  value={cardDetails.nameOnCard}
                  onChange={(e) => handleChange('nameOnCard', e.target.value)}
                  className="bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingZip">Billing ZIP Code</Label>
                <Input
                  id="billingZip"
                  placeholder="12345"
                  value={cardDetails.billingZip}
                  onChange={(e) => handleChange('billingZip', e.target.value)}
                  className="bg-white"
                  required
                />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Accepted Cards */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">We accept all major credit cards</p>
        </div>
      </div>
    </div>
  );
}
