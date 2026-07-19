'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Item {
  id: string
  name: string
  description: string | null
  field_type: string
  options: string | null
  required: boolean
  order: number
}

interface Portal {
  id: string
  name: string
  description: string | null
  items: Item[]
}

export default function PortalPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [portal, setPortal] = useState<Portal | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchPortal()
  }, [params.token])

  const fetchPortal = async () => {
    try {
      const res = await fetch(`/api/portal/${params.token}`)
      const data = await res.json()

      if (res.ok && data.portal) {
        setPortal(data.portal)
      } else {
        toast.error(data.error || 'Portail non trouvé')
        router.push('/')
      }
    } catch {
      toast.error('Erreur de chargement')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (itemId: string, value: any) => {
    setFormData(prev => ({ ...prev, [itemId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const portalItems = portal?.items || []
    for (const item of portalItems) {
      if (item.required && !formData[item.id]) {
        toast.error(`Le champ "${item.name}" est obligatoire`)
        return
      }
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal_token: params.token,
          items_data: formData,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        toast.success('Formulaire soumis avec succès !')
      } else {
        toast.error(data.error || 'Erreur de soumission')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Merci !</CardTitle>
            <CardDescription>
              Votre soumission a été enregistrée avec succès.
              Le freelance vous contactera bientôt.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Portal Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Portail Client</Badge>
            </div>
            <CardTitle className="text-2xl">{portal?.name}</CardTitle>
            {portal?.description && (
              <CardDescription>{portal.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informations à fournir</CardTitle>
              <CardDescription>
                Veuillez remplir tous les champs obligatoires (*)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(portal?.items || []).map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label htmlFor={item.id}>
                    {item.name}
                    {item.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {item.field_type === 'text' && (
                    <Textarea
                      id={item.id}
                      placeholder={item.description || 'Saisissez votre réponse...'}
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      rows={3}
                    />
                  )}

                  {item.field_type === 'email' && (
                    <Input
                      id={item.id}
                      type="email"
                      placeholder="exemple@email.com"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.field_type === 'phone' && (
                    <Input
                      id={item.id}
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.field_type === 'number' && (
                    <Input
                      id={item.id}
                      type="number"
                      placeholder="Entrez un nombre"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.field_type === 'url' && (
                    <Input
                      id={item.id}
                      type="url"
                      placeholder="https://..."
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.field_type === 'select' && item.options && (
                    <select
                      id={item.id}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    >
                      <option value="">Sélectionnez une option</option>
                      {JSON.parse(item.options).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {item.field_type === 'textarea' && (
                    <Textarea
                      id={item.id}
                      placeholder={item.description || 'Saisissez votre réponse...'}
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      rows={5}
                    />
                  )}

                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Soumission en cours...
              </>
            ) : (
              'Soumettre ma réponse'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
