import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const favoriteSchema = z.object({
  type: z.enum(['team', 'league', 'player']),
  entityId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  logo: z.string().url().optional(),
});

// GET — list all favorites for the current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ favorites });
}

// POST — toggle favorite (add if not present, remove if present)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const validation = favoriteSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid data', details: validation.error.issues }, { status: 400 });
  }

  const { type, entityId, name, logo } = validation.data;
  const userId = session.user.id;

  // Check if it already exists
  const existing = await prisma.favorite.findUnique({
    where: { userId_type_entityId: { userId, type, entityId } },
  });

  if (existing) {
    // Remove it
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    // Add it
    const favorite = await prisma.favorite.create({
      data: { userId, type, entityId, name, logo: logo ?? null },
    });
    return NextResponse.json({ favorited: true, favorite });
  }
}
