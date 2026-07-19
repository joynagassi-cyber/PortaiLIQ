/**
 * Gumroad License Verification API
 * POST /api/gumroad/verify
 */

import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { gumroadLicenses } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const { licenseKey, productId, userId } = await request.json();

    if (!licenseKey || !productId) {
      return NextResponse.json(
        { error: 'Missing licenseKey or productId' },
        { status: 400 }
      );
    }

    // Verify with Gumroad API
    const gumroadResponse = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: productId,
        license_key: licenseKey,
        increment_uses_count: 'false',
      }),
    });

    const gumroadData = await gumroadResponse.json();

    if (!gumroadData.success) {
      return NextResponse.json(
        { error: gumroadData.message || 'Invalid license key' },
        { status: 400 }
      );
    }

    // Skip test purchases
    if (gumroadData.purchase?.test) {
      return NextResponse.json({
        valid: false,
        message: 'Test purchase — no access granted',
      });
    }

    // Determine tier from product
    const productName = (gumroadData.product_name || '').toLowerCase();
    let tier = 'free';
    if (productName.includes('agency')) tier = 'agency';
    else if (productName.includes('professional')) tier = 'professional';
    else if (productName.includes('starter')) tier = 'starter';

    // Store / update license in DB
    if (userId) {
      await db
        .insert(gumroadLicenses)
        .values({
          userId: userId,
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
            planTier: tier,
          },
        });
    }

    return NextResponse.json({
      valid: true,
      tier,
      product: gumroadData.product_name,
    });
  } catch (error) {
    console.error('Gumroad verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
