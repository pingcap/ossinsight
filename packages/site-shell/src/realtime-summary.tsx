'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState, useMemo } from 'react';

type EventInterval = { cnt: number; latest_timestamp: string };

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function useRealtimeEvents(apiBase: string) {
  const queryResult = useQuery({
    queryKey: ['site-shell', 'events-increment-intervals', apiBase],
    queryFn: ({ signal }) =>
      fetchJson<{ data: EventInterval[] }>(`${apiBase}/events-increment-intervals`, signal),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    structuralSharing: false,
  });
  return queryResult.data?.data ?? [];
}

function useTotalEvents(apiBase: string) {
  const totalQuery = useQuery({
    queryKey: ['site-shell', 'events-total', apiBase],
    queryFn: ({ signal }) =>
      fetchJson<{ data: Array<{ cnt: number; latest_timestamp: number }> }>(`${apiBase}/events-total`, signal),
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 5 * 60 * 1000,
  });
  const baseRow = totalQuery.data?.data?.[0];

  const incrementQuery = useQuery({
    queryKey: ['site-shell', 'events-increment', apiBase, baseRow?.latest_timestamp ?? null],
    queryFn: ({ signal }) =>
      fetchJson<{ data: Array<{ cnt: number }> }>(
        `${apiBase}/events-increment?ts=${baseRow!.latest_timestamp}`,
        signal,
      ),
    enabled: baseRow?.latest_timestamp != null,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    structuralSharing: false,
  });

  const total = baseRow?.cnt ?? null;
  const added = incrementQuery.data?.data?.[0]?.cnt ?? 0;
  return total != null ? total + added : null;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number>(undefined);
  const startRef = useRef({ value: value, time: 0 });
  const targetRef = useRef(value);

  useEffect(() => {
    if (targetRef.current === value) return;
    const startValue = display;
    const startTime = performance.now();
    targetRef.current = value;
    startRef.current = { value: startValue, time: startTime };
    const duration = 400;
    const tick = (now: number) => {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(
        startRef.current.value + (targetRef.current - startRef.current.value) * eased,
      );
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span className="text-base font-semibold text-white tabular-nums">
      {display.toLocaleString()}
    </span>
  );
}

function MiniBarChart({ data }: { data: EventInterval[] }) {
  const maxVal = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => Number(d.cnt) || 0), 1);
  }, [data]);

  return (
    <div className="flex items-end gap-[1px] h-[24px] w-[80px]">
      {data.slice(-20).map((d, i) => {
        const cnt = Number(d.cnt) || 0;
        const h = Math.max((cnt / maxVal) * 22, cnt > 0 ? 1 : 0);
        return (
          <div
            key={i}
            className="flex-1 rounded-t-[1px]"
            style={{ height: h, backgroundColor: '#FFE895' }}
          />
        );
      })}
    </div>
  );
}

export function RealtimeSummary({ apiBase }: { apiBase: string }) {
  const total = useTotalEvents(apiBase);
  const events = useRealtimeEvents(apiBase);

  if (total == null) return null;

  return (
    <div
      className="hidden md:flex items-center gap-3"
      title="GitHub events data importing in Realtime. Each bar = Data importing in per 5 seconds."
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col leading-none">
          <span className="text-[10px] text-gray-500">Total</span>
          <span className="text-[10px] text-gray-500">Events</span>
        </div>
        <span className="text-[10px] text-gray-500 mx-0.5">|</span>
        <AnimatedNumber value={total} />
      </div>
      <MiniBarChart data={events} />
    </div>
  );
}
