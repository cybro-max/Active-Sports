/**
 * Database Seeder: Populates ApiCache with full squads and player profiles.
 * Optimized for Premium Plan. 
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// MUST load env before importing lib/apifootball
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seed() {
  console.log('🚀 Initializing Premium Seeder...');
  
  // Dynamically import to ensure env is ready
  const { getStandings, getSquad, MAJOR_LEAGUES, CURRENT_SEASON } = await import('../lib/apifootball');

  console.log('🚀 Starting Robust Player Seed...');
  const startTime = Date.now();
  let totalPlayers = 0;
  let totalTeamsCount = 0;

  // 1. Identify all teams across major leagues
  const leagueIds = [39, 140, 78, 135, 61, 2, 3]; // Priority leagues
  const teamIds = new Set<number>();

  console.log(`--- Step 1: Gathering teams for ${leagueIds.length} leagues...`);
  for (const id of leagueIds) {
    try {
      console.log(`   Fetching league ${id}...`);
      const standings = await getStandings(id, CURRENT_SEASON);
      
      if (!standings || standings.length === 0) {
        console.log(`   ⚠️ No standings found for league ${id} in season ${CURRENT_SEASON}.`);
        continue;
      }
      
      let leagueTeamsCount = 0;
      for (const group of standings) {
        for (const standing of group.league.standings) {
          for (const s of standing) {
            if (!teamIds.has(s.team.id)) {
              teamIds.add(s.team.id);
              leagueTeamsCount++;
            }
          }
        }
      }
      console.log(`   ✅ Added ${leagueTeamsCount} teams from league ${id}. Total unique: ${teamIds.size}`);
    } catch (err) {
      console.error(`   ❌ Failed to fetch standings for league ${id}:`, err instanceof Error ? err.message : 'Unknown error');
    }
  }

  const teamsToFetch = Array.from(teamIds);
  totalTeamsCount = teamsToFetch.length;
  
  if (totalTeamsCount === 0) {
    console.log('❌ No teams found to fetch. Check your API key and league IDs.');
    return;
  }

  console.log(`--- Step 2: Fetching squads for ${totalTeamsCount} teams...`);

  // 2. Fetch squads in small batches to respect rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < teamsToFetch.length; i += BATCH_SIZE) {
    const batch = teamsToFetch.slice(i, i + BATCH_SIZE);
    console.log(`   Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(totalTeamsCount / BATCH_SIZE)}...`);
    
    await Promise.allSettled(batch.map(async (id) => {
      try {
        const squad = await getSquad(id);
        if (squad && squad.length > 0) {
          totalPlayers += squad[0].players.length;
        }
      } catch (err) {
        console.error(`      Error fetching squad ${id}:`, err instanceof Error ? err.message : 'Unknown error');
      }
    }));

    // Pace the requests
    if (i + BATCH_SIZE < teamsToFetch.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
  console.log('✅ Seeding Complete!');
  console.log(`   Total Teams Seeded: ${totalTeamsCount}`);
  console.log(`   Total Players Seeded: ~${totalPlayers}`);
  console.log(`   Duration: ${duration} minutes`);
}

seed().catch(console.error);
