'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const predictionSchema = z.object({
  fixtureId: z.number().int().positive(),
  homeGoals: z.number().int().min(0).max(99),
  awayGoals: z.number().int().min(0).max(99),
});

export async function submitPrediction(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in to predict.' };
    }

    const rawData = {
      fixtureId: parseInt(formData.get('fixtureId') as string, 10),
      homeGoals: parseInt(formData.get('homeGoals') as string, 10),
      awayGoals: parseInt(formData.get('awayGoals') as string, 10),
    };

    const parsedData = predictionSchema.safeParse(rawData);

    if (!parsedData.success) {
      return { success: false, error: 'Invalid prediction data.' };
    }

    const { fixtureId, homeGoals, awayGoals } = parsedData.data;

    // Upsert the prediction so users can update their guess before the match
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_fixtureId: {
          userId: session.user.id,
          fixtureId,
        },
      },
      update: {
        homeGoals,
        awayGoals,
      },
      create: {
        userId: session.user.id,
        fixtureId,
        homeGoals,
        awayGoals,
      },
    });

    return { success: true, prediction };
  } catch (error) {
    console.error('Failed to submit prediction:', error);
    return { success: false, error: 'Internal server error while saving prediction.' };
  }
}
