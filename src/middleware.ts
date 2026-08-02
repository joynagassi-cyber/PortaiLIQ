import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Routes that require authentication
const AUTH_REQUIRED_PREFIXES = [
  '/dashboard',
  '/api/portals',
  '/api/templates',
  '/api/submissions',
  '/api/exports',
  '/api/gumroad/verify',
  '/api/dashboard',
  '/api/reminders',
  '/api/ai',
  '/api/upload',
  '/api/starter-kits',
]

// Routes that are public (no auth required)
const PUBLIC_PATHS = [
  '/',
  '/signin',
  '/signup',
  '/pricing',
  '/portal/',
  '/auth/callback',
  '/auth/signout',
  '/auth/confirm',
  '/api/auth/',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is explicitly public
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))
  if (isPublic) {
    // Still refresh session for public routes
    const supabase = await createClient()
    await supabase.auth.getUser()
    return NextResponse.next()
  }

  // Check if path requires auth
  const requiresAuth = AUTH_REQUIRED_PREFIXES.some(p => pathname.startsWith(p))
  if (!requiresAuth) {
    return NextResponse.next()
  }

  // Auth required — check session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Refresh session
  await supabase.auth.getUser()

  const response = NextResponse.next()
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
