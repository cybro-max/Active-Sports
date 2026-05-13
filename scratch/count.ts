import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function count() {
  const teams = await prisma.team.count();
  const players = await prisma.player.count();
  const leagues = await prisma.league.count();
  console.log(`Teams: ${teams}, Players: ${players}, Leagues: ${leagues}`);
  await prisma.$disconnect();
}
count();
