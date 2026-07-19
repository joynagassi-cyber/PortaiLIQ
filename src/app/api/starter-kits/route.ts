import { NextResponse } from 'next/server'

// Kits de démarrage par métier
const STARTER_KITS = {
  designer: {
    name: 'Designer',
    items: [
      {
        label: 'Logo haute résolution',
        description: 'Fichier PNG ou SVG en haute résolution',
        itemType: 'file' as const,
        expectedFormat: 'PNG, SVG',
        required: true,
      },
      {
        label: 'Palette de couleurs',
        description: 'Codes couleur principaux et secondaires',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Polices utilisées',
        description: 'Noms des polices et liens de téléchargement si possible',
        itemType: 'text' as const,
        required: false,
      },
      {
        label: 'Exemples d\'inspirations',
        description: 'Liens vers des designs que vous aimez',
        itemType: 'url' as const,
        required: false,
      },
      {
        label: 'Brief du projet',
        description: 'Description détaillée de vos besoins et objectifs',
        itemType: 'textarea' as const,
        required: true,
      },
    ],
  },
  developer: {
    name: 'Développeur',
    items: [
      {
        label: 'Accès au repository',
        description: 'Lien vers le repo GitHub/GitLab ou accès direct',
        itemType: 'url' as const,
        required: true,
      },
      {
        label: 'Documentation technique',
        description: 'Docs existantes ou spécifications techniques',
        itemType: 'file' as const,
        expectedFormat: 'PDF, MD',
        required: false,
      },
      {
        label: 'Stack technologique',
        description: 'Technologies et frameworks utilisés',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Environnements d\'hébergement',
        description: 'URLs des environnements dev, staging, production',
        itemType: 'url' as const,
        required: false,
      },
      {
        label: 'Critères de succès',
        description: 'Comment mesurer le succès du projet ?',
        itemType: 'textarea' as const,
        required: true,
      },
    ],
  },
  consultant: {
    name: 'Consultant',
    items: [
      {
        label: 'Contexte du projet',
        description: 'Historique et contexte autour de la mission',
        itemType: 'textarea' as const,
        required: true,
      },
      {
        label: 'Parties prenantes',
        description: 'Liste des personnes impliquées et leurs rôles',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Budget estimé',
        description: 'Fourchette budgétaire pour le projet',
        itemType: 'number' as const,
        required: false,
      },
      {
        label: 'Calendarisation',
        description: 'Dates clés et délais attendus',
        itemType: 'date' as const,
        required: true,
      },
      {
        label: 'Livrables attendus',
        description: 'Liste des livrables esperus et leur format',
        itemType: 'textarea' as const,
        required: true,
      },
    ],
  },
  coach: {
    name: 'Coach',
    items: [
      {
        label: 'Objectifs de coaching',
        description: 'Ce que vous souhaitez atteindre',
        itemType: 'textarea' as const,
        required: true,
      },
      {
        label: 'Disponibilités',
        description: 'Crneaux horaires qui vous conviennent',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Préférences de communication',
        description: 'Email, téléphone, visio ?',
        itemType: 'text' as const,
        required: false,
      },
      {
        label: 'Contexte professionnel',
        description: 'Votre rôle actuel et environnement de travail',
        itemType: 'textarea' as const,
        required: false,
      },
      {
        label: 'Échéance souhaitée',
        description: 'Date butoir pour atteindre vos objectifs',
        itemType: 'date' as const,
        required: false,
      },
    ],
  },
  photographe: {
    name: 'Photographe',
    items: [
      {
        label: 'Type de prestation',
        description: 'Mariage, portrait, événement, produit...',
        itemType: 'select' as const,
        choices: ['Mariage', 'Portrait', 'Événement', 'Produit', 'Autre'],
        required: true,
      },
      {
        label: 'Date de la séance',
        description: 'Date prévue pour la prestation',
        itemType: 'date' as const,
        required: true,
      },
      {
        label: 'Lieu souhaité',
        description: 'Adresse ou type de lieu pour les photos',
        itemType: 'text' as const,
        required: false,
      },
      {
        label: 'Inspirations visuelles',
        description: 'Liens vers des photos qui vous inspirent',
        itemType: 'url' as const,
        required: false,
      },
      {
        label: 'Nombre de photos attendues',
        description: 'Approximation du nombre de photos livrées',
        itemType: 'number' as const,
        required: false,
      },
    ],
  },
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profession = searchParams.get('profession')

    if (profession) {
      const kit = STARTER_KITS[profession as keyof typeof STARTER_KITS]
      if (!kit) {
        return NextResponse.json({ error: 'Métier non trouvé' }, { status: 404 })
      }
      return NextResponse.json({ kit })
    }

    // Return all available professions
    const professions = Object.keys(STARTER_KITS).map(key => ({
      value: key,
      label: STARTER_KITS[key as keyof typeof STARTER_KITS].name,
    }))

    return NextResponse.json({ professions })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
