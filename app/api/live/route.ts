/**
 * Server-Sent Events endpoint for live match updates
 * Replaces WebSockets (incompatible with Vercel serverless)
 *
 * Client connects to /api/live?fixture=<id>
 * Server polls API every 15s and streams updates
 */
import { getFixtureById, getFixtureEvents, getFixtureStatistics, getLiveFixtures } from '@/lib/apifootball';
import { fixtureQuerySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fetchFullFixture(fixtureId: number) {
  const [fixtures, events, stats] = await Promise.allSettled([
    getFixtureById(fixtureId),
    getFixtureEvents(fixtureId),
    getFixtureStatistics(fixtureId),
  ]);

  return {
    fixture: fixtures.status === 'fulfilled' ? fixtures.value[0] ?? null : null,
    events: events.status === 'fulfilled' ? events.value : [],
    statistics: stats.status === 'fulfilled' ? stats.value : [],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryValidation = fixtureQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!queryValidation.success) {
    return new Response(JSON.stringify({ error: 'Invalid query parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const fixtureId = queryValidation.data.fixture;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      if (!fixtureId) {
        // Return live fixtures list (homepage use)
        try {
          const live = await getLiveFixtures();
          send({ type: 'update', data: live, ts: Date.now() });
        } catch {
          send({ type: 'error', message: 'Failed to fetch data' });
        }
        return;
      }

      // Send initial data
      try {
        const data = await fetchFullFixture(fixtureId);
        send({ type: 'update', data, ts: Date.now() });
      } catch {
        send({ type: 'error', message: 'Failed to fetch data' });
      }

      // Poll every 15 seconds
      const interval = setInterval(async () => {
        try {
          const data = await fetchFullFixture(fixtureId);
          send({ type: 'update', data, ts: Date.now() });
        } catch {
          send({ type: 'error', message: 'Refresh failed' });
        }
      }, 15_000);

      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
