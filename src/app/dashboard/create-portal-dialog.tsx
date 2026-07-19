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
  id: string
  label: string
  description: string
  itemType: 'text' | 'file' | 'email' | 'phone' | 'number' | 'url' | 'date'
  required: boolean
  sortOrder: number
}

export function CreatePortalDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [portalName, setPortalName] = useState('')
  const [portalDescription, setPortalDescription] = useState('')
  const [items, setItems] = useState<ItemConfig[]>([])
  const [newItemType, setNewItemType] = useState<'text' | 'file' | 'email' | 'phone' | 'number' | 'url' | 'date'>('text')

  const itemTypes = [
    { value: 'text', label: 'Texte', icon: FileText },
    { value: 'file', label: 'Fichier', icon: Image },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Téléphone', icon: Phone },
    { value: 'number', label: 'Nombre', icon: Hash },
    { value: 'url', label: 'URL', icon: Globe },
    { value: 'date', label: 'Date', icon: Calendar },
  ]

  const addItem = () => {
    const newItem: ItemConfig = {
      id: Date.now().toString(),
      label: '',
      description: '',
      itemType: newItemType,
      required: true,
      sortOrder: items.length,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<ItemConfig>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const handleCreatePortal = async () => {
    if (!portalName.trim()) {
      toast.error('Le nom du portail est requis')
      return
    }

    if (items.length === 0) {
      toast.error('Ajoutez au moins un item')
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
          description: portalDescription,
        }),
      })

      if (!portalRes.ok) {
        const error = await portalRes.json()
        throw new Error(error.error || 'Erreur lors de la création du portail')
      }

      const portalData = await portalRes.json()
      const portalId = portalData.portal.id

      // Create items
      for (const item of items) {
        const itemRes = await fetch(`/api/portals/${portalId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: item.label,
            description: item.description,
            itemType: item.itemType,
            required: item.required,
            sortOrder: item.sortOrder,
          }),
        })

        if (!itemRes.ok) {
          const error = await itemRes.json()
          throw new Error(error.error || 'Erreur lors de la création des items')
        }
      }

      toast.success('Portail créé avec succès !')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating portal:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Portail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau portail</DialogTitle>
          <DialogDescription>
            Créez un espace de collecte d'informations pour vos clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portal Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portal-name">Nom du portail *</Label>
              <Input
                id="portal-name"
                placeholder="Ex: Onboarding - Projet X"
                value={portalName}
                onChange={(e) => setPortalName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-description">Description</Label>
              <Textarea
                id="portal-description"
                placeholder="Décrivez l'objectif de ce portail..."
                value={portalDescription}
                onChange={(e) => setPortalDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Items Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Éléments du portail</Label>
              <div className="flex items-center gap-2">
                <select
                  className="text-sm border rounded-md px-2 py-1"
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as any)}
                >
                  {itemTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const TypeIcon = itemTypes.find(t => t.value === item.itemType)?.icon || FileText
                return (
                  <Card key={item.id}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Élément {index + 1}
                          </span>
                          <Badge variant={item.required ? 'default' : 'secondary'}>
                            {item.required ? 'Requis' : 'Optionnel'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Label *</Label>
                          <Input
                            placeholder="Ex: Logo haute résolution"
                            value={item.label}
                            onChange={(e) => updateItem(item.id, { label: e.target.value })}
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
                        <Label className="text-xs">Description</Label>
                        <Input
                          placeholder="Instructions pour le client..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          className="h-8"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-${item.id}`}
                          checked={item.required}
                          onChange={(e) => updateItem(item.id, { required: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor={`required-${item.id}`} className="text-xs">
                          Champ obligatoire
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun élément configuré</p>
                  <p className="text-sm">Ajoutez des éléments pour collecter les informations de vos clients</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
            Annuler
          </Button>
          <Button onClick={handleCreatePortal} disabled={creating || !portalName.trim() || items.length === 0}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              'Créer le portail'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
