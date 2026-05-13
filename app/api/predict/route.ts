import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { predictionSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = predictionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.issues }, { status: 400 });
    }
    const { fixtureId, homeGoals, awayGoals } = validation.data;

    // Upsert prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_fixtureId: {
          userId: session.user.id,
          fixtureId: Number(fixtureId),
        },
      },
      update: {
        homeGoals: Number(homeGoals),
        awayGoals: Number(awayGoals),
      },
      create: {
        userId: session.user.id,
        fixtureId: Number(fixtureId),
        homeGoals: Number(homeGoals),
        awayGoals: Number(awayGoals),
      },
    });

    return NextResponse.json({ success: true, prediction });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
