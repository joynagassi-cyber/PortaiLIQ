'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Eye,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface Portal {
  id: string
  name: string
  description: string | null
  status: 'draft' | 'published' | 'archived'
  token: string
  items_count?: number
  created_at: string
}

export function PortalList({ portals }: { portals: Portal[] }) {
  return (
    <div className="space-y-4">
      {portals.map((portal) => (
        <PortalItem key={portal.id} portal={portal} />
      ))}
    </div>
  )
}

function PortalItem({ portal }: { portal: Portal }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/${portal.token}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      toast.success('Lien copié dans le presse-papiers !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce portail ?')) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/portals?id=${portal.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success('Portail supprimé')
        window.location.reload()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    draft: 'default',
    published: 'default',
    archived: 'secondary',
  }

  const statusLabels = {
    draft: 'Brouillon',
    published: 'Publié',
    archived: 'Archivé',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{portal.name}</CardTitle>
              <Badge variant={statusColors[portal.status]}>{statusLabels[portal.status]}</Badge>
            </div>
            <CardDescription>
              Créé le {new Date(portal.created_at).toLocaleDateString('fr-FR')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Voir le portail">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Modifier">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Supprimer" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {portal.description && (
          <p className="text-sm text-muted-foreground mb-4">{portal.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Lien du portail :</span>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate">
              {portalUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {portal.items_count || 0} élément{((portal.items_count || 0) !== 1) ? 's' : ''}
            </span>
          </div>
          <Button asChild size="sm">
            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
              Ouvrir <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
