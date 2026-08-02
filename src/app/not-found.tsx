import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="space-y-2">
            <p className="text-6xl font-bold text-primary">404</p>
            <h1 className="text-2xl font-semibold text-foreground">This page could not be found</h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              The link may be broken, the page may have moved, or it may never have existed.
              Let&apos;s get you back on track.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'w-full')}
            >
              Back to Home
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
            >
              View Pricing
            </Link>
            <Link
              href="/signin"
              className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'w-full')}
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
