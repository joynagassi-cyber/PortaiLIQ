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
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function CreatePortalDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom du portail est requis')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Portail créé avec succès !')
        setOpen(false)
        setFormData({ name: '', description: '' })
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouveau portail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau portail</DialogTitle>
          <DialogDescription>
            Créez un portail client pour collecter des informations de manière structurée.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du portail *</Label>
            <Input
              id="name"
              placeholder="Ex: Portail Client - Projet Alpha"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez l'objectif de ce portail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création...' : 'Créer le portail'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
