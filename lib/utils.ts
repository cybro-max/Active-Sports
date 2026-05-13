import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as Sentry from '@sentry/nextjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Wraps a promise to capture errors with Sentry and return a fallback value */
export async function captureCatch<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    Sentry.captureException(e);
    return fallback;
  }
}

export const DEFAULT_TIMEZONE = 'Europe/London';
export const TZ_COOKIE_NAME = 'afs_tz';

/** Format match date/time */
export function formatMatchTime(dateStr: string, timezone = DEFAULT_TIMEZONE): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(new Date(dateStr));
  } catch {
    return '--:--';
  }
}

/** Format match date with timezone */
export function formatMatchDate(dateStr: string, timezone = DEFAULT_TIMEZONE): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/** Get YYYY-MM-DD for today in a specific timezone */
export function getTodayDate(timezone = DEFAULT_TIMEZONE): string {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).format(now);
}

/** Status badge color */
export function getStatusColor(short: string): string {
  if (['1H', '2H', 'ET', 'P', 'HT'].includes(short)) return 'text-green-400';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'text-slate-400';
  if (['PST', 'CANC', 'ABD'].includes(short)) return 'text-red-400';
  return 'text-yellow-400'; // NS (Not Started)
}

/** Readable status label */
export function getStatusLabel(short: string, elapsed: number | null): string {
  if (short === 'NS') return 'Upcoming';
  if (short === 'HT') return 'Half Time';
  if (short === 'FT') return 'Full Time';
  if (short === 'AET') return 'After Extra Time';
  if (short === 'PEN') return 'After Penalties';
  if (short === 'PST') return 'Postponed';
  if (short === 'CANC') return 'Cancelled';
  if (short === 'ABD') return 'Abandoned';
  if (elapsed !== null) return `${elapsed}'`;
  return short;
}

/** Countdown to a date */
export function getCountdown(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

/** World Cup 2026 start date */
export const WORLD_CUP_DATE = new Date('2026-06-11T00:00:00Z');

/** Form color helper */
export function getFormColor(char: string): string {
  if (char === 'W') return 'bg-green-500';
  if (char === 'D') return 'bg-yellow-500';
  if (char === 'L') return 'bg-red-500';
  return 'bg-slate-600';
}
