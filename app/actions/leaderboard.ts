'use server';

import { prisma } from '@/lib/prisma';

export async function getLeaderboard() {
  try {
    // In a real production app at scale, you would have a `totalPoints` column 
    // on the User table updated via a cron job or trigger.
    // For now, we'll fetch users with their predictions and sum them up.
    const users = await prisma.user.findMany({
      include: {
        predictions: true,
      },
      // If we had too many users, we'd need raw SQL or a materialized view.
    });

    const ranked = users
      .map(user => {
        const totalPoints = user.predictions.reduce((sum, p) => sum + p.points, 0);
        const streak = user.predictions.length; // Simplified streak logic
        return {
          id: user.id,
          name: user.name || 'Anonymous Fan',
          image: user.image,
          points: totalPoints,
          streak: streak,
        };
      })
      .sort((a, b) => b.points - a.points || b.streak - a.streak)
      .slice(0, 50); // Top 50

    return { success: true, data: ranked };
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return { success: false, error: 'Could not load leaderboard.' };
  }
}
