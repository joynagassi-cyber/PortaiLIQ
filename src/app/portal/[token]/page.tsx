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
  choices?: string[]
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
        toast.error(data.error || 'Portal not found')
        router.push('/')
      }
    } catch {
      toast.error('Failed to load portal')
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
      // Step 1: Get presigned URL
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          portalItemId: itemId,
        }),
      })

      const presignData = await presignRes.json()

      if (!presignRes.ok) {
        toast.error(presignData.error || 'Failed to get upload URL')
        return
      }

      // Step 2: Upload to R2
      await fetch(presignData.uploadUrl, {
        method: 'PUT',
        body: file,
      })

      // Step 3: Complete upload
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: presignData.key,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          portalItemId: itemId,
        }),
      })

      const completeData = await completeRes.json()

      if (completeRes.ok) {
        setFormData(prev => ({
          ...prev,
          [itemId]: {
            file_url: completeData.fileUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          },
        }))
        if (presignData.warning) {
          toast.warning(presignData.warning, { duration: 5000 })
        } else {
          toast.success('File uploaded!')
        }
      } else {
        toast.error(completeData.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const portalItems = portal?.items || []
    for (const item of portalItems) {
      if (item.required) {
        const value = formData[item.id]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          toast.error(`"${item.label}" is required`)
          return
        }
      }
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalToken: params.token,
          answers: formData,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        toast.success('Submitted successfully!')
      } else {
        if (data.missing) {
          toast.error(`Missing: ${data.missing.join(', ')}`)
        } else {
          toast.error(data.error || 'Submission failed')
        }
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
            <CardTitle>Thank you!</CardTitle>
            <CardDescription>
              Your submission has been received. The freelancer will review your responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!portal) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Portal Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Client Portal</Badge>
              {portal.freelancer_name && (
                <Badge variant="secondary">{portal.freelancer_name}</Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{portal.name}</CardTitle>
            {portal.description && (
              <CardDescription>{portal.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Information Needed</CardTitle>
              <CardDescription>
                Please fill in all required fields (*)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {portal.items.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label htmlFor={item.id}>
                    {item.label}
                    {item.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {item.item_type === 'text' && (
                    <Textarea
                      id={item.id}
                      placeholder={item.description || 'Enter your response...'}
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      rows={3}
                    />
                  )}

                  {item.item_type === 'email' && (
                    <Input
                      id={item.id}
                      type="email"
                      placeholder="example@email.com"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.item_type === 'phone' && (
                    <Input
                      id={item.id}
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.item_type === 'number' && (
                    <Input
                      id={item.id}
                      type="number"
                      placeholder="Enter a number"
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

                  {item.item_type === 'date' && (
                    <Input
                      id={item.id}
                      type="date"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}

                  {item.item_type === 'multiple_choice' && item.choices && (
                    <select
                      id={item.id}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData[item.id] || ''}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    >
                      <option value="">Select an option</option>
                      {item.choices.map((choice) => (
                        <option key={choice} value={choice}>{choice}</option>
                      ))}
                    </select>
                  )}

                  {item.item_type === 'file' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id={item.id}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(item.id, file)
                          }}
                          disabled={uploadingFiles[item.id]}
                        />
                        {uploadingFiles[item.id] && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      {formData[item.id]?.file_name && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" aria-hidden="true" />
                          <span>Uploaded: {formData[item.id].file_name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Remove file"
                            className="h-8 w-8 p-0 text-green-600 hover:text-red-600"
                            onClick={() => handleInputChange(item.id, null)}
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </div>
                      )}
                      {item.expected_format && (
                        <p className="text-xs text-muted-foreground">
                          Expected format: {item.expected_format}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              'Submit My Response'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
