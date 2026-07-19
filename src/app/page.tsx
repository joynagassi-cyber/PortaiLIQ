import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { CheckCircle2, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Collectez les infos de vos clients
          <span className="text-primary"> simplement</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          PortaiLIQ permet aux freelances de créer des portails clients personnalisés
          pour collecter des informations de manière structurée et professionnelle.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/signin">Se connecter</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tout ce dont vous avez besoin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Créez vos portails</h3>
                <p className="text-muted-foreground">
                  Définissez les champs et questions que vos clients doivent remplir.
                  Choisissez parmi texte, email, téléphone, URL et plus encore.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Interface intuitive
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Champs personnalisables
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Partage facile
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Collecte sécurisée</h3>
                <p className="text-muted-foreground">
                  Vos données et celles de vos clients sont protégées.
                  Accès sécurisé et conformité RGPD garantie.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Authentification forte
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Données chiffrées
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Conformité RGPD
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">IA intégrée</h3>
                <p className="text-muted-foreground">
                  Notre assistant IA vous aide à générer les bons champs
                  et à analyser les réponses reçues.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Suggestions intelligentes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Analyse automatique
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Rappels automatisés
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Des tarifs simples et transparents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Gratuit</h3>
                <p className="text-4xl font-bold">0€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    3 portails clients
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Champs illimités
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Assistant IA (limité)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Rappels email
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/signup">Commencer</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-4xl font-bold">9€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Portails illimités
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Assistant IA illimité
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Thème personnalisé
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Export CSV
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/signup">Passer au Pro</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 PortaiLIQ. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
