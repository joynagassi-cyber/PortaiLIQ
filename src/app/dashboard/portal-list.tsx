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
  Mail,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface Item {
  id: string
  label: string
  item_type: string
  required: boolean
}

interface Submission {
  id: string
  status: string
  submitted_at: string
}

interface Portal {
  id: string
  name: string
  description: string | null
  status: 'draft' | 'published' | 'archived'
  token: string
  items?: Item[]
  submissions?: Submission[]
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
  const [sendingReminder, setSendingReminder] = useState(false)

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

  const handleSendReminder = async () => {
    // In a real app, you would get the client email from somewhere
    // For now, we'll just show a toast
    setSendingReminder(true)
    try {
      // This would call the reminders API in a real implementation
      toast.info('Fonctionnalité de relance à implémenter')
    } catch {
      toast.error('Erreur lors de l\'envoi de la relance')
    } finally {
      setSendingReminder(false)
    }
  }

  const totalItems = portal.items?.length || 0
  const completedSubmissions = portal.submissions?.filter((s: Submission) => s.status === 'received').length || 0
  const pendingSubmissions = totalItems - completedSubmissions
  const progressPercentage = totalItems > 0 ? (completedSubmissions / totalItems) * 100 : 0

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
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-muted-foreground">
              {completedSubmissions}/{totalItems}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
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
              {completedSubmissions} reçu{completedSubmissions !== 1 ? 's' : ''}
            </span>
            <span className="text-sm text-muted-foreground">
              {pendingSubmissions} en attente{pendingSubmissions !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSendReminder}
              disabled={sendingReminder}
            >
              {sendingReminder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-1" />
              )}
              Relancer
            </Button>
            <Button asChild size="sm">
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                Ouvrir <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
