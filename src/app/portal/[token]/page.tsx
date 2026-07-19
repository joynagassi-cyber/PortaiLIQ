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
import { Loader2, CheckCircle, AlertCircle, Upload, X } from 'lucide-react'

interface Item {
  id: string
  label: string
  description: string | null
  item_type: string
  expected_format: string | null
  required: boolean
  sort_order: number
}

interface Portal {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  freelancer_name: string
  items: Item[]
  access_link_token: string
}

export default function PortalPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [portal, setPortal] = useState<Portal | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})

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

  const handleFileUpload = async (itemId: string, file: File) => {
    setUploadingFiles(prev => ({ ...prev, [itemId]: true }))
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('item_id', itemId)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setFormData(prev => ({ 
          ...prev, 
          [itemId]: {
            file_url: data.file_url,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type
          }
        }))
        toast.success('Fichier uploadé avec succès')
      } else {
        toast.error(data.error || 'Erreur d\'upload')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!portal?.access_link_token) {
      toast.error('Token d\'accès manquant')
      return
    }

    // Validate required fields
    const portalItems = portal.items || []
    for (const item of portalItems) {
      if (item.required) {
        const value = formData[item.id]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          toast.error(`Le champ "${item.label}" est obligatoire`)
          return
        }
      }
    }

    setSubmitting(true)

    try {
      // Prepare submissions data
      const submissions = portalItems.map(item => {
        const value = formData[item.id]
        if (item.item_type === 'file') {
          return {
            portal_item_id: item.id,
            file_url: value?.file_url,
            file_name: value?.file_name,
            file_size: value?.file_size,
            file_type: value?.file_type,
          }
        } else {
          return {
            portal_item_id: item.id,
            content_text: value,
          }
        }
      })

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal_token: params.token,
          link_token: portal.access_link_token,
          submissions: submissions,
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
              {portal?.freelancer_name && (
                <Badge variant="secondary">{portal.freelancer_name}</Badge>
              )}
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
                    {item.label}
                    {item.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {item.item_type === 'text' && (
                    <Textarea
                      id={item.id}
                      placeholder={item.description || 'Saisissez votre réponse...'}
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      rows={3}
                    />
                  )}

                  {item.item_type === 'email' && (
                    <Input
                      id={item.id}
                      type="email"
                      placeholder="exemple@email.com"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.item_type === 'phone' && (
                    <Input
                      id={item.id}
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.item_type === 'number' && (
                    <Input
                      id={item.id}
                      type="number"
                      placeholder="Entrez un nombre"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.item_type === 'url' && (
                    <Input
                      id={item.id}
                      type="url"
                      placeholder="https://..."
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.item_type === 'file' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id={item.id}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(item.id, file)
                            }
                          }}
                          disabled={uploadingFiles[item.id]}
                        />
                        {uploadingFiles[item.id] && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                      {formData[item.id]?.file_name && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Fichier uploadé: {formData[item.id].file_name}</span>
                        </div>
                      )}
                      {item.expected_format && (
                        <p className="text-xs text-muted-foreground">
                          Format attendu: {item.expected_format}
                        </p>
                      )}
                    </div>
                  )}

                  {item.description && item.item_type !== 'file' && (
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
