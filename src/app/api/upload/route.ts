import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const itemId = formData.get('item_id') as string
    const expectedFormat = formData.get('expected_format') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    // Validate expected format if provided
    let formatWarning = null
    if (expectedFormat) {
      const expectedFormats = expectedFormat.split(',').map(f => f.trim().toUpperCase())
      const actualFormat = file.type.split('/')[1]?.toUpperCase()
      
      if (!expectedFormats.some(fmt => actualFormat.includes(fmt.split('.')[1] || fmt))) {
        formatWarning = `Le format attendu était: ${expectedFormat}`
      }
    }

    // Upload to Vercel Blob Storage
    const blob = await put(`portaliq/uploads/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    })

    const response: any = {
      file_url: blob.url,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    }

    if (formatWarning) {
      response.warning = formatWarning
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
