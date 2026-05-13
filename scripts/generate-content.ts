/**
 * Build-time content generation script.
 * Run before `next build`: `npx tsx scripts/generate-content.ts`
 *
 * Generates AI-powered descriptions for:
 *   - All teams in major leagues (~200)
 *   - Top players by scorers + assists (~700)
 *
 * Quota: Uses OpenRouter API (not API-Football). Cost ~$0.15 for full run.
 * Output: Stored in Postgres via ContentCache model.
 */

import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { generateTeamDescription, generatePlayerBio } from '@/lib/content-generator';
import { getTeamIndex, getPlayerIndexLite, isFullBuild, getPlayerIndexFull } from '@/lib/build-params';

if (!process.env.OPENROUTER_API_KEY) {
  console.error('[ContentGen] OPENROUTER_API_KEY not set — skipping generation');
  process.exit(0);
}

async function main() {
  console.log('[ContentGen] Starting content generation...');

  // ─── Teams ──────────────────────────────────────────────────────
  console.log('[ContentGen] Building team index...');
  const teamIndex = await getTeamIndex();
  const allTeams = [...teamIndex.values()].flat();
  console.log(`[ContentGen] Found ${allTeams.length} teams`);

  let teamCount = 0;
  for (const team of allTeams) {
    const desc = await generateTeamDescription(team.name, '', '');
    if (desc) teamCount++;
    if (teamCount > 0 && teamCount % 20 === 0) {
      console.log(`[ContentGen] Generated ${teamCount}/${allTeams.length} team descriptions...`);
    }
  }
  console.log(`[ContentGen] Done — ${teamCount} team descriptions generated`);

  // ─── Players ─────────────────────────────────────────────────────
  console.log('[ContentGen] Building player index...');
  const playerIndex = isFullBuild() ? await getPlayerIndexFull() : await getPlayerIndexLite();
  const allPlayers = [...playerIndex.values()].flat();
  console.log(`[ContentGen] Found ${allPlayers.length} players`);

  let playerCount = 0;
  for (const player of allPlayers) {
    const bio = await generatePlayerBio(player.name, '', '');
    if (bio) playerCount++;
    if (playerCount > 0 && playerCount % 50 === 0) {
      console.log(`[ContentGen] Generated ${playerCount}/${allPlayers.length} player bios...`);
    }
  }
  console.log(`[ContentGen] Done — ${playerCount} player bios generated`);

  const total = await prisma.contentCache.count();
  console.log(`[ContentGen] Total cached entries: ${total}`);
  console.log('[ContentGen] Complete!');
}

main().catch((err) => {
  console.error('[ContentGen] Failed:', err);
  process.exit(1);
});
