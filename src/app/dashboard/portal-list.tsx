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
  ExternalLink,
  Loader2,
  Check,
  Link as LinkIcon,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'

interface Item {
  id: string
  label: string
  item_type: string
  required: boolean
  submissions?: { status: string }[]
}

interface Portal {
  id: string
  name: string
  description: string | null
  status: string
  items: Item[]
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
  const [loading, setLoading] = useState<string | null>(null)

  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/${portal.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this portal?')) return
    setLoading('delete')
    try {
      const res = await fetch(`/api/portals/${portal.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Portal deleted')
        window.location.reload()
      } else {
        toast.error('Failed to delete portal')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(null)
    }
  }

  const handleGenerateLink = async () => {
    setLoading('link')
    try {
      const res = await fetch('/api/portals/' + portal.id + '/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId: portal.id }),
      })
      if (res.ok) {
        const data = await res.json()
        await navigator.clipboard.writeText(data.link.url)
        toast.success('Link generated and copied!')
      } else {
        toast.error('Failed to generate link')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(null)
    }
  }

  const handleExport = () => {
    window.open(`/api/exports/csv?portalId=${portal.id}`, '_blank')
  }

  // Calculate submission stats
  const totalItems = portal.items?.length || 0
  const completedSubmissions = portal.items?.reduce((acc: number, item: Item) => {
    const subs = item.submissions as any[]
    if (!subs || subs.length === 0) return acc
    return acc + (subs.filter((s) => s.status === 'received').length > 0 ? 1 : 0)
  }, 0) || 0
  const pendingSubmissions = totalItems - completedSubmissions
  const progressPercentage = totalItems > 0 ? (completedSubmissions / totalItems) * 100 : 0

  const statusLabels: Record<string, string> = {
    active: 'Active',
    archived: 'Archived',
    completed: 'Completed',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{portal.name}</CardTitle>
              <Badge variant="secondary">{statusLabels[portal.status] || portal.status}</Badge>
            </div>
            <CardDescription>
              Created {new Date(portal.created_at).toLocaleDateString('en-US')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="View portal" asChild>
              <a href={`/portal/${portal.id}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Delete portal" onClick={handleDelete} disabled={loading === 'delete'}>
              {loading === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
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
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedSubmissions}/{totalItems}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" aria-label="Submission progress" />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4 mr-1" aria-hidden="true" /> : <Copy className="h-4 w-4 mr-1" aria-hidden="true" />}
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateLink} disabled={loading === 'link'}>
            {loading === 'link' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" /> : <LinkIcon className="h-4 w-4 mr-1" aria-hidden="true" />}
            Generate Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading !== null}>
            <Download className="h-4 w-4 mr-1" aria-hidden="true" />
            Export CSV
          </Button>
          <Button size="sm" asChild>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
              Open <ExternalLink className="ml-2 h-3 w-3" aria-hidden="true" />
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{completedSubmissions} received</span>
          <span>{pendingSubmissions} pending</span>
        </div>
      </CardContent>
    </Card>
  )
}
