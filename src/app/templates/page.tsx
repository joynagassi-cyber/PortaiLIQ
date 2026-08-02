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

  // Fetch user templates
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
            <Badge variant="secondary" className="text-xs">Templates</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Templates</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage reusable field templates
            </p>
          </div>
          <Button asChild disabled>
            <Link href="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              New Template (Coming Soon)
            </Link>
          </Button>
        </div>

        {/* Starter Kits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Starter Kits
            </CardTitle>
            <CardDescription>
              Use pre-built templates to get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Designer', icon: '🎨', description: 'For graphic designers' },
                { name: 'Developer', icon: '💻', description: 'For web developers' },
                { name: 'Consultant', icon: '📊', description: 'For consultants' },
                { name: 'Coach', icon: '🎯', description: 'For professional coaches' },
                { name: 'Photographer', icon: '📸', description: 'For photographers' },
              ].map((kit) => (
                <Card key={kit.name} className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{kit.icon}</div>
                      <h3 className="font-semibold mb-1">{kit.name}</h3>
                      <p className="text-sm text-muted-foreground">{kit.description}</p>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Use this kit
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
          <h2 className="text-xl font-semibold text-foreground">Your Templates</h2>

          {!templates || templates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  Create your first template to easily reuse your favorite field combinations.
                </p>
                <Button asChild>
                  <Link href="/templates/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a template
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
                          {template.profession_category || 'Uncategorized'}
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
                        Created {new Date(template.created_at).toLocaleDateString('en-US')}
                      </span>
                      <Button variant="outline" size="sm">
                        Use
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
