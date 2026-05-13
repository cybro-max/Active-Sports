'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReaction(fixtureId: number, emoji: string, message?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.reaction.create({
      data: {
        userId: session.user.id,
        fixtureId: Number(fixtureId),
        emoji,
        message: message?.trim() || null,
      },
    });

    revalidatePath(`/match/${fixtureId}/reactions`);
    
    return { success: true };
  } catch (error) {
    console.error('Submit Reaction Error:', error);
    return { success: false, error: 'Failed to submit reaction.' };
  }
}

export async function getReactions(fixtureId: number) {
  try {
    const reactions = await prisma.reaction.findMany({
      where: { fixtureId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    
    return { success: true, data: reactions };
  } catch (error) {
    console.error('Get Reactions Error:', error);
    return { success: false, error: 'Failed to fetch reactions.' };
  }
}
