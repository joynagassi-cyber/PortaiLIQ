import { NextResponse } from "next/server";
import { createClientCookie } from "@/lib/supabase-server";
import { db } from "@/db";
import { portals, portalItems, portalAccessLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClientCookie();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, logoUrl, clientProfileId } = body;

    // Create portal
    const [portal] = await db
      .insert(portals)
      .values({
        userId: user.id,
        name,
        description,
        logoUrl: logoUrl || null,
        clientProfileId: clientProfileId || null,
      })
      .returning();

    return NextResponse.json({ portal });
  } catch (error) {
    console.error("Create portal error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClientCookie();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const portalId = searchParams.get("id");

    if (!portalId) {
      return NextResponse.json({ error: "Missing portal id" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, logoUrl, status } = body;

    await db
      .update(portals)
      .set({
        ...(name && { name }),
        ...(description && { description }),
        ...(logoUrl && { logoUrl }),
        ...(status && { status }),
        updatedAt: new Date(),
      })
      .where(eq(portals.id, portalId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update portal error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClientCookie();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const portalId = searchParams.get("id");

    if (!portalId) {
      return NextResponse.json({ error: "Missing portal id" }, { status: 400 });
    }

    await db.delete(portals).where(eq(portals.id, portalId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete portal error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
