/**
 * Gumroad Webhook Handler
 * POST /api/gumroad/webhook
 * 
 * Handles purchase, refund, and dispute events from Gumroad.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gumroadLicenses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    const { action_name, email, license_key, product_id, product_name } = event;

    switch (action_name) {
      case 'purchase':
        await handlePurchase(event);
        break;

      case 'refunded':
        await handleRefund(license_key);
        break;

      case 'dispute_needed':
      case 'dispute_started':
        await handleDispute(license_key);
        break;

      default:
        console.log('Unhandled Gumroad event:', action_name);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePurchase(event: any) {
  const { email, license_key, product_id, product_name, price } = event;

  // Determine tier
  const nameLower = (product_name || '').toLowerCase();
  let tier = 'free';
  if (nameLower.includes('agency')) tier = 'agency';
  else if (nameLower.includes('professional')) tier = 'professional';
  else if (nameLower.includes('starter')) tier = 'starter';

  // In a real app, you'd find the user by email and associate the license
  // For now, just log it — the frontend handles the linking via /api/gumroad/verify
  console.log('Gumroad purchase:', { email, license_key, product_id, tier });
}

async function handleRefund(licenseKey: string) {
  await db
    .update(gumroadLicenses)
    .set({ status: 'revoked', updatedAt: new Date() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, licenseKey));

  console.log('License revoked (refund):', licenseKey);
}

async function handleDispute(licenseKey: string) {
  await db
    .update(gumroadLicenses)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(gumroadLicenses.gumroadLicenseKey, licenseKey));

  console.log('License suspended (dispute):', licenseKey);
}
