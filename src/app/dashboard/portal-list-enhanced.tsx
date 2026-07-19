'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  ExternalLink, 
  Trash2, 
  Edit,
  Users,
  FileText,
  Clock
} from 'lucide-react'

interface Portal {
  id: string
  title: string
  description: string
  share_token: string
  status: 'active' | 'archived' | 'draft'
  submissions_count: number
  created_at: string
}

export default function PortalList() {
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null)

  useEffect(() => {
    fetchPortals()
  }, [])

  const fetchPortals = async () => {
    try {
      const response = await fetch('/api/portals')
      const data = await response.json()
      setPortals(data)
    } catch (error) {
      console.error('Failed to fetch portals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async (portalId: string) => {
    try {
      const response = await fetch(`/api/exports/csv?portalId=${portalId}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portail-${portalId.substring(0, 8)}-exports.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('CSV export failed:', error)
      alert('Failed to export CSV. Please try again.')
    }
  }

  const handleDelete = async (portalId: string) => {
    if (!confirm('Are you sure you want to delete this portal?')) return
    
    try {
      const response = await fetch(`/api/portals/${portalId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setPortals(portals.filter(p => p.id !== portalId))
      }
    } catch (error) {
      console.error('Failed to delete portal:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {portals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No portals yet
            </h3>
            <p className="text-gray-600 text-center">
              Create your first client intake portal to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        portals.map((portal) => (
          <Card key={portal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">{portal.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {portal.description || 'No description'}
                </p>
              </div>
              <Badge 
                variant={portal.status === 'active' ? 'default' : 'secondary'}
              >
                {portal.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{portal.submissions_count || 0} submissions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Created {new Date(portal.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedPortal(portal.id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a 
                    href={`/portal/${portal.share_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Portal
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportCSV(portal.id)}
                  disabled={!portal.submissions_count}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(portal.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
