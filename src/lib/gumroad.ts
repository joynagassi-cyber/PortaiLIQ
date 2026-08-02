/**
 * Gumroad License Verification API
 *
 * Verifies Gumroad license keys and manages user access tiers.
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { gumroadLicenses } from '@/db/schema'
import { NextResponse } from 'next/server'
import { createHmac, constantTimeEqual } from 'crypto'

// Gumroad product tier mapping
export const GUMROAD_TIERS = {
  starter: { tier: 'starter', price: 9 },
  professional: { tier: 'professional', price: 29 },
  agency: { tier: 'agency', price: 99 },
} as const

/**
 * Verify a Gumroad license key
 * POST /api/gumroad/verify
 */
export async function POST(request: Request) {
  try {
    const { licenseKey, productId, userId } = await request.json()

    if (!licenseKey || !productId) {
      return NextResponse.json(
        { error: 'Missing licenseKey or productId' },
        { status: 400 }
      )
    }

    // Verify with Gumroad API
    const gumroadResponse = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: productId,
        license_key: licenseKey,
        increment_uses_count: 'true',
      }),
    })

    const gumroadData = await gumroadResponse.json()

    if (!gumroadData.success) {
      return NextResponse.json(
        { error: gumroadData.message || 'Invalid license key' },
        { status: 400 }
      )
    }

    // Check if test purchase
    if (gumroadData.purchase?.test) {
      return NextResponse.json({ valid: false, message: 'Test purchase' })
    }

    // Determine tier based on product
    let tier = 'starter'
    if (productId.includes('professional') || gumroadData.product_name?.toLowerCase().includes('professional')) tier = 'professional'
    else if (productId.includes('agency') || gumroadData.product_name?.toLowerCase().includes('agency')) tier = 'agency'

    // Store license in database
    const [license] = await db
      .insert(gumroadLicenses)
      .values({
        userId: userId || '',
        gumroadLicenseKey: licenseKey,
        gumroadOrderId: gumroadData.purchase?.id,
        productId: productId,
        productName: gumroadData.product_name,
        planTier: tier,
        isVerified: true,
        status: 'active',
      })
      .onConflictDoUpdate({
        target: gumroadLicenses.gumroadLicenseKey,
        set: {
          isVerified: true,
          status: 'active',
          verifiedAt: new Date(),
        },
      })
      .returning()

    return NextResponse.json({
      valid: true,
      tier: license.planTier,
      message: 'License verified',
    })
  } catch (error) {
    console.error('Gumroad verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle Gumroad webhook notifications
 * POST /api/gumroad/webhook
 */
export async function handleWebhook(request: Request) {
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
        await handleNewPurchase(event)
        break
      case 'refunded':
        await handleRefund(event)
        break
      case 'dispute_started':
      case 'dispute_needed':
        await handleDispute(event)
        break
      default:
        console.log('Unhandled Gumroad event:', event.action_name)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Gumroad webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleNewPurchase(event: any) {
  const { email, license_key, product_id, product_name, user_email } = event

  // Find or create user by email, then update license
  // For MVP: log the event — the verify endpoint handles the actual license creation
  console.log('New purchase:', { email, license_key, product_id })
}

async function handleRefund(event: any) {
  const { license_key } = event

  await db
    .update(gumroadLicenses)
    .set({ status: 'revoked', updatedAt: new Date() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, license_key))

  console.log('License revoked due to refund:', license_key)
}

async function handleDispute(event: any) {
  const { license_key } = event

  await db
    .update(gumroadLicenses)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, license_key))

  console.log('License suspended due to dispute:', license_key)
}
