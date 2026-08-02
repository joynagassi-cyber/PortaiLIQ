'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Loader2, FileText, Image, Calendar, Hash, Globe, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ItemConfig {
  label: string
  description: string
  itemType: 'text' | 'file' | 'email' | 'phone' | 'number' | 'url' | 'date' | 'multiple_choice'
  required: boolean
  sortOrder: number
  choices?: string[]
  expectedFormat?: string
}

export function CreatePortalDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [portalName, setPortalName] = useState('')
  const [portalDescription, setPortalDescription] = useState('')
  const [items, setItems] = useState<ItemConfig[]>([])
  const [newItemType, setNewItemType] = useState<ItemConfig['itemType']>('text')

  const itemTypes = [
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'file', label: 'File', icon: Image },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'url', label: 'URL', icon: Globe },
    { value: 'date', label: 'Date', icon: Calendar },
  ]

  const addItem = () => {
    const newItem: ItemConfig = {
      label: '',
      description: '',
      itemType: newItemType,
      required: true,
      sortOrder: items.length,
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<ItemConfig>) => {
    setItems(items.map((item, i) => i === index ? { ...item, ...updates } : item))
  }

  const handleCreatePortal = async () => {
    if (!portalName.trim()) {
      toast.error('Portal name is required')
      return
    }

    if (items.length === 0) {
      toast.error('Add at least one item')
      return
    }

    setCreating(true)

    try {
      // Create portal
      const portalRes = await fetch('/api/portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: portalName,
          description: portalDescription || null,
        }),
      })

      if (!portalRes.ok) {
        const error = await portalRes.json()
        throw new Error(error.error || 'Failed to create portal')
      }

      const portalData = await portalRes.json()
      const portalId = portalData.portal.id

      // Create items
      for (const item of items) {
        const itemRes = await fetch(`/api/portals/${portalId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })

        if (!itemRes.ok) {
          const error = await itemRes.json()
          throw new Error(error.error || 'Failed to create item')
        }
      }

      toast.success('Portal created successfully!')
      setOpen(false)
      setPortalName('')
      setPortalDescription('')
      setItems([])
      router.refresh()
    } catch (error) {
      console.error('Error creating portal:', error)
      toast.error(error instanceof Error ? error.message : 'Creation failed')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          New Portal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a new portal</DialogTitle>
          <DialogDescription>
            Create a collection space for your client&apos;s information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portal Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portal-name">Portal Name *</Label>
              <Input
                id="portal-name"
                placeholder="e.g. Onboarding — Project X"
                value={portalName}
                onChange={(e) => setPortalName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-description">Description</Label>
              <Textarea
                id="portal-description"
                placeholder="Describe the purpose of this portal..."
                value={portalDescription}
                onChange={(e) => setPortalDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Items Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Portal Items</Label>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Item type"
                  className="text-sm border rounded-md px-2 py-1 bg-background"
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as ItemConfig['itemType'])}
                >
                  {itemTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const TypeIcon = itemTypes.find(t => t.value === item.itemType)?.icon || FileText
                return (
                  <Card key={index}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span className="text-sm font-medium">
                            Item {index + 1}
                          </span>
                          <Badge variant={item.required ? 'default' : 'secondary'}>
                            {item.required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete item ${index + 1}`}
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`item-label-${index}`} className="text-xs">Label *</Label>
                          <Input
                            id={`item-label-${index}`}
                            placeholder="e.g. Company Logo"
                            value={item.label}
                            onChange={(e) => updateItem(index, { label: e.target.value })}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Type</Label>
                          <div className="text-sm px-2 py-1.5 bg-muted rounded-md h-8 flex items-center">
                            {itemTypes.find(t => t.value === item.itemType)?.label}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`item-description-${index}`} className="text-xs">Description</Label>
                        <Input
                          id={`item-description-${index}`}
                          placeholder="Instructions for the client..."
                          value={item.description}
                          onChange={(e) => updateItem(index, { description: e.target.value })}
                          className="h-8"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-${index}`}
                          checked={item.required}
                          onChange={(e) => updateItem(index, { required: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor={`required-${index}`} className="text-xs">
                          Required field
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items configured</p>
                  <p className="text-sm">Add items to collect information from your clients</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreatePortal} disabled={creating || !portalName.trim() || items.length === 0}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              'Create Portal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
