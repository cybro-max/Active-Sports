import axios from 'axios';
import * as Sentry from '@sentry/nextjs';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

const client = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://activesports.live', // Optional, for OpenRouter rankings
    'X-Title': 'ActiveSports', // Optional
    'Content-Type': 'application/json',
  },
});

/**
 * Generate a humorous "Roast" for a finished football match.
 */
export async function generateMatchRoast(matchSummary: string) {
  try {
    const response = await client.post('/chat/completions', {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a savage, funny football pundit. Your job is to roast the losing team or the overall quality of a match based on its stats. Be witty, use modern football slang, and keep it under 50 words. Focus on being shareable and viral.',
        },
        {
          role: 'user',
          content: `Roast this match result: ${matchSummary}`,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    Sentry.captureException(error);
    return "The AI was too stunned by this performance to even comment. 💀";
  }
}

/**
 * Generate tactical insights and win probability.
 */
export async function generateMatchInsights(matchData: string) {
  try {
    const response = await client.post('/chat/completions', {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an elite football tactical analyst. Provide 2-3 bullet points of tactical insight and a "Win Probability" percentage for each team based on the match context or stats provided. Be professional but engaging.',
        },
        {
          role: 'user',
          content: `Analyze this match: ${matchData}`,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    Sentry.captureException(error);
    return "Tactical data currently unavailable.";
  }
}

/**
 * Generate a concise match summary.
 */
export async function generateMatchSummary(matchData: string) {
  try {
    const response = await client.post('/chat/completions', {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Provide a concise 3-bullet point summary of this football match. Focus on key goals, cards, or turning points.',
        },
        {
          role: 'user',
          content: `Summarize this match: ${matchData}`,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    Sentry.captureException(error);
    return "Summary pending match official review.";
  }
}
