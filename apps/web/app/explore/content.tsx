'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { EChartsOption } from 'echarts';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Circle,
  Info,
  CornerDownLeft,
  Inbox,
  Pause,
  RefreshCcw,
  Share2,
  TableProperties,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import {
  type FormEvent,
  type ReactNode,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block';
import ExploreIcon from '@/components/ExploreIcon';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ExplorerAnswer } from '@/lib/explorer/contracts';
import { getSiteAppOrigins } from '@repo/site-shell';
import { INTERNAL_API_SERVER, queryAPI } from '@/utils/api';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), {
  ssr: false,
});

interface Tag {
  id: number;
  label: string;
  color: string | null;
  sort: number;
}

interface RecommendQuestion {
  hash: string;
  title: string;
  aiGenerated: boolean;
  questionId: string | null;
  tags: Array<{
    id: number;
    label: string;
    color: string | null;
  }>;
}

function getRecommendQuestionIdentity(question: RecommendQuestion) {
  const questionId = question.questionId?.trim();
  if (questionId) {
    return questionId;
  }

  return `${question.hash}:${question.title.trim().toLowerCase()}`;
}

type EventInterval = { cnt: number; latest_timestamp: string };
type ExplorerPreview = {
  question: string;
  revisedQuestion?: string;
  keywords?: string[];
  subQuestions?: string[];
  combinedQuestion?: string;
  assumptions?: string[];
  summary?: string;
  sql?: string;
};
type ExplorerExecutionPhase = 'idle' | 'generating' | 'sql' | 'executing' | 'result';

const accentPalette = ['#F77C00', '#FFE895', '#E30C34', '#47D9A1', '#7CC8FF'];

const faqEntries = [
  {
    title: 'Can I use the AI-powered feature with my own dataset?',
    body: (
      <p>
        Yes! We integrated the capabilities of Text2SQL into{' '}
        <a className="site-link" href="https://tidbcloud.com/channel?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301">
          Chat2Query
        </a>
        , an AI-powered SQL generator in{' '}
        <a className="site-link" href="https://tidbcloud.com/channel?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301">
          TiDB Cloud
        </a>
        . If you want to explore any other dataset, Chat2Query is an excellent choice.
      </p>
    ),
  },
  {
    title: 'What are the limitations of GitHub Data Explorer?',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>AI is still a work in progress with limitations.</li>
        <li>A lack of context and knowledge of the specific database structure.</li>
        <li>A lack of domain knowledge.</li>
        <li>Inability to produce the most efficient SQL statement for large and complex queries.</li>
        <li>Sometimes service instability.</li>
        <li>The dataset itself is limited to GitHub public data sourced from GH Archive and GitHub event APIs.</li>
      </ul>
    ),
  },
  {
    title: 'Why did it fail to generate an SQL query?',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>The AI was unable to understand or misunderstood your question, resulting in an inability to generate SQL.</li>
        <li>Network issues.</li>
        <li>You had excessive requests. Note that you can ask up to 15 questions per hour.</li>
      </ul>
    ),
  },
  {
    title: 'The query result is not satisfactory. How can I optimize my question?',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Use GitHub login names instead of nicknames.</li>
        <li>Use full repository names like <code>facebook/react</code>.</li>
        <li>Be explicit about the metric and time range, such as stars, forks, pull requests, or issues.</li>
      </ul>
    ),
  },
  {
    title: 'Why did it fail to generate a chart?',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>The SQL query was incorrect or could not be generated, so the answer could not be found in the database.</li>
        <li>The answer was found, but the preset chart template did not fit the result shape.</li>
        <li>The SQL query was correct, but no answer was found, so the chart could not be displayed.</li>
      </ul>
    ),
  },
  {
    title: 'What technology is GitHub Data Explorer built on?',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Data source: GH Archive and GitHub event API.</li>
        <li>One database for all workloads: TiDB Cloud.</li>
        <li>AI engine: OpenAI.</li>
      </ul>
    ),
  },
];

const howItWorksSteps = [
  'Input your question',
  'Translate the question into SQL',
  'Visualize and output results',
];

const featuredQuestions = [
  {
    title: 'How diverse is django\'s community (by coders\' distribution)',
    imageUrl: '/img/explore/img1.png',
    tags: [{ id: 2, label: 'Repositories', color: '#a3fcc8' }],
  },
  {
    title: 'Summary of @gvanrossum\'s contribution by event type in 2022',
    imageUrl: '/img/explore/img2.png',
    tags: [{ id: 1, label: 'Developers', color: '#f2ac99' }],
  },
];

const footerCards = [
  {
    kind: 'Blog: 10 min read',
    title: 'How do we implement OSS Insight ?',
    href: '/blog/why-we-choose-tidb-to-support-ossinsight',
    icon: '/img/explore/footer-icon-1.png',
  },
  {
    kind: 'Tutorial: 10 min read',
    title: 'Use TiDB Cloud to Analyze GitHub Events in 10 Minutes',
    href: '/blog/try-it-yourself',
    icon: '/img/explore/footer-icon-2.png',
  },
  {
    kind: 'Tutorial: 25 min',
    title: 'Join a Workshop to Setup a Mini OSS Insight',
    href: '/docs/workshop/ossinsight-lite/introduction',
    icon: '/img/explore/footer-icon-3.png',
  },
];

const runningPrompts = [
  'Querying 5+ billion rows of GitHub data...',
  'We stay in sync with GitHub event data for real-time insights!',
  'We can handle complex queries with a powerful database, even those generated by AI.',
  'Click Check it out in the upper right corner to inspect the SQL generated by AI.',
];

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const payload = await safeReadError(response);
    throw new Error(payload || `${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function safeReadError(response: Response) {
  try {
    const json = await response.json();
    return typeof json.error === 'string' ? json.error : null;
  } catch {
    return null;
  }
}

async function streamExplorerAnswer(
  question: string,
  signal: AbortSignal,
  handlers: {
    onPhase?: (phase: ExplorerExecutionPhase) => void;
    onPreview?: (preview: ExplorerPreview) => void;
  },
) {
  const response = await fetch(`${INTERNAL_API_SERVER}/explorer/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ question, stream: true }),
    signal,
  });

  if (!response.ok) {
    const payload = await safeReadError(response);
    throw new Error(payload || `${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/event-stream')) {
    return response.json() as Promise<ExplorerAnswer>;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Missing stream body from Data Explorer.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let finalAnswer: ExplorerAnswer | null = null;

  const parseEvent = (chunk: string) => {
    const data = chunk
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n');
    if (!data) {
      return null;
    }
    return JSON.parse(data) as
      | { type: 'phase'; phase: ExplorerExecutionPhase }
      | { type: 'preview'; preview: ExplorerPreview }
      | { type: 'result'; answer: ExplorerAnswer }
      | { type: 'done' }
      | { type: 'error'; error: string };
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const rawEvent of events) {
      const event = parseEvent(rawEvent);
      if (!event) {
        continue;
      }

      if (event.type === 'phase') {
        handlers.onPhase?.(event.phase);
      } else if (event.type === 'preview') {
        handlers.onPreview?.(event.preview);
      } else if (event.type === 'result') {
        finalAnswer = event.answer;
      } else if (event.type === 'error') {
        throw new Error(event.error);
      }
    }

    if (done) {
      break;
    }
  }

  if (!finalAnswer) {
    throw new Error('Data Explorer stream finished without a result.');
  }

  return finalAnswer;
}

function toChartNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return 0;
}

function toDisplayValue(value: unknown) {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (value == null) {
    return '—';
  }

  return String(value);
}

function isLikelyRepositoryName(column: string, value: unknown) {
  return typeof value === 'string' && value.includes('/') && /repo/i.test(column);
}

function isLikelyUrl(column: string, value: unknown) {
  return typeof value === 'string' && /^https?:\/\//.test(value) && /url|link/i.test(column);
}

function renderExplorerCell(column: string, value: unknown) {
  if (isLikelyRepositoryName(column, value)) {
    return (
      <Link
        href={`/analyze/${value}`}
        className="text-[#fbe593] transition-colors hover:text-[#fceeb4]"
      >
        {value}
      </Link>
    );
  }

  if (isLikelyUrl(column, value)) {
    return (
      <a
        className="text-[#fbe593] transition-colors hover:text-[#fceeb4]"
        href={String(value)}
        target="_blank"
        rel="noreferrer"
      >
        {value}
      </a>
    );
  }

  return toDisplayValue(value);
}

function getChartOption(answer: ExplorerAnswer): EChartsOption | null {
  const rows = answer.rows;
  const chart = answer.chart;
  const isArea = chart.preset === 'timeseries-area';

  if (rows.length === 0) {
    return null;
  }

  if (chart.kind === 'pie' && chart.labelKey && chart.valueKey) {
    return {
      backgroundColor: 'transparent',
      color: accentPalette,
      tooltip: { trigger: 'item' },
      legend: {
        bottom: 0,
        textStyle: { color: '#b7b7b9' },
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '74%'],
          itemStyle: {
            borderColor: '#1a1a1b',
            borderWidth: 2,
          },
          label: { color: '#e8e8e8' },
          data: rows.map((row) => ({
            name: String(row[chart.labelKey!] ?? ''),
            value: toChartNumber(row[chart.valueKey!]),
          })),
        },
      ],
    };
  }

  if ((chart.kind === 'bar' || chart.kind === 'line' || chart.kind === 'area') && chart.xKey && chart.yKeys.length > 0) {
    const categories = rows.map((row) => String(row[chart.xKey!] ?? ''));

    return {
      backgroundColor: 'transparent',
      color: accentPalette,
      grid: {
        top: 28,
        right: 20,
        bottom: 56,
        left: 56,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a1b',
        borderColor: '#303033',
        textStyle: { color: '#e8e8e8' },
      },
      legend: {
        top: 0,
        textStyle: { color: '#b7b7b9' },
      },
      xAxis: {
        type: 'category',
        data: categories,
        boundaryGap: chart.kind === 'bar',
        axisLine: { lineStyle: { color: '#353536' } },
        axisLabel: { color: '#a8a8ab' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: '#a8a8ab' },
      },
      series: chart.yKeys.map((key, index) => ({
        name: key,
        type: chart.kind === 'bar' ? 'bar' : 'line',
        smooth: chart.kind !== 'bar',
        barMaxWidth: 28,
        lineStyle: { width: 3 },
        areaStyle: isArea ? { opacity: 0.18 } : undefined,
        itemStyle: {
          color: accentPalette[index % accentPalette.length],
        },
        emphasis: {
          focus: 'series',
        },
        data: rows.map((row) => toChartNumber(row[key])),
      })),
    };
  }

  return null;
}

function AnimatedCount({ value, color = '#9197D0' }: { value: number; color?: string }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    const to = value;
    if (from === to) {
      return;
    }

    previous.current = to;
    const start = performance.now();
    const duration = 400;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span
      className="font-bold"
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontVariantNumeric: 'tabular-nums',
        color,
      }}
    >
      {display.toLocaleString()}
    </span>
  );
}

function ExploreHero({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onStop,
  compact,
  embedded = false,
}: {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (question: string) => void;
  onStop: () => void;
  compact: boolean;
  embedded?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const totalQuery = useQuery({
    queryKey: ['explorer', 'events-total-copy'],
    queryFn: ({ signal }) => queryAPI<{ cnt: number; latest_timestamp: number }>('events-total', undefined, signal),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
  const intervalsQuery = useQuery({
    queryKey: ['explorer', 'events-increment-intervals-copy'],
    queryFn: ({ signal }) => queryAPI<EventInterval>('events-increment-intervals', undefined, signal),
    staleTime: 15000,
    refetchInterval: 15000,
  });

  const baseTotal = totalQuery.data?.data?.[0]?.cnt ?? 0;
  const totalIncrement = (intervalsQuery.data?.data ?? []).reduce((sum, row) => sum + Number(row.cnt || 0), 0);
  const totalEvents = baseTotal > 0 ? baseTotal + totalIncrement : 0;
  const hasInput = input.trim().length > 0;

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    element.style.height = '58px';
    element.style.height = `${element.scrollHeight}px`;
  }, [input]);

  return (
    <section className={cn(
      embedded
        ? 'flex flex-col items-stretch px-0 pb-0 text-left'
        : 'mx-auto flex max-w-[1280px] flex-col items-center px-6 pb-0 text-center',
      compact ? (embedded ? 'pt-0' : 'pt-4') : 'pt-8 md:pt-10',
    )}>
      {!compact ? (
        <>
          <h1 className="flex flex-wrap items-center justify-center gap-3 text-[34px] font-semibold leading-tight text-[#e3e3e3] md:text-[42px]">
            <ExploreIcon width={36} height={36} />
            <span>GitHub Data Explorer</span>
            <img src="/img/explore/beta.svg" alt="beta" className="h-5 w-auto translate-y-[2px]" />
          </h1>
          <p className="mt-4 text-[16px] text-[#7c7c7c]">
            Explore {totalEvents > 0 ? <AnimatedCount value={totalEvents} color="#9197D0" /> : 'billions of rows of'} GitHub data with no SQL or plotting skills. Powered by{' '}
            <img
              src="/img/tidb-cloud-logo-o.png"
              alt="tidb cloud logo"
              className="relative -top-[2px] ml-1 inline-block h-[18px] w-auto align-middle"
            />
          </p>
        </>
      ) : null}

      <div className={cn('w-full text-left', compact ? (embedded ? 'max-w-none' : 'max-w-[1040px]') : 'mt-8 max-w-[960px]')}>
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSubmit(input);
          }}
          className="relative rounded-[6px] bg-[#eaeaea] pr-[88px] shadow-none"
        >
          <textarea
            ref={textareaRef}
            disabled={isLoading}
            onChange={(event) => onInputChange(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                onSubmit(input);
              }
            }}
            placeholder="Questions about GitHub repos, users, orgs, languages..."
            value={input}
            rows={1}
            className="block min-h-[58px] w-full resize-none overflow-hidden border-0 bg-transparent px-[14px] py-[14px] pr-2 text-[20px] leading-[30px] text-[#3c3c3c] outline-none placeholder:text-[#7c7c7c] disabled:text-[rgba(60,60,60,0.7)]"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[#3c3c3c]">
            <button
              type="submit"
              disabled={!hasInput || isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5 disabled:text-[rgba(60,60,60,0.3)]"
              aria-label="Submit"
            >
              <CornerDownLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLoading) {
                  onStop();
                } else {
                  onInputChange('');
                }
              }}
              disabled={!isLoading && !hasInput}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5 disabled:text-[rgba(60,60,60,0.3)]"
              aria-label={isLoading ? 'Stop' : 'Clear'}
            >
              {isLoading ? <Pause className="size-4" /> : <X className="size-4" />}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function TagBadge({ label, color, className }: { label: string; color?: string | null; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]', className)}
      style={{
        borderColor: `${color ?? '#666'}55`,
        color: color ?? '#b7b7b9',
        backgroundColor: `${color ?? '#666'}14`,
      }}
    >
      {label}
    </span>
  );
}

function FeaturedQuestionCard({
  title,
  imageUrl,
  tags,
  onSelect,
}: {
  title: string;
  imageUrl: string;
  tags: Array<{ id: number; label: string; color: string | null }>;
  onSelect: (value: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(title)}
      className="w-full rounded-[6px] bg-[rgba(44,44,44,0.5)] text-left transition hover:bg-[rgba(44,44,44,0.8)]"
    >
      <div className="flex h-full w-full flex-col gap-3 rounded-[6px] px-[18px] py-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[14px] leading-[1.5] text-white">{title}</div>
          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-[#959595]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={`${title}-${tag.id}`} label={tag.label} color={tag.color} />
          ))}
        </div>
        <Image
          src={imageUrl}
          alt="preview image"
          width={456}
          height={241}
          sizes="(max-width: 768px) 100vw, 456px"
          className="h-auto w-full"
        />
      </div>
    </button>
  );
}

function QuestionListButton({
  question,
  onSelect,
  showTag = true,
}: {
  question: RecommendQuestion;
  onSelect: (value: string) => void;
  showTag?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(question.title)}
      className="block w-full py-2 text-left text-[14px] leading-[1.5] text-[#c1c1c1] transition hover:text-white"
    >
      <div className="text-sm leading-6 text-[#d7d7d8]">
        <span className="mr-1 inline text-[11px] font-medium text-[#777779] align-[1px]">&gt;</span>
        <span>{question.title}</span>
        {showTag
          ? question.tags.slice(0, 1).map((tag) => (
              <TagBadge
                key={`${question.hash}-${tag.id}`}
                label={tag.label}
                color={tag.color}
                className="ml-2 align-middle"
              />
            ))
          : null}
      </div>
    </button>
  );
}

function QuestionListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-[#2a2a2c]">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`question-skeleton-${index}`} className="py-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-1 h-[13px] w-[13px] rounded-full bg-[#2a2a2c] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent" />
            <div className="min-w-0 flex-1">
              <div
                className="h-4 rounded bg-[#2a2a2c] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent"
                style={{ width: `${88 - index * 8}%` }}
              />
              <div className="mt-3 h-5 w-20 rounded-full bg-[#2a2a2c] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RotatingPrompt({ source }: { source: string[] }) {
  const prompt = source[0] ?? '';

  if (!prompt) {
    return null;
  }

  return <div className="mt-4 text-[14px] leading-7 text-[#929292]">{prompt}</div>;
}

function PlanningLine({
  icon,
  label,
  children,
  className,
}: {
  icon?: ReactNode;
  label?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2 text-[14px] leading-7 text-[#dbdbdd]', className)}>
      {icon ? (
        <span className="inline-flex h-7 w-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : (
        <span className="h-7 w-4 shrink-0" />
      )}
      <div className="min-w-0 pt-0.5">
        {label ? <span className="text-[#d8d8da]">{label} </span> : null}
        {children}
      </div>
    </div>
  );
}

function PlanningList({ items }: { items: string[] }) {
  return (
    <div className="ml-6 mt-1 space-y-1 text-[14px] leading-6 text-[#c5c5c7]">
      {items.map((item) => (
        <div key={item} className="truncate">
          {item}
        </div>
      ))}
    </div>
  );
}

function ExplorerPlanningShell({
  previewAnswer,
  phase,
}: {
  previewAnswer?: ExplorerPreview | null;
  phase: 'generating' | 'sql' | 'executing';
}) {
  const effectiveQuestion =
    previewAnswer?.combinedQuestion ||
    previewAnswer?.revisedQuestion ||
    previewAnswer?.question ||
    '';
  const statusLabel =
    phase === 'executing'
      ? 'Running SQL...'
      : phase === 'sql'
        ? 'Generating SQL...'
        : 'Generating SQL...';

  return (
    <div className="rounded-[6px] bg-[linear-gradient(116.45deg,rgba(89,95,236,0.5)_0%,rgba(200,182,252,0.1)_96.73%)] p-px">
      <div className="rounded-[5px] bg-[#24232b] px-6 py-5">
        {effectiveQuestion ? (
          <PlanningLine icon={<ExploreIcon width={14} height={14} />} label="You seem curious about:">
            <span className="font-semibold text-[#ecbaaa]">{effectiveQuestion}</span>
          </PlanningLine>
        ) : null}

        {previewAnswer?.keywords?.length ? (
          <PlanningLine label="Extracting key words:">
            <span className="font-semibold text-[#f0f0f1]">{previewAnswer.keywords.join(', ')}</span>
          </PlanningLine>
        ) : null}

        {previewAnswer?.subQuestions?.length ? (
          <div className="mt-1">
            <PlanningLine label="Thinking about the details..." className="leading-8" />
            <PlanningList items={previewAnswer.subQuestions} />
          </div>
        ) : null}

        {previewAnswer?.assumptions?.length ? (
          <PlanningLine label="I suppose:">
            <span className="font-semibold text-[#f4efda]">{previewAnswer.assumptions[0]}</span>
          </PlanningLine>
        ) : null}

        <PlanningLine
          icon={<span className="inline-block h-[10px] w-[10px] rounded-full bg-[#2db2ff]" />}
          className="mt-1"
        >
          <span>{statusLabel}</span>
        </PlanningLine>

        {phase === 'executing' ? <RotatingPrompt source={runningPrompts} /> : null}
      </div>
    </div>
  );
}

function TagSkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`tag-skeleton-${index}`}
          className="h-7 rounded-full bg-[#2a2a2c] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent"
          style={{ width: `${52 + (index % 3) * 20}px` }}
        />
      ))}
    </div>
  );
}

function ExplorerMetricCard({ answer }: { answer: ExplorerAnswer }) {
  const row = answer.rows[0];
  const chart = answer.chart;

  if (!row || !chart.valueKey) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[14px] border border-[#353536] bg-[#212122] p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">
          {chart.labelKey ? toDisplayValue(row[chart.labelKey]) : chart.title}
        </div>
        <div className="mt-4 text-[42px] font-semibold leading-none text-[#FFE895]">
          {toDisplayValue(row[chart.valueKey])}
        </div>
        <div className="mt-3 text-sm text-[#b7b7b9]">{chart.description}</div>
      </div>
      <div className="rounded-[14px] border border-[#353536] bg-[#212122] p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Returned Fields</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {answer.fields.map((field) => (
            <span
              key={field.name}
              className="rounded-full border border-[#353536] bg-[#1a1a1b] px-3 py-1 text-xs text-[#d7d7d8]"
            >
              {field.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExplorerTable({ answer }: { answer: ExplorerAnswer }) {
  const columns = answer.fields.map((field) => field.name);
  const fieldMap = new Map(answer.fields.map((field) => [field.name, field.kind]));

  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-[#353536] px-4 py-12 text-center">
        <Inbox className="h-8 w-8 text-[#555]" />
        <p className="text-sm font-medium text-[#7c7c7c]">No results found</p>
        <p className="max-w-sm text-sm text-[#555]">Try rephrasing your question or asking about a different topic.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Table className="min-w-full text-[13px]">
        <TableHeader className="[&_tr]:border-b-[#2c2c2d]">
          <TableRow className="border-b border-[#2c2c2d] hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column}
                className={cn(
                  'h-11 px-3 text-[12px] font-medium uppercase tracking-[0.08em] text-[#7d7d7d]',
                  fieldMap.get(column) === 'number' ? 'text-right' : 'text-left',
                )}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {answer.rows.map((row, index) => (
            <TableRow
              key={`${index}-${columns[0] ?? 'row'}`}
              className="border-b border-[#242426] hover:bg-white/[0.03]"
            >
              {columns.map((column) => (
                <TableCell
                  key={column}
                  className={cn(
                    'px-3 py-3 text-[#d7d7d8]',
                    fieldMap.get(column) === 'number'
                      ? 'text-right font-mono tabular-nums'
                      : 'text-left',
                  )}
                >
                  {renderExplorerCell(column, row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ExplorerSqlCode({
  code,
  clipped = false,
}: {
  code: string;
  clipped?: boolean;
}) {
  const content = (
    <div className="relative">
      <CodeBlock code={code} language="sql" className="rounded-[16px] border-white/[0.06] bg-[#17181d]">
        <div className="sr-only">Generated SQL</div>
      </CodeBlock>
      <CodeBlockCopyButton className="absolute right-3 top-3 z-10 text-[#8ca0a6] hover:text-white" />
      {clipped ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(180deg,rgba(23,24,29,0),#17181d)]" />
      ) : null}
    </div>
  );

  if (!clipped) {
    return content;
  }

  return <div className="relative max-h-[52px] overflow-hidden">{content}</div>;
}

function ResultViewToggle({
  value,
  onValueChange,
  disabled,
}: {
  value: 'visualization' | 'raw';
  onValueChange: (value: 'visualization' | 'raw') => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#3c3c3c] bg-[#2d2d34] px-2 py-1">
      <BarChart3 className={cn('size-3.5', value === 'visualization' ? 'text-[#fbe593]' : 'text-[#8b8b8e]')} />
      <Switch
        aria-label="Switch result view"
        checked={value === 'raw'}
        disabled={disabled}
        onCheckedChange={(checked) => onValueChange(checked ? 'raw' : 'visualization')}
      />
      <TableProperties className={cn('size-3.5', value === 'raw' ? 'text-[#fbe593]' : 'text-[#8b8b8e]')} />
    </div>
  );
}

function replaceEngineName(name: string) {
  switch (name) {
    case 'tiflash':
      return 'columnar storage';
    case 'tikv':
      return 'row storage';
    default:
      return name;
  }
}

function ExplorerSectionStatusIcon({
  status,
}: {
  status: 'loading' | 'success' | 'error';
}) {
  if (status === 'loading') {
    return (
      <span className="relative inline-flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6e82ff] opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#6e82ff]" />
      </span>
    );
  }

  if (status === 'error') {
    return <Circle className="size-3.5 shrink-0 text-[#8b8b8e]" fill="currentColor" />;
  }

  return <CheckCircle2 className="size-4 shrink-0 text-[#32d583]" />;
}

function ExplorerInfoTooltip({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={120}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#8b8fa0] transition hover:text-white"
            aria-label="More information"
          >
            <Info className="size-3.5" />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={8}
            className="z-50 max-w-[360px] rounded-[8px] border border-white/[0.08] bg-[#24232b] px-3 py-2 text-[13px] leading-5 text-[#d7d7d8] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
          >
            {children}
            <TooltipPrimitive.Arrow className="fill-[#24232b]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

function ExplainPlanDialog({ plan }: { plan: Record<string, unknown>[] }) {
  const columns = useMemo(() => {
    const set = new Set<string>();
    for (const row of plan) {
      Object.keys(row).forEach((key) => set.add(key));
    }
    return Array.from(set);
  }, [plan]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="ml-2 inline-flex items-center gap-1 text-[13px] font-normal text-[#b0b8ff] transition hover:text-white"
        >
          <span>Explain SQL</span>
          <span>&gt;</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[960px] bg-[#24232b]">
        <DialogHeader>
          <DialogTitle>TiDB execution plan</DialogTitle>
          <DialogDescription>
            TiDB chooses the execution engine for each query on the same service. This is the
            `EXPLAIN FORMAT='brief'` plan for the generated SQL.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto">
          <Table className="min-w-[860px] text-[12px]">
            <TableHeader className="[&_tr]:border-b-[#2c2c2d]">
              <TableRow className="border-b border-[#2c2c2d] hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead key={column} className="h-11 px-3 text-[12px] uppercase tracking-[0.08em] text-[#7d7d7d]">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.map((row, index) => (
                <TableRow key={`plan-${index}`} className="border-b border-[#242426] hover:bg-white/[0.03]">
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column}`} className="px-3 py-2 align-top text-left text-[#d7d7d8] whitespace-pre-wrap">
                      {toDisplayValue(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExplorerResultMeta({
  engines,
  plan,
}: {
  engines: string[];
  plan: Record<string, unknown>[];
}) {
  if (engines.length === 0 && plan.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-normal text-[#c8cad5]">
      <span>. Running on</span>
      <span className="inline-flex items-center gap-1 text-[#b0b8ff]">
        <img src="/img/tidb-cloud-logo-o.png" alt="TiDB" className="h-[16px] w-auto" />
        <span>{engines.map(replaceEngineName).join(', ') || 'TiDB Cloud'}</span>
      </span>
      <ExplorerInfoTooltip>
        <div>
          TiDB chooses the execution engine for each query on the same service:
        </div>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          <li>The columnar engine handles complex analytical queries.</li>
          <li>The row-based engine handles low-latency high-concurrency queries.</li>
        </ul>
      </ExplorerInfoTooltip>
      {plan.length > 0 ? <ExplainPlanDialog plan={plan} /> : null}
    </div>
  );
}

function ExplorerVisualization({ answer }: { answer: ExplorerAnswer }) {
  const option = useMemo(() => getChartOption(answer), [answer]);

  if (answer.rowCount === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#353536] px-4 py-12 text-center text-sm text-[#8c8c8c]">
        The query completed successfully, but no rows matched this question.
      </div>
    );
  }

  if (answer.chart.kind === 'metric') {
    return <ExplorerMetricCard answer={answer} />;
  }

  if (answer.chart.kind === 'table' || !option) {
    return <ExplorerTable answer={answer} />;
  }

  return (
    <div className="border border-[#353536] bg-[#212122] p-4">
      <LazyECharts option={option} style={{ width: '100%', height: 440 }} />
    </div>
  );
}

function ExploreSectionShell({
  status,
  title,
  controls,
  children,
}: {
  status: 'loading' | 'success' | 'error';
  title: ReactNode;
  controls?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[6px] bg-[linear-gradient(116.45deg,rgba(89,95,236,0.5)_0%,rgba(200,182,252,0.1)_96.73%)] p-px">
      <div className="rounded-[5px] bg-[#24232b] px-2">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 text-[16px] font-bold text-[#e3e3e3]">
          <div className="flex min-w-0 items-center gap-3">
            <ExplorerSectionStatusIcon status={status} />
            <div className="min-w-0 flex-1">{title}</div>
          </div>
          {controls}
        </div>
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

function ExplorerResult({
  answer,
}: {
  answer: ExplorerAnswer;
}) {
  const [activeResultTab, setActiveResultTab] = useState<'visualization' | 'raw'>('visualization');
  const [showSql, setShowSql] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setActiveResultTab(answer.chart.kind === 'table' ? 'raw' : 'visualization');
  }, [answer.chart.kind, answer.sql]);

  const hasVisualization = useMemo(
    () => answer.chart.kind !== 'table' && getChartOption(answer) != null,
    [answer],
  );

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1500);
    } catch {
      setShareCopied(false);
    }
  }, []);

  return (
    <section className="mt-3">
      <div className="min-w-0">
          <ExploreSectionShell
            status="success"
            title="Ta-da! SQL is written,"
            controls={(
              <button
                type="button"
                onClick={() => setShowSql((value) => !value)}
                className="text-[14px] font-normal text-[#d7d7d8] transition hover:text-white"
              >
                {showSql ? 'Hide' : 'Check it out'}
              </button>
            )}
          >
            <ExplorerSqlCode code={answer.sql} clipped={!showSql} />
          </ExploreSectionShell>

          <div className="mt-3">
            <ExploreSectionShell
              status="success"
              title={
                <div>
                  <div>{`${answer.rowCount.toLocaleString()} rows in ${(answer.durationMs / 1000).toFixed(2)} seconds`}</div>
                  <ExplorerResultMeta engines={answer.engines} plan={answer.plan} />
                </div>
              }
              controls={(
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      void handleShare();
                    }}
                    className="mr-3 inline-flex items-center gap-1 border-r border-[#3c3c3c] pr-3 text-[14px] font-normal text-[#d7d7d8] transition hover:text-white"
                  >
                    <span>{shareCopied ? 'Copied' : 'Share'}</span>
                    <Share2 className="size-3.5" />
                  </button>
                  <ResultViewToggle
                    disabled={!hasVisualization}
                    value={hasVisualization ? activeResultTab : 'raw'}
                    onValueChange={setActiveResultTab}
                  />
                </div>
              )}
            >
                {hasVisualization && activeResultTab === 'visualization' ? (
                  <ExplorerVisualization answer={answer} />
                ) : (
                  <ExplorerTable answer={answer} />
                )}

                <div className="mt-6 bg-[#323140] px-4 py-2 text-[14px] text-[#d7d7d8]">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span>Do you like the result?</span>
                    <button
                      type="button"
                      onClick={() => setFeedback((value) => (value === 'up' ? null : 'up'))}
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-full transition',
                        feedback === 'up' ? 'text-[#fbe593]' : 'text-[#d7d7d8] hover:text-white',
                      )}
                      aria-label="Helpful"
                    >
                      <ThumbsUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedback((value) => (value === 'down' ? null : 'down'))}
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-full transition',
                        feedback === 'down' ? 'text-[#fbe593]' : 'text-[#d7d7d8] hover:text-white',
                      )}
                      aria-label="Not helpful"
                    >
                      <ThumbsDown className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#3c3c3c] pt-4 text-[14px] leading-[21px] text-[#d1d1d1]">
                  🤔 Not exactly what you&apos;re looking for? Check out our{' '}
                  <a className="site-link" href="#data-explorer-faq">
                    FAQ
                  </a>{' '}
                  for help. If the problem persists, please{' '}
                  <a
                    className="site-link"
                    href="https://github.com/pingcap/ossinsight/issues"
                    target="_blank"
                    rel="noreferrer"
                  >
                    report an issue
                  </a>{' '}
                  to us.
                </div>
            </ExploreSectionShell>
          </div>
      </div>
    </section>
  );
}

function ExploreExecutionSidebar({
  sideQuestions,
  onSelectQuestion,
  onReloadQuestions,
  isReloadingQuestions,
  isLoading,
}: {
  sideQuestions: RecommendQuestion[];
  onSelectQuestion: (value: string) => void;
  onReloadQuestions: () => void;
  isReloadingQuestions: boolean;
  isLoading: boolean;
}) {
  return (
    <aside className="hidden self-start md:block">
      <div className="sticky top-[88px]">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[16px] font-semibold text-[#e3e3e3]">
            <span>💡 Popular questions</span>
            <button
              type="button"
              onClick={onReloadQuestions}
              disabled={isReloadingQuestions}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#b7b7b9] transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              aria-label="Reload questions"
            >
              <RefreshCcw className={cn('size-3.5', isReloadingQuestions && 'animate-spin')} />
            </button>
          </div>
          <div>
            {isLoading && sideQuestions.length === 0 ? (
              <QuestionListSkeleton count={4} />
            ) : (
              sideQuestions.slice(0, 4).map((question, index) => (
                <QuestionListButton
                  key={`${getRecommendQuestionIdentity(question)}:side:${index}`}
                  question={question}
                  onSelect={onSelectQuestion}
                  showTag={false}
                />
              ))
            )}
          </div>
          <Link href="/explore" className="mt-2 inline-block text-[14px] text-[#c1c1c1]">
            &gt; See more
          </Link>
        </div>

        <div className="mt-6 border-t border-[#3c3c3c] pt-6">
          <ExploreAdsCard
            size="small"
            href="https://tidbcloud.com/channel?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301&utm_content=result_right"
          />
        </div>
      </div>
    </aside>
  );
}

function ExploreExecutionLayout({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onStop,
  errorMessage,
  answer,
  stagedAnswer,
  phase,
  sideQuestions,
  onSelectQuestion,
  onReloadQuestions,
  isReloadingQuestions,
  areQuestionsLoading,
}: {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (question: string) => void;
  onStop: () => void;
  errorMessage: string | null;
  answer: ExplorerAnswer | null;
  stagedAnswer: ExplorerPreview | null;
  phase: ExplorerExecutionPhase;
  sideQuestions: RecommendQuestion[];
  onSelectQuestion: (value: string) => void;
  onReloadQuestions: () => void;
  isReloadingQuestions: boolean;
  areQuestionsLoading: boolean;
}) {
  return (
    <section className="mx-auto max-w-[1536px] px-6 pt-2">
      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_250px] lg:grid-cols-[minmax(0,1fr)_275px]">
        <div className="min-w-0">
          <ExploreHero
            input={input}
            isLoading={isLoading}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            onStop={onStop}
            compact
            embedded
          />

          {errorMessage ? (
            <div className="mt-6">
              <div className="rounded-[14px] border border-[#6a2c2f] bg-[#231417] px-5 py-4 text-sm text-[#ffb6b1]">
                <p>{errorMessage}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={onSubmit}
                    className="rounded-lg bg-[#6a2c2f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#7d3437] transition-colors"
                  >
                    Try again
                  </button>
                  <span className="text-xs text-[#ff8a84]/60">
                    Tip: Try rephrasing your question or be more specific.
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {(phase === 'generating' || phase === 'sql' || phase === 'executing') && !errorMessage ? (
            <ExplorerLoadingState question={input} previewAnswer={stagedAnswer} phase={phase} />
          ) : null}

          {phase === 'result' && answer ? (
            <ExplorerResult answer={answer} />
          ) : null}

          {(phase === 'result' && answer) || errorMessage ? (
            <ExploreBottomAdsSection />
          ) : null}
        </div>

        <ExploreExecutionSidebar
          sideQuestions={sideQuestions}
          onSelectQuestion={onSelectQuestion}
          onReloadQuestions={onReloadQuestions}
          isReloadingQuestions={isReloadingQuestions}
          isLoading={areQuestionsLoading}
        />
      </div>
    </section>
  );
}

function ExplorerLoadingState({
  question,
  previewAnswer,
  phase,
}: {
  question: string;
  previewAnswer?: ExplorerPreview | null;
  phase: 'generating' | 'sql' | 'executing';
}) {
  const phaseHint = phase === 'generating'
    ? 'Analyzing your question… (~5s)'
    : phase === 'sql'
      ? 'Writing SQL query… (~3s)'
      : 'Running query on 10B+ events… (~10s)';

  return (
    <section className="mt-3">
      <div className="min-w-0">
        <div className="mb-2 text-xs text-[#7c7c7c] animate-pulse">{phaseHint}</div>
        <ExplorerPlanningShell
          previewAnswer={previewAnswer ?? { question }}
          phase={phase}
        />

        {(phase === 'sql' || phase === 'executing') && previewAnswer?.sql ? (
          <div className="mt-3">
            <ExploreSectionShell
              status={phase === 'executing' ? 'success' : 'loading'}
              title="Ta-da! SQL is written,"
              controls={<span className="text-[14px] font-normal text-[#d7d7d8]">Check it out</span>}
            >
              <ExplorerSqlCode code={previewAnswer.sql} clipped />
            </ExploreSectionShell>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ExplorePopularSection({
  tags,
  questions,
  selectedTag,
  onSelectTag,
  onSelectQuestion,
  areQuestionsLoading,
  areTagsLoading,
}: {
  tags: Tag[];
  questions: RecommendQuestion[];
  selectedTag: number | null;
  onSelectTag: (value: number | null) => void;
  onSelectQuestion: (value: string) => void;
  areQuestionsLoading: boolean;
  areTagsLoading: boolean;
}) {
  const [expand, setExpand] = useState(false);
  const listed = expand ? questions : questions.slice(0, 20);

  return (
    <section className="mx-auto mt-10 max-w-[1536px] px-6">
      <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="space-y-4">
          <div>
            <h2 className="mb-4 text-[16px] font-semibold text-[#e3e3e3]">💡 Popular questions</h2>
            <div className="space-y-4">
              {featuredQuestions.map((question) => (
                <FeaturedQuestionCard
                  key={question.title}
                  title={question.title}
                  imageUrl={question.imageUrl}
                  tags={question.tags}
                  onSelect={onSelectQuestion}
                />
              ))}
            </div>
          </div>

          <ExploreAdsCard href="https://tidbcloud.com/channel?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301&utm_content=home_left" />
        </div>

        <div>
          {areTagsLoading && tags.length === 0 ? (
            <TagSkeletonRow />
          ) : (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectTag(null)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[12px] transition',
                  selectedTag == null ? 'border-[#cccccc] bg-[rgba(204,204,204,0.9)] text-[#222]' : 'border-[rgba(204,204,204,0.3)] bg-[rgba(204,204,204,0.08)] text-[#cccccc] hover:bg-[rgba(204,204,204,0.15)]',
                )}
              >
                All
              </button>
              <span className="mx-1 h-5 w-px bg-[#4a4a4c]" />
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onSelectTag(tag.id)}
                  className="rounded-full border px-3 py-1 text-[12px] transition"
                  style={{
                    color: selectedTag === tag.id ? '#1e1e1f' : tag.color ?? '#b7b7b9',
                    backgroundColor: selectedTag === tag.id ? tag.color ?? '#ccc' : `${tag.color ?? '#ccc'}1a`,
                    borderColor: selectedTag === tag.id ? tag.color ?? '#ccc' : `${tag.color ?? '#ccc'}4d`,
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          )}

          {areQuestionsLoading && listed.length === 0 ? (
            <QuestionListSkeleton count={8} />
          ) : (
            <div className="divide-y divide-[#2a2a2c]">
              {listed.map((question, index) => (
                <QuestionListButton
                  key={`${getRecommendQuestionIdentity(question)}:main:${index}`}
                  question={question}
                  onSelect={onSelectQuestion}
                  showTag
                />
              ))}
            </div>
          )}
          {!expand && questions.length > 20 ? (
            <div className="mt-4 flex items-center gap-4 text-[#b7b7b9]">
              <div className="h-px flex-1 bg-[#353536]" />
              <button type="button" className="text-sm" onClick={() => setExpand(true)}>
                See More
              </button>
              <div className="h-px flex-1 bg-[#353536]" />
            </div>
          ) : null}
          {expand && questions.length > 20 ? (
            <div className="mt-4 flex items-center gap-4 text-[#b7b7b9]">
              <div className="h-px flex-1 bg-[#353536]" />
              <button type="button" className="text-sm" onClick={() => setExpand(false)}>
                Collapse
              </button>
              <div className="h-px flex-1 bg-[#353536]" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ExploreStepsRow() {
  return (
    <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
      {howItWorksSteps.map((step, index) => (
        <div key={step} className="contents">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(90deg,#794BC5_0%,#3D44FF_100%)] text-[14px] font-semibold text-white">
              {index + 1}
            </div>
            <div className="text-[14px] leading-[21px] text-[#c1c1c1]">{step}</div>
          </div>
          {index < howItWorksSteps.length - 1 ? (
            <div className="hidden h-px w-12 bg-[linear-gradient(90deg,#794BC5_0%,#3D44FF_100%)] md:block" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ExploreAdsCard({ href, size = 'default' }: { href: string; size?: 'default' | 'small' }) {
  const isSmall = size === 'small';

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[6px] bg-[linear-gradient(90deg,#FFBCA7_2.21%,#DAA3D8_30.93%,#B587FF_67.95%,#6B7AFF_103.3%)] p-px transition hover:scale-[1.02] hover:shadow-[0_20px_36px_rgba(0,0,0,0.24)]"
    >
        <span className="block rounded-[6px] border border-dashed border-[#1a1a1b]">
          <span className={cn('block rounded-[5px] bg-[#1a1a1b]', isSmall ? 'px-3 py-3' : 'px-3 py-6')}>
            <span className="flex flex-col items-center justify-center text-center">
            <span className="text-[12px] text-[#A0A0A0]">GitHub data is not your focus?</span>
            <span
              className={cn(
                'mt-2 inline-flex items-center rounded-[48px] bg-[linear-gradient(90deg,#5667FF_0%,#A168FF_106.06%)] font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]',
                isSmall ? 'px-3 py-2 text-[14px]' : 'px-3 py-3 text-[16px]',
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full bg-white text-[#5667FF]',
                  isSmall ? 'mr-2 h-6 w-6 min-w-6' : 'mr-4 h-8 w-8 min-w-8',
                )}
              >
                <img
                  src="/img/explore/upload.svg"
                  alt=""
                  className={cn(isSmall ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]')}
                />
              </span>
              Import any dataset
            </span>
            <Image
              src="/img/explore/ads-prompts.png"
              alt="image"
              width={228}
              height={141}
              sizes="228px"
              className={cn('mt-4 h-auto max-w-full', isSmall ? 'w-full max-w-[205px]' : 'w-full max-w-[228px]')}
            />
            <span className={cn('mt-3 inline-flex items-center text-white', isSmall ? 'text-[12px]' : 'text-[14px]')}>
              <span>Chat2Query on</span>
              <img src="/img/tidb-cloud-logo-o.png" alt="TiDB Cloud Logo" className="mx-2 h-[18px] w-auto" />
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}

function ExploreOurDataCard() {
  return (
    <div className="rounded-[6px] bg-[linear-gradient(90deg,rgba(255,188,167,0.5)_2.21%,rgba(218,163,216,0.5)_30.93%,rgba(181,135,255,0.5)_67.95%,rgba(107,122,255,0.5)_103.3%)] p-px">
      <div className="rounded-[6px] border border-dashed border-[#1a1a1b]">
        <div className="flex h-full flex-col items-center justify-center rounded-[5px] bg-[#1a1a1b] px-3 py-6 text-center">
          <div className="bg-[linear-gradient(90deg,#FFBCA7_2.21%,#DAA3D8_30.93%,#B587FF_67.95%,#6B7AFF_103.3%)] bg-clip-text text-[32px] font-semibold leading-[1.5] text-transparent">
            Our data source
          </div>
          <img src="/img/explore/ads-1.svg" alt="" className="mt-3 max-w-[90%]" />
          <div className="mt-3 text-[16px] font-medium leading-[1.8] text-white">
            <img src="/img/explore-logo-layer-0.png" alt="Explore" className="mx-2 inline h-6 w-auto align-text-bottom" />
            GitHub Data Explorer for
            <img src="/img/logo-small.png" alt="OSS Insight" className="mx-2 inline h-6 w-auto align-text-bottom" />
            Open Source Software Insight
          </div>
        </div>
      </div>
    </div>
  );
}

function ExploreBottomAdsSection() {
  return (
    <section className="mt-4">
      <div className="overflow-hidden text-center text-[14px] text-[#b7b7b9]">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#353536]" />
          <span>Get to know our data inside and out</span>
          <div className="h-px flex-1 bg-[#353536]" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ExploreOurDataCard />
        <a
          href="https://tidbcloud.com/channel?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301&utm_content=result_bottom"
          target="_blank"
          rel="noreferrer"
          className="block rounded-[6px] bg-[linear-gradient(90deg,#FFBCA7_2.21%,#DAA3D8_30.93%,#B587FF_67.95%,#6B7AFF_103.3%)] p-px transition hover:scale-[1.02] hover:shadow-[0_20px_36px_rgba(0,0,0,0.24)]"
        >
          <span className="block h-full rounded-[6px] border border-dashed border-[#1a1a1b]">
            <span className="flex h-full flex-col items-center rounded-[5px] bg-[#1a1a1b] px-3 py-6 text-center">
              <span className="text-[32px] font-semibold leading-[1.5] text-white">Try other dataset</span>
              <span className="mt-2 inline-flex items-center rounded-[48px] bg-[linear-gradient(90deg,#5667FF_0%,#A168FF_106.06%)] px-3 py-3 text-[24px] font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
                <span className="mr-8 inline-flex h-[42px] w-[42px] min-w-[42px] items-center justify-center rounded-full bg-white text-[#5667FF]">
                  <img src="/img/explore/upload.svg" alt="" className="h-[18px] w-[18px]" />
                </span>
                Import NOW!
              </span>
              <Image
                src="/img/explore/ads-2.png"
                alt="Try other dataset"
                width={304}
                height={186}
                sizes="304px"
                className="mt-4 h-auto w-full max-w-[304px]"
              />
              <span className="mt-3 inline-flex items-center text-[16px] font-medium leading-[1.8] text-white">
                <span>Chat2Query on</span>
                <img src="/img/tidb-cloud-logo-o.png" alt="TiDB Cloud Logo" className="mx-2 h-6 w-auto" />
              </span>
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}

function ExploreFaqSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section className="mx-auto mt-16 max-w-[960px] px-6 py-8">
      <h2 className="text-center text-[28px] font-semibold text-[#e3e3e3]">FAQ</h2>

      <div className="mt-16 space-y-12">
        <div>
          <h3 className="text-[16px] font-semibold leading-6 text-[#e3e3e3]">How it works</h3>
          <ExploreStepsRow />
        </div>
        <div className="w-full">
          {faqEntries.map((entry) => {
            const isOpen = openItem === entry.title;

            return (
              <div key={entry.title} className="border-b border-[#2a2a2c]">
                <button
                  type="button"
                  onClick={() => setOpenItem(isOpen ? null : entry.title)}
                  className="flex w-full items-start justify-between gap-4 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[16px] font-semibold leading-6 text-[#e3e3e3]">{entry.title}</span>
                  <ChevronDown
                    className={cn(
                      'mt-1 size-4 shrink-0 text-[#8c8c8c] transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                {isOpen ? (
                  <div className="pb-4 text-[14px] leading-[21px] text-[#c1c1c1]">
                    {entry.body}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-8 text-center text-[16px] text-[#929292]">
        Still having trouble? Contact us, we&apos;re happy to help!{' '}
        <a className="site-link" href="https://github.com/pingcap/ossinsight/issues" target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        {' · '}
        <a className="site-link" href="https://twitter.com/OSSInsight" target="_blank" rel="noreferrer">
          Twitter
        </a>
      </p>
    </section>
  );
}

function FooterPromoCard({
  title,
  kind,
  href,
  icon,
}: {
  title: string;
  kind: string;
  href: string;
  icon: string;
}) {
  return (
    <div className="rounded-[4px] bg-[#2c2c2c] p-8">
      <div className="flex items-center justify-center py-4">
        <Image src={icon} alt="" width={54} height={54} className="h-[54px] w-[54px]" />
      </div>
      <h3 className="min-h-[56px] text-[24px] font-bold leading-[1.2] text-[#e3e3e3]">{title}</h3>
      <p className="mt-4 min-h-[48px] text-[16px] text-[#929292]">{kind}</p>
      <Link
        className="mt-6 inline-flex items-center rounded-[999px] border border-[#5a5a5b] px-4 py-2 text-[14px] text-[#e3e3e3] transition hover:bg-white/[0.04]"
        href={href}
      >
        read more
      </Link>
    </div>
  );
}

export function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { docs } = getSiteAppOrigins();
  const [input, setInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [answer, setAnswer] = useState<ExplorerAnswer | null>(null);
  const [stagedAnswer, setStagedAnswer] = useState<ExplorerPreview | null>(null);
  const [executionPhase, setExecutionPhase] = useState<ExplorerExecutionPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoExecutedRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const tagsQuery = useQuery({
    queryKey: ['explorer', 'tags'],
    queryFn: () => fetchJson<Tag[]>(`${INTERNAL_API_SERVER}/explorer/tags`),
    staleTime: 10 * 60 * 1000,
  });

  const recommendQuestionsQuery = useQuery({
    queryKey: ['explorer', 'questions', 'recommend', 100],
    queryFn: () =>
      fetchJson<RecommendQuestion[]>(
        `${INTERNAL_API_SERVER}/explorer/questions/recommend?n=100`,
      ),
    staleTime: 10 * 60 * 1000,
  });

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        return await streamExplorerAnswer(question, controller.signal, {
          onPhase: (phase) => {
            setExecutionPhase(phase);
          },
          onPreview: (preview) => {
            setStagedAnswer((current) => ({
              question: preview.question || current?.question || question,
              revisedQuestion: preview.revisedQuestion ?? current?.revisedQuestion,
              keywords: preview.keywords ?? current?.keywords,
              subQuestions: preview.subQuestions ?? current?.subQuestions,
              combinedQuestion: preview.combinedQuestion ?? current?.combinedQuestion,
              assumptions: preview.assumptions ?? current?.assumptions,
              summary: preview.summary ?? current?.summary,
              sql: preview.sql ?? current?.sql,
            }));
          },
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    onMutate: () => {
      setErrorMessage(null);
      setAnswer(null);
      setStagedAnswer(null);
      setExecutionPhase('generating');
    },
    onSuccess: (nextAnswer) => {
      setErrorMessage(null);
      setAnswer(nextAnswer);
      setStagedAnswer(nextAnswer);
      setExecutionPhase('result');
    },
    onError: (error) => {
      setStagedAnswer(null);
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setExecutionPhase('idle');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to run Data Explorer.');
    },
  });

  const recommendQuestions = useMemo(() => {
    const all = recommendQuestionsQuery.data ?? [];
    const seen = new Set<string>();

    return all.filter((question) => {
      const key = getRecommendQuestionIdentity(question);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [recommendQuestionsQuery.data]);

  const filteredQuestions = useMemo(() => {
    if (selectedTag == null) {
      return recommendQuestions;
    }

    return recommendQuestions.filter((question) =>
      question.tags.some((tag) => tag.id === selectedTag),
    );
  }, [recommendQuestions, selectedTag]);

  const MAX_QUESTION_LENGTH = 200;

  const executeQuestion = useCallback(
    (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question) {
        return;
      }
      if (question.length > MAX_QUESTION_LENGTH) {
        setErrorMessage(`Question is too long (${question.length} characters). Please keep it under ${MAX_QUESTION_LENGTH} characters.`);
        setExecutionPhase('idle');
        return;
      }

      autoExecutedRef.current = question;
      setInput(question);
      startTransition(() => {
        router.replace(`/explore?q=${encodeURIComponent(question)}`, { scroll: false });
      });
      askMutation.mutate(question);
    },
    [askMutation, router],
  );

  const handlePromptSubmit = useCallback(
    (question: string) => {
      executeQuestion(question);
    },
    [executeQuestion],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setExecutionPhase('idle');
    setStagedAnswer(null);
  }, []);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    askMutation.reset();
    setAnswer(null);
    setStagedAnswer(null);
    setExecutionPhase('idle');
    setErrorMessage(null);
    setInput('');
    autoExecutedRef.current = null;
    startTransition(() => {
      router.replace('/explore', { scroll: false });
    });
  }, [askMutation, router]);

  useEffect(() => {
    const questionFromUrl = searchParams.get('q')?.trim();
    if (!questionFromUrl) {
      return;
    }

    setInput(questionFromUrl);
    if (autoExecutedRef.current === questionFromUrl) {
      return;
    }

    autoExecutedRef.current = questionFromUrl;
    askMutation.mutate(questionFromUrl);
  }, [askMutation, searchParams]);

  const isLoading = askMutation.isPending;
  const hasExecutionState = Boolean(searchParams.get('q')?.trim()) || isLoading || answer != null || stagedAnswer != null || errorMessage != null;

  return (
    <div className="relative overflow-hidden bg-[#1a1a1b] pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[41px] top-[81px] h-[696px] w-[696px] bg-no-repeat opacity-90"
          style={{
            backgroundImage: "url('/img/ellipse-2.svg')",
            backgroundSize: '696px 696px',
          }}
        />
        <div
          className="absolute right-0 top-[241px] h-[1072px] w-[961px] bg-no-repeat opacity-90"
          style={{
            backgroundImage: "url('/img/ellipse-2.svg')",
            backgroundSize: '961px 1072px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[720px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(26,26,27,0))]" />
      </div>

      <div className="relative z-[1]">
      {!hasExecutionState ? (
        <ExploreHero
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSubmit={handlePromptSubmit}
          onStop={handleStop}
          compact={false}
        />
      ) : (
        <ExploreExecutionLayout
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSubmit={handlePromptSubmit}
          onStop={handleStop}
          errorMessage={errorMessage}
          answer={answer}
          stagedAnswer={stagedAnswer}
          phase={executionPhase}
          sideQuestions={recommendQuestions}
          onSelectQuestion={executeQuestion}
          onReloadQuestions={() => {
            void recommendQuestionsQuery.refetch();
          }}
          isReloadingQuestions={recommendQuestionsQuery.isFetching}
          areQuestionsLoading={recommendQuestionsQuery.isLoading}
        />
      )}

      {!hasExecutionState ? (
        <ExplorePopularSection
          tags={tagsQuery.data ?? []}
          questions={filteredQuestions}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onSelectQuestion={executeQuestion}
          areQuestionsLoading={recommendQuestionsQuery.isLoading}
          areTagsLoading={tagsQuery.isLoading}
        />
      ) : null}

      <ExploreFaqSection />

      <section className="mx-auto mt-16 max-w-[1536px] px-6">
        <h2 className="text-center text-[36px] font-semibold leading-tight text-[#e3e3e3]">Wonder how OSS Insight works?</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3 xl:gap-8">
          {footerCards.map((card) => (
            <FooterPromoCard
              key={card.title}
              title={card.title}
              kind={card.kind}
              href={`${docs}${card.href}`}
              icon={card.icon}
            />
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
