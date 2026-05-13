'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { Fixture, FixtureEvent, FixtureStatistics } from '@/lib/apifootball';

export interface LiveFixtureData {
  fixture: Fixture | null;
  events: FixtureEvent[];
  statistics: FixtureStatistics[];
}

interface LiveMatchContextValue {
  live: LiveFixtureData;
  isLive: boolean;
  connected: boolean;
}

const defaultData: LiveFixtureData = { fixture: null, events: [], statistics: [] };

const LiveMatchContext = createContext<LiveMatchContextValue>({
  live: defaultData,
  isLive: false,
  connected: false,
});

export function useMatchLive() {
  return useContext(LiveMatchContext);
}

export function LiveMatchProvider({
  fixtureId,
  initialFixture,
  initialEvents,
  initialStatistics,
  initiallyLive,
  children,
}: {
  fixtureId: number;
  initialFixture: Fixture | null;
  initialEvents: FixtureEvent[];
  initialStatistics: FixtureStatistics[];
  initiallyLive: boolean;
  children: React.ReactNode;
}) {
  const [live, setLive] = useState<LiveFixtureData>({
    fixture: initialFixture,
    events: initialEvents,
    statistics: initialStatistics,
  });
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource(`/api/live?fixture=${fixtureId}`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update' && data.data) {
          setLive(prev => ({
            fixture: data.data.fixture ?? prev.fixture,
            events: data.data.events?.length ? data.data.events : prev.events,
            statistics: data.data.statistics?.length ? data.data.statistics : prev.statistics,
          }));
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 5s
      reconnectRef.current = window.setTimeout(() => connect(), 5000);
    };
  }, [fixtureId]);

  useEffect(() => {
    if (!initiallyLive) return;

    connect();

    return () => {
      if (esRef.current) esRef.current.close();
      clearTimeout(reconnectRef.current);
    };
  }, [initiallyLive, connect]);

  return (
    <LiveMatchContext.Provider value={{ live, isLive: initiallyLive, connected }}>
      {children}
    </LiveMatchContext.Provider>
  );
}
