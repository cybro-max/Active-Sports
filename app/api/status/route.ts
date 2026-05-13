import { getApiStatus } from '@/lib/apifootball';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getApiStatus();
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
