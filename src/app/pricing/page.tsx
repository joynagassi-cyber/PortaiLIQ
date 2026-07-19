'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Start with one portal and basic features.',
    features: [
      '1 active portal',
      'Basic form fields',
      'Manual reminders',
      'Community support',
    ],
    cta: 'Get Started',
    ctaLink: '/signup',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'For freelancers managing a few clients.',
    features: [
      'Up to 5 active portals',
      'All field types + file upload',
      'Scheduled reminders',
      'Basic AI summaries',
      'Email support',
    ],
    cta: 'Upgrade to Starter',
    ctaLink: `https://gumroad.com/l/your-starter-product`,
    popular: true,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'For serious freelancers and small agencies.',
    features: [
      'Unlimited portals',
      'Custom branding & themes',
      'Advanced AI (extract, categorize, translate)',
      'Priority email support',
      'Analytics dashboard',
    ],
    cta: 'Upgrade to Professional',
    ctaLink: `https://gumroad.com/l/your-professional-product`,
    popular: false,
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/month',
    description: 'For teams managing many clients at scale.',
    features: [
      'Everything in Professional',
      'Team seats (up to 10)',
      'White-label portals',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Upgrade to Agency',
    ctaLink: `https://gumroad.com/l/your-agency-product`,
    popular: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = (planName: string, link: string) => {
    if (planName === 'Free') return;
    setLoading(planName);
    // Open Gumroad checkout in new tab
    window.open(link, '_blank');
    setTimeout(() => setLoading(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your freelance business. Upgrade or downgrade anytime through your Gumroad receipt.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? 'border-blue-500 border-2 shadow-lg scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.name, plan.ctaLink)}
                  disabled={loading === plan.name}
                >
                  {loading === plan.name ? 'Opening...' : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">How does payment work?</h3>
              <p className="text-gray-600 mt-1">
                We use Gumroad for payments. Click any upgrade button to purchase through Gumroad&apos;s secure checkout.
                After purchase, you&apos;ll receive a license key via email that activates your plan instantly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Can I switch plans later?</h3>
              <p className="text-gray-600 mt-1">
                Yes! Purchase a different product on Gumroad and your plan will update automatically.
                No prorated charges — your new tier takes effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Is there a free trial?</h3>
              <p className="text-gray-600 mt-1">
                The Free plan is永久 available. No credit card required. Upgrade only when you&apos;re ready.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">What happens if I don&apos;t renew?</h3>
              <p className="text-gray-600 mt-1">
                Your account reverts to the Free plan. Existing portals remain accessible but new portal creation
                is limited to 1.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
