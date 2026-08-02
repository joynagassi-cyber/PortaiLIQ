import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle, FileText, Download } from 'lucide-react'
import Link from 'next/link'

export default async function PortalStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const supabase = await createClient()

  // Get access link by token with portal and submissions
  const { data: accessLink, error: linkError } = await supabase
    .from('portal_access_links')
    .select(`
      id,
      portal_id,
      client_label,
      created_at,
      portal:portals(
        id,
        name,
        description,
        user_id
      ),
      submissions:submissions(
        id,
        content_text,
        file_url,
        file_name,
        file_type,
        status,
        submitted_at,
        portal_item:portal_items(
          id,
          label,
          item_type
        )
      )
    `)
    .eq('token', token)
    .single()

  if (linkError || !accessLink || !accessLink.portal) {
    notFound()
  }

  const portal = accessLink.portal
  const submissions = accessLink.submissions || []

  const totalItems = submissions.length
  const completedItems = submissions.filter((s: any) => s.status === 'received').length
  const pendingItems = totalItems - completedItems

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Portal Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline">Portal Status</Badge>
            </div>
            <CardTitle className="text-2xl">{portal.name}</CardTitle>
            {portal.description && (
              <CardDescription>{portal.description}</CardDescription>
            )}
            {accessLink.client_label && (
              <p className="text-sm text-muted-foreground mt-2">
                Client: {accessLink.client_label}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{completedItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
            <CardDescription>
              History of everything you&apos;ve sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission: any) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{submission.portal_item.label}</h4>
                      <Badge variant={submission.status === 'received' ? 'default' : 'secondary'}>
                        {submission.status === 'received' ? 'Received' : 'Pending'}
                      </Badge>
                    </div>

                    {submission.content_text && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {submission.content_text}
                      </p>
                    )}

                    {submission.file_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Download className="h-4 w-4" />
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {submission.file_name}
                        </a>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString('en-US')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to portal link */}
        <div className="text-center mt-6">
          <Link
            href={`/portal/${token}`}
            className="text-sm text-primary hover:underline"
          >
            Back to portal
          </Link>
        </div>
      </div>
    </div>
  )
}
