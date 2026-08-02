import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle2, FileText, PenSquare, ShieldCheck, Sparkles, Upload } from 'lucide-react'

const year = new Date().getFullYear()

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Slim sticky header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-sm font-semibold tracking-tight">PortaiLIQ</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex" aria-label="Main">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
          </nav>
          <Link href="/signin" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero — the product, demonstrated */}
      <section className="container mx-auto px-4 py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <h1
              className="text-4xl font-bold tracking-tight text-foreground md:text-6xl"
              style={{ textWrap: 'balance' }}
            >
              Collect client information,<br />simply.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-xl text-muted-foreground lg:mx-0">
              PortaiLIQ gives every client a private portal — a professional handshake
              where documents and answers arrive structured, tracked, and follow-up ready.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: 'lg' }), '!h-11 group')}
              >
                Get Started
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/pricing"
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), '!h-11')}
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              setup in minutes · no credit card · AI optional
            </p>
          </div>

          {/* Live portal artifact */}
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <Card
              role="img"
              aria-label="Preview of a client portal collecting responses"
              className="overflow-hidden shadow-sm"
            >
              <CardContent className="p-0">
                {/* Portal header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
                      <Logo />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Acme Studio</p>
                      <p className="mt-1 font-mono text-xs tracking-tight text-muted-foreground">
                        portal/acme-7f3a9c
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    AWAITING
                  </Badge>
                </div>

                {/* Collected fields — flat rows, dividers only */}
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium leading-none">Project brief</p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          brief_v2.pdf · 2.4 MB
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <p className="text-sm font-medium">Budget range</p>
                    <p className="font-mono text-sm text-foreground">$4,500 – $6,000</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <p className="text-sm font-medium">Timeline</p>
                    <p className="font-mono text-sm text-foreground">3 weeks</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <p className="text-sm text-muted-foreground">Logo assets</p>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">waiting…</p>
                  </div>
                </div>

                {/* Live footer */}
                <div className="border-t px-5 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                      <p className="font-mono text-xs text-muted-foreground">collecting responses</p>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">3 of 5</p>
                  </div>
                  <Progress value={60} max={100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features — the workflow, structured as a sequence */}
      <section id="features" className="container mx-auto scroll-mt-20 px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground" style={{ textWrap: 'balance' }}>
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One workflow from draft to done — create the intake form, share a private
            link, and watch responses arrive.
          </p>
        </div>
        <ol className="relative mx-auto mt-14 max-w-3xl space-y-10 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-border sm:space-y-12">
          <li className="relative flex gap-5">
            <span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-background">
              <PenSquare className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Create Portals</h3>
              <p className="mt-1 max-w-xl text-muted-foreground">
                Define custom fields and questions for each client — text, files, dates,
                multiple choice. Configured in minutes.
              </p>
            </div>
          </li>
          <li className="relative flex gap-5">
            <span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-background">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Secure Collection</h3>
              <p className="mt-1 max-w-xl text-muted-foreground">
                Share a private link with each client, keep every file encrypted, and
                watch completion in real time while automatic reminders keep things moving.
              </p>
            </div>
          </li>
          <li className="relative flex gap-5">
            <span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-background">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-foreground">AI-Powered</h3>
              <p className="mt-1 max-w-xl text-muted-foreground">
                Completeness checks and auto-summaries flag what&apos;s missing — and it
                works just as well without AI.
              </p>
            </div>
          </li>
        </ol>

        {/* Compact trust line — machine voice */}
        <p className="mx-auto mt-12 max-w-3xl text-center font-mono text-xs text-muted-foreground">
          OAuth 2.0 · AES-256 encryption · GDPR-ready
        </p>
      </section>

      {/* Pricing preview */}
      <section id="pricing" className="container mx-auto scroll-mt-20 px-4 py-20">
        <h2
          className="mb-12 text-center text-3xl font-bold text-foreground"
          style={{ textWrap: 'balance' }}
        >
          Simple, transparent pricing
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          <Card className="flex flex-col border-border">
            <CardContent className="flex flex-1 flex-col items-center gap-4 pt-6 text-center">
              <h3 className="text-xl font-semibold">Starter</h3>
              <p className="text-3xl font-bold">
                $9<span className="font-mono text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="w-full space-y-2 text-left text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Up to 5 portals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  All field types
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  File uploads
                </li>
              </ul>
              <Link
                href="/pricing#starter"
                className={cn(buttonVariants({ className: 'mt-auto w-full' }))}
              >
                View Plans
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-primary shadow-md md:-mt-3">
            <CardContent className="flex flex-1 flex-col items-center gap-4 pt-6 text-center">
              <div className="flex justify-center">
                <Badge variant="secondary" className="font-mono text-xs">
                  POPULAR
                </Badge>
              </div>
              <h3 className="text-xl font-semibold">Professional</h3>
              <p className="text-3xl font-bold">
                $29<span className="font-mono text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="w-full space-y-2 text-left text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Unlimited portals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Advanced AI
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Custom branding
                </li>
              </ul>
              <Link
                href="/pricing#professional"
                className={cn(buttonVariants({ className: 'mt-auto w-full' }))}
              >
                View Plans
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-border">
            <CardContent className="flex flex-1 flex-col items-center gap-4 pt-6 text-center">
              <h3 className="text-xl font-semibold">Agency</h3>
              <p className="text-3xl font-bold">
                $99<span className="font-mono text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="w-full space-y-2 text-left text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Team seats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  White-label
                </li>
              </ul>
              <Link
                href="/pricing#agency"
                className={cn(buttonVariants({ className: 'mt-auto w-full' }))}
              >
                View Plans
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-sm font-semibold">PortaiLIQ</span>
            </div>
            <nav
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              aria-label="Footer"
            >
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </a>
              <Link href="/signin" className="transition-colors hover:text-foreground">
                Sign in
              </Link>
            </nav>
          </div>
          <p className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            © {year} PortaiLIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
