/**
 * Content generator using OpenRouter (OpenAI-compatible API).
 * Generates unique SEO content for teams, players, and matches at build time.
 * All generated content is cached in the database to avoid regeneration costs.
 */

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

const IS_ENABLED = !!process.env.OPENROUTER_API_KEY;

async function generate(key: string, prompt: string, maxTokens = 120): Promise<string> {
  if (!IS_ENABLED || !key) return '';

  try {
    const cached = await prisma.contentCache.findUnique({ where: { key } });
    if (cached) return cached.content;
  } catch (err) {
    console.error(`[ContentGenerator] Cache lookup failed for key: ${key}`, err);
    // Continue without cache if DB fails
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? '';

    if (content) {
      await prisma.contentCache.create({
        data: { key, content, model: MODEL },
      }).catch(() => {}); // ignore duplicate key race
    }

    return content;
  } catch {
    return '';
  }
}

/** Generate a team description for meta tags and structured data */
export async function generateTeamDescription(teamName: string, country: string, leagueName: string): Promise<string> {
  return generate(
    `team:desc:${teamName}`,
    `Write a one-sentence description of ${teamName} football club from ${country}, who play in ${leagueName}. Tone: neutral, informative. Max 20 words.`,
    60
  );
}

/** Generate a player bio for meta tags and structured data */
export async function generatePlayerBio(playerName: string, nationality: string, teamName: string): Promise<string> {
  return generate(
    `player:bio:${playerName}`,
    `Write a one-sentence bio for ${playerName}, a ${nationality} footballer who plays for ${teamName}. Mention their playing style. Max 20 words.`,
    60
  );
}

/** Generate expanded player about section (for visible page content) */
export async function generatePlayerAbout(playerName: string, nationality: string, teamName: string, age: number): Promise<string> {
  return generate(
    `player:about:${playerName}`,
    `Write a professional 2-3 sentence overview of ${playerName}, a ${age}-year-old ${nationality} footballer playing for ${teamName}. Highlight their playing style, career impact, and key attributes. Tone: neutral, expert, SEO-focused.`,
    200
  );
}

/** Generate expanded team about section (for visible page content) */
export async function generateTeamAbout(teamName: string, country: string, leagueName: string, founded: number, venue: string): Promise<string> {
  return generate(
    `team:about:${teamName}`,
    `Write a 2-3 sentence description of ${teamName} football club from ${country}. Founded ${founded}. They play in ${leagueName} at ${venue}. Mention their reputation and style. Tone: neutral, informative.`,
    150
  );
}

/** Generate a detailed league overview (400+ words) for SEO */
export async function generateLeagueOverview(
  leagueName: string,
  country: string,
  type: string,
  season: number,
): Promise<string> {
  return generate(
    `league:overview:${leagueName}:${season}`,
    `You are a football journalist writing SEO-optimized HTML article content. Write a detailed, engaging, and informative overview of the ${leagueName} (${country}, ${type}) for the ${season} season. The article should be at least 400 words and cover the following:

1. A compelling introduction about the league's significance and prestige in world football.
2. The league's format, number of teams, relegation/promotion system, and any unique rules.
3. The competitive landscape — mention which teams are traditionally strong, any recent champions, and the current power dynamics.
4. Style of play — what tactical or stylistic identity is the league known for?
5. Current season storylines — key title races, relegation battles, breakout stars, or managerial changes (speculative/generic if specific data isn't available).
6. Notable players or legends associated with the league.
7. What makes this league special for fans — atmosphere, rivalries, youth development, etc.
8. A forward-looking conclusion about the league's future.

Format your response as HTML. Use <h2> tags for section headings (not <h1> — the page already has an h1). Wrap paragraphs in <p> tags. Do NOT use markdown formatting. Output ONLY the HTML content, no markdown, no code fences.`,
    1000
  );
}
