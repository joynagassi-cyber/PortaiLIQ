/**
 * Gumroad License Verification API
 * 
 * Verifies Gumroad license keys and manages user access tiers.
 * 
 * Gumroad API Reference: https://app.gumroad.com/api
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, desc, lt } from 'drizzle-orm';
import { db } from '@/db';
import { gumroadLicenses } from '@/db/schema';
import { auth } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { createHmac, constantTimeEqual } from 'crypto';

// Gumroad product tiers mapping
export const GUMROAD_TIERS = {
  FREE: { tier: 'free', price: 0 },
  STARTER: { tier: 'starter', price: 9 },
  PROFESSIONAL: { tier: 'professional', price: 29 },
  AGENCY: { tier: 'agency', price: 99 },
} as const;

/**
 * Verify a Gumroad license key
 * POST /api/gumroad/verify
 */
export async function POST(request: Request) {
  try {
    const { licenseKey, productId } = await request.json();

    if (!licenseKey || !productId) {
      return NextResponse.json(
        { error: 'Missing licenseKey or productId' },
        { status: 400 }
      );
    }

    // Verify with Gumroad API
    const gumroadResponse = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_id: productId,
        license_key: licenseKey,
        increment_uses_count: 'true',
      }),
    });

    const gumroadData = await gumroadResponse.json();

    if (!gumroadData.success) {
      return NextResponse.json(
        { error: gumroadData.message || 'Invalid license key' },
        { status: 400 }
      );
    }

    // Check if it's a test purchase
    if (gumroadData.purchase?.test) {
      return NextResponse.json({
        valid: false,
        message: 'Test purchase - no access granted',
      });
    }

    // Determine tier based on product
    let tier = 'free';
    if (productId.includes('starter')) tier = 'starter';
    else if (productId.includes('professional')) tier = 'professional';
    else if (productId.includes('agency')) tier = 'agency';

    // Store license in database
    const [license] = await db
      .insert(gumroadLicenses)
      .values({
        user_id: request.headers.get('x-user-id') || '',
        gumroad_license_key: licenseKey,
        gumroad_order_id: gumroadData.purchase?.id,
        product_id: productId,
        product_name: gumroadData.product_name,
        plan_tier: tier,
        is_verified: true,
        status: 'active',
      })
      .onConflictDoUpdate({
        target: gumroadLicenses.gumroadLicenseKey,
        set: {
          is_verified: true,
          status: 'active',
          verified_at: new Date().toISOString(),
        },
      })
      .returning();

    return NextResponse.json({
      valid: true,
      tier: license.plan_tier,
      message: 'License verified successfully',
    });
  } catch (error) {
    console.error('Gumroad verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check user access tier
 * GET /api/gumroad/access
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const licenses = await db
      .select()
      .from(gumroadLicenses)
      .where(and(
        eq(gumroadLicenses.userId, userId),
        eq(gumroadLicenses.status, 'active')
      ))
      .orderBy(desc(gumroadLicenses.createdAt))
      .limit(1);

    const tier = licenses[0]?.planTier || 'free';

    return NextResponse.json({
      tier,
      isVerified: licenses[0]?.isVerified || false,
    });
  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle Gumroad webhook notifications
 * POST /api/gumroad/webhook
 */
export async function handleWebhook(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-gumroad-signature') || '';
    const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET || '';

    // Verify HMAC signature
    const expected = createHmac('sha256', webhookSecret).update(body).digest('hex');
    
    if (!constantTimeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected))) {
      console.warn('Gumroad webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.action_name) {
      case 'purchase':
        // New purchase - create or update license
        await handleNewPurchase(event);
        break;

      case 'refund':
        // Refund - revoke access
        await handleRefund(event);
        break;

      case 'dispute':
        // Dispute opened
        await handleDispute(event);
        break;

      default:
        console.log('Unhandled Gumroad event:', event.action_name);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleNewPurchase(event: any) {
  const { email, license_key, product_id, product_name, price } = event;

  // Find user by email
  // Update or create license record
  console.log('New purchase:', { email, license_key, product_id });
}

async function handleRefund(event: any) {
  const { license_key } = event;

  // Revoke license
  await db
    .update(gumroadLicenses)
    .set({ status: 'revoked', updated_at: new Date().toISOString() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, license_key));

  console.log('License revoked due to refund:', license_key);
}

async function handleDispute(event: any) {
  const { license_key } = event;

  // Suspend license pending dispute resolution
  await db
    .update(gumroadLicenses)
    .set({ status: 'pending', updated_at: new Date().toISOString() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, license_key));

  console.log('License suspended due to dispute:', license_key);
}
