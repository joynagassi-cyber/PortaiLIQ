import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink, Trash2, Edit, Loader2, AlertCircle, Mail, FileText, Users } from 'lucide-react'
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

  // Fetch user's portals with submissions count
  const { data: portals, error: portalsError } = await supabase
    .from('portals')
    .select(`
      *,
      items:portal_items(*),
      submissions:submissions(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Calculate statistics
  const totalPortals = portals?.length || 0
  const totalItems = portals?.reduce((acc: number, p: any) => acc + (p.items?.length || 0), 0) || 0
  const totalSubmissions = portals?.reduce((acc: number, p: any) => acc + (p.submissions?.[0]?.count || 0), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-xl text-primary">
              PortaiLIQ
            </Link>
            <Badge variant="secondary" className="text-xs">
              Freelance
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos portails clients et collectez leurs informations
            </p>
          </div>
          <CreatePortalDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portails</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPortals}</div>
              <p className="text-xs text-muted-foreground">
                Actifs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Éléments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Champs créés
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Soumissions</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Recevues
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gratuit</div>
              <p className="text-xs text-muted-foreground">
                {totalPortals}/3 portails gratuits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Portals List */}
        {portalsError ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-destructive">Erreur lors du chargement des portails</p>
          </div>
        ) : portals && portals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun portail créé</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Créez votre premier portail client pour collecter des informations
                de manière structurée et professionnelle.
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
