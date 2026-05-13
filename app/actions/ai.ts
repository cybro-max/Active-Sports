'use server';

import { generateMatchRoast, generateMatchInsights, generateMatchSummary } from '@/lib/openrouter';

export async function getAIMatchRoast(homeTeam: string, awayTeam: string, score: string) {
  const summary = `${homeTeam} vs ${awayTeam}, Score: ${score}`;
  return await generateMatchRoast(summary);
}

export async function getAIMatchInsights(homeTeam: string, awayTeam: string, status: string) {
  const data = `${homeTeam} vs ${awayTeam}, Match Status: ${status}`;
  return await generateMatchInsights(data);
}

export async function getAIMatchSummary(homeTeam: string, awayTeam: string, score: string) {
  const data = `${homeTeam} vs ${awayTeam}, Final Score: ${score}`;
  return await generateMatchSummary(data);
}
