'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (error) {
        if (error.message.includes('user already registered')) {
          setError('Un compte existe déjà avec cette adresse email. Veuillez vous connecter.')
          router.push('/signin')
          return
        }
        setError(error.message)
        return
      }

      if (data?.user) {
        toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        router.push('/signin')
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
            <CardDescription className="text-center">
              Commencez avec PortaiLIQ gratuitement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 caractères"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              Déjà inscrit ?{' '}
              <a href="/signin" className="text-primary hover:underline">
                Se connecter
              </a>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              En créant un compte, vous acceptez nos{' '}
              <a href="/terms" className="hover:underline">Conditions d'utilisation</a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
