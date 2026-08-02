/**
 * Gumroad Webhook Handler
 * POST /api/gumroad/webhook
 *
 * Handles purchase, refund, and dispute events from Gumroad.
 * Verifies HMAC signature before processing.
 */

import { NextResponse } from 'next/server'
import { db } from '@/db'
import { gumroadLicenses } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createHmac, constantTimeEqual } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-gumroad-signature') || ''
    const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET || ''

    // Verify HMAC signature
    const expected = createHmac('sha256', webhookSecret).update(body).digest('hex')

    if (!constantTimeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) {
      console.warn('Gumroad webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    switch (event.action_name) {
      case 'purchase':
        await handlePurchase(event)
        break

      case 'refunded':
        await handleRefund(event.license_key)
        break

      case 'dispute_needed':
      case 'dispute_started':
        await handleDispute(event.license_key)
        break

      default:
        console.log('Unhandled Gumroad event:', event.action_name)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Gumroad webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePurchase(event: any) {
  const { email, license_key, product_id, product_name, price } = event

  // Determine tier
  const nameLower = (product_name || '').toLowerCase()
  let tier = 'starter'
  if (nameLower.includes('agency')) tier = 'agency'
  else if (nameLower.includes('professional')) tier = 'professional'
  else if (nameLower.includes('starter')) tier = 'starter'

  // In a real app, find user by email and associate the license
  // For now, just log it — the frontend handles the linking via /api/gumroad/verify
  console.log('Gumroad purchase:', { email, license_key, product_id, tier })
}

async function handleRefund(licenseKey: string) {
  await db
    .update(gumroadLicenses)
    .set({ status: 'revoked', updatedAt: new Date() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, licenseKey))

  console.log('License revoked (refund):', licenseKey)
}

async function handleDispute(licenseKey: string) {
  await db
    .update(gumroadLicenses)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, licenseKey))

  console.log('License suspended (dispute):', licenseKey)
}
