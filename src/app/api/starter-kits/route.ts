import { NextResponse } from 'next/server'

// Kits de démarrage par métier
const STARTER_KITS = {
  designer: {
    name: 'Designer',
    items: [
      {
        label: 'High-res Logo',
        description: 'PNG or SVG file in high resolution',
        itemType: 'file' as const,
        expectedFormat: 'PNG, SVG',
        required: true,
      },
      {
        label: 'Color Palette',
        description: 'Main and secondary color codes',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Fonts Used',
        description: 'Font names and download links if possible',
        itemType: 'text' as const,
        required: false,
      },
      {
        label: 'Inspiration Examples',
        description: 'Links to designs you like',
        itemType: 'url' as const,
        required: false,
      },
      {
        label: 'Project Brief',
        description: 'Detailed description of your needs and goals',
        itemType: 'text' as const,
        required: true,
      },
    ],
  },
  developer: {
    name: 'Developer',
    items: [
      {
        label: 'Repository Access',
        description: 'GitHub/GitLab link or direct access',
        itemType: 'url' as const,
        required: true,
      },
      {
        label: 'Technical Documentation',
        description: 'Existing docs or technical specifications',
        itemType: 'file' as const,
        expectedFormat: 'PDF, MD',
        required: false,
      },
      {
        label: 'Technology Stack',
        description: 'Technologies and frameworks used',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Hosting Environments',
        description: 'URLs for dev, staging, production environments',
        itemType: 'url' as const,
        required: false,
      },
      {
        label: 'Success Criteria',
        description: 'How to measure project success?',
        itemType: 'text' as const,
        required: true,
      },
    ],
  },
  consultant: {
    name: 'Consultant',
    items: [
      {
        label: 'Project Context',
        description: 'History and context around the mission',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Stakeholders',
        description: 'List of involved people and their roles',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Estimated Budget',
        description: 'Budget range for the project',
        itemType: 'number' as const,
        required: false,
      },
      {
        label: 'Timeline',
        description: 'Key dates and expected deadlines',
        itemType: 'date' as const,
        required: true,
      },
      {
        label: 'Deliverables',
        description: 'List of expected deliverables and their format',
        itemType: 'text' as const,
        required: true,
      },
    ],
  },
  coach: {
    name: 'Coach',
    items: [
      {
        label: 'Coaching Goals',
        description: 'What you want to achieve',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Availability',
        description: 'Time slots that work for you',
        itemType: 'text' as const,
        required: true,
      },
      {
        label: 'Communication Preferences',
        description: 'Email, phone, video call?',
        itemType: 'text' as const,
        required: false,
      },
      {
        label: 'Professional Context',
        description: 'Your current role and work environment',
        itemType: 'text' as const,
        required: false,
      },
      {
        label: 'Target Deadline',
        description: 'Deadline to achieve your goals',
        itemType: 'date' as const,
        required: false,
      },
    ],
  },
  photographer: {
    name: 'Photographer',
    items: [
      {
        label: 'Session Type',
        description: 'Wedding, portrait, event, product...',
        itemType: 'multiple_choice' as const,
        choices: ['Wedding', 'Portrait', 'Event', 'Product', 'Other'],
        required: true,
      },
      {
        label: 'Session Date',
        description: 'Planned date for the session',
        itemType: 'date' as const,
        required: true,
      },
      {
        label: 'Preferred Location',
        description: 'Address or type of location for photos',
        itemType: 'text' as const,
        required: false,
      },
      {
        label: 'Visual Inspirations',
        description: 'Links to photos that inspire you',
        itemType: 'url' as const,
        required: false,
      },
      {
        label: 'Expected Photo Count',
        description: 'Approximate number of delivered photos',
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
        return NextResponse.json({ error: 'Profession not found' }, { status: 404 })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
