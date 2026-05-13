/**
 * High-Scale AI Content Generator.
 * Leverages seeded ApiCache to generate rich, metadata-aware bios.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env before imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('🤖 Starting Massive AI Content Generation...');
  
  // Dynamic imports
  const { prisma } = await import('../lib/prisma');
  const { generatePlayerAbout, generatePlayerBio } = await import('../lib/content-generator');
  const { getPlayerIndexLite, getPlayerIndexFull, isFullBuild } = await import('../lib/build-params');
  const { getPlayer, CURRENT_SEASON } = await import('../lib/apifootball');

  const startTime = Date.now();
  
  // 1. Get all player IDs to process
  console.log('--- Step 1: Building player index...');
  const playerIndex = isFullBuild() ? await getPlayerIndexFull() : await getPlayerIndexLite();
  const allPlayers = Array.from(playerIndex.values()).flat();
  const total = allPlayers.length;
  console.log(`--- Step 2: Found ${total} players. Checking cache status...`);

  let processed = 0;
  let skipped = 0;
  let generated = 0;

  // 2. Process in batches
  const BATCH_SIZE = 5;
  for (let i = 0; i < allPlayers.length; i += BATCH_SIZE) {
    const batch = allPlayers.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (p) => {
      try {
        // Check if already has "About" section in ContentCache
        const cacheKey = `player:about:${p.name}`;
        const existing = await prisma.contentCache.findUnique({ where: { key: cacheKey } });
        
        if (existing) {
          skipped++;
          return;
        }

        // Fetch details from ApiCache (via getPlayer which uses cache first)
        const playerDetails = await getPlayer(p.id, CURRENT_SEASON);
        if (!playerDetails || playerDetails.length === 0) {
          skipped++;
          return;
        }

        const data = playerDetails[0];
        const teamName = data.statistics[0]?.team?.name || 'their club';
        
        // Generate both Bio (short) and About (long)
        await Promise.all([
          generatePlayerBio(p.name, data.player.nationality, teamName),
          generatePlayerAbout(p.name, data.player.nationality, teamName, data.player.age)
        ]);

        generated++;
      } catch (err) {
        console.error(`   ❌ Error processing ${p.name}:`, err instanceof Error ? err.message : 'Unknown error');
      } finally {
        processed++;
      }
    }));

    if (processed % 25 === 0 || processed === total) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      console.log(`📊 Progress: ${processed}/${total} | Generated: ${generated} | Skipped: ${skipped} | Time: ${elapsed}m`);
    }

    // Small delay to prevent OpenRouter rate limits
    if (i + BATCH_SIZE < allPlayers.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('✅ AI Content Generation Complete!');
  console.log(`   Final Stats: ${generated} new entries created, ${skipped} existing entries preserved.`);
}

main().catch(console.error);
