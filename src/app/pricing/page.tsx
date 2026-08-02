'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PLANS = [
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
    cta: 'Get Started',
    gumroadProductId: process.env.NEXT_PUBLIC_GUMROAD_STARTER_PRODUCT_ID || '#',
    popular: false,
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
    gumroadProductId: process.env.NEXT_PUBLIC_GUMROAD_PRO_PRODUCT_ID || '#',
    popular: true,
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
    gumroadProductId: process.env.NEXT_PUBLIC_GUMROAD_AGENCY_PRODUCT_ID || '#',
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = (planName: string, gumroadProductId: string) => {
    setLoading(planName)
    // Open Gumroad checkout in new tab
    window.open(`https://gumroad.com/l/${gumroadProductId}`, '_blank')
    setTimeout(() => setLoading(null), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your freelance business. No free tier — start with Starter and upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? 'border-primary border-2 shadow-sm scale-[1.02]'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <svg
                        className="w-5 h-5 text-primary shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                  onClick={() => handleUpgrade(plan.name, plan.gumroadProductId)}
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
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground">How does payment work?</h3>
              <p className="text-muted-foreground mt-1">
                We use Gumroad for secure checkout. Click any plan to purchase through Gumroad&apos;s
                payment system. After purchase, your plan activates immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Can I switch plans later?</h3>
              <p className="text-muted-foreground mt-1">
                Yes! Purchase a different plan on Gumroad and your tier updates automatically.
                No prorated charges — your new tier takes effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Is there a free trial?</h3>
              <p className="text-muted-foreground mt-1">
                No. All plans are paid. Start with Starter ($9/mo) and upgrade as you grow.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">What happens if I cancel?</h3>
              <p className="text-muted-foreground mt-1">
                Your account remains active until the end of your billing period.
                Portals and data are preserved indefinitely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
