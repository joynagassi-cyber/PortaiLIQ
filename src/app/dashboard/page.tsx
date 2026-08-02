import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink, Trash2, Loader2, AlertCircle, Mail, FileText, Users } from 'lucide-react'
import Link from 'next/link'
import { PortalList } from './portal-list'
import { CreatePortalDialog } from './create-portal-dialog'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check auth
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/signin')
  }

  // Fetch user's portals with items and submissions
  const { data: portals, error: portalsError } = await supabase
    .from('portals')
    .select(`
      *,
      items:portal_items(*),
      submissions:portal_items(submissions(status))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user profile from Supabase auth
  const fullName = user.user_metadata?.full_name || user.email || 'Freelancer'

  // Calculate statistics
  const safePortals = portals || []
  const totalPortals = safePortals.length
  const totalItems = safePortals.reduce((acc: number, p: any) => {
    const items = p.items as any[]
    return acc + (items?.length || 0)
  }, 0)
  const totalSubmissions = safePortals.reduce((acc: number, p: any) => {
    const items = p.items as any[]
    if (!items) return acc
    for (const item of items) {
      const subs = item.submissions as any[]
      if (subs) {
        acc += subs.filter((s: any) => s.status === 'received').length
      }
    }
    return acc
  }, 0)

  // Check license status
  let planTier = 'none'
  try {
    const { data: licenses } = await supabase
      .from('gumroad_licenses')
      .select('plan_tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (licenses?.[0]?.plan_tier) {
      planTier = licenses[0].plan_tier
    }
  } catch {
    // License check is non-critical
  }

  const planLabels: Record<string, string> = {
    none: 'No Plan',
    starter: 'Starter',
    professional: 'Professional',
    agency: 'Agency',
  }

  const planLimits: Record<string, string> = {
    none: 'Upgrade required',
    starter: `${totalPortals}/5 portals`,
    professional: 'Unlimited',
    agency: 'Unlimited',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-xl text-primary">
              PortaiLIQ
            </Link>
            <Badge variant="secondary" className="text-xs">Freelance</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your client portals and track submissions
            </p>
          </div>
          <CreatePortalDialog />
        </div>

        {/* Upgrade Banner */}
        {planTier === 'none' && (
          <Card className="mb-8 border-primary/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">No active plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to create portals and collect client information.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPortals}</div>
              <p className="text-xs text-muted-foreground">
                {planLimits[planTier]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Fields created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planLabels[planTier]}</div>
              <p className="text-xs text-muted-foreground">
                {planTier === 'none' ? 'Upgrade required' : 'Active'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Portals List */}
        {portalsError ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-destructive">Error loading portals</p>
          </div>
        ) : portals && portals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No portals yet</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Create your first client portal to collect information
                in a structured, professional way.
              </p>
              <CreatePortalDialog />
            </CardContent>
          </Card>
        ) : (
          <PortalList portals={portals} />
        )}
      </main>
    </div>
  )
}
