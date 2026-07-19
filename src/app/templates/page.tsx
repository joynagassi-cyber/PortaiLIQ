import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Trash2, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function TemplatesPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/signin')
  }

  // Fetch user's templates
  const { data: templates } = await supabase
    .from('demand_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
              Templates
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">
                Retour au Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes Templates</h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez vos modèles de demandes réutilisables
            </p>
          </div>
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Template
            </Link>
          </Button>
        </div>

        {/* Starter Kits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Kits de démarrage
            </CardTitle>
            <CardDescription>
              Utilisez nos templates pré-conçus pour démarrer rapidement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Designer', icon: '🎨', description: 'Pour les designers graphiques' },
                { name: 'Développeur', icon: '💻', description: 'Pour les développeurs web' },
                { name: 'Consultant', icon: '📊', description: 'Pour les consultants' },
                { name: 'Coach', icon: '🎯', description: 'Pour les coaches professionnels' },
                { name: 'Photographe', icon: '📸', description: 'Pour les photographes' },
              ].map((kit) => (
                <Card key={kit.name} className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{kit.icon}</div>
                      <h3 className="font-semibold mb-1">{kit.name}</h3>
                      <p className="text-sm text-muted-foreground">{kit.description}</p>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Utiliser ce kit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vos Templates</h2>
          
          {!templates || templates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun template créé</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  Créez votre premier template pour réutiliser facilement vos demandes favorites.
                </p>
                <Button asChild>
                  <Link href="/templates/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un template
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template: any) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          {template.profession_category || 'Sans catégorie'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Créé le {new Date(template.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <Button variant="outline" size="sm">
                        Utiliser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
