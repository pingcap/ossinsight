'use client';

import React, { useMemo, useState } from 'react';
import { useAnalyzeContext } from '@/components/Analyze/context';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useRemoteData } from '@/utils/useRemoteData';
import { HLSelect, type SelectParamOption } from '@/components/ui/components/Selector/Select';
import { ShowSQLInline } from '@/components/Analyze/ShowSQL';

// --- Types ---

type ChangedEvents = {
  last_month_events: number;
  last_2nd_month_events: number;
  changes: number;
};

type Result = {
  actor_id: number;
  actor_login: string;
  proportion: number;
  row_num: number;
  is_new_contributor?: 0 | 1;
};

type ContributorItem = Result & ChangedEvents;

// --- Descriptors ---

const descriptors: SelectParamOption<string>[] = [
  { key: 'analyze-people-activities-contribution-rank', title: 'All Activities' },
  { key: 'analyze-people-code-contribution-rank', title: 'Push and Commits' },
  { key: 'analyze-people-code-pr-contribution-rank', title: 'PR Contribution' },
  { key: 'analyze-people-issue-contribution-rank', title: 'Issue Open' },
  { key: 'analyze-people-issue-comment-contribution-rank', title: 'Issue Comment' },
  { key: 'analyze-people-issue-close-contribution-rank', title: 'Issue Close' },
  { key: 'analyze-people-code-review-comments-contribution-rank', title: 'Code Review Comments' },
  { key: 'analyze-people-code-review-prs-contribution-rank', title: 'Code Review PRs' },
  { key: 'analyze-people-code-review-submits-contribution-rank', title: 'Code Review Submits' },
];

function useLastMonth(): string {
  return useMemo(() => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${last.getFullYear()}/${String(last.getMonth() + 1).padStart(2, '0')}`;
  }, []);
}

// --- Section ---

export function ContributorsSection() {
  const { repoId } = useAnalyzeContext();
  const lastMonth = useLastMonth();
  const [descriptor, setDescriptor] = useState(descriptors[0]);
  const [showPercentage, setShowPercentage] = useState(false);
  const [excludeBots, setExcludeBots] = useState(true);

  const params = useMemo(
    () => (repoId != null ? { repoId, excludeBots } : undefined),
    [repoId, excludeBots],
  );

  const { data, loading } = useRemoteData<ContributorItem>(descriptor.key, params, repoId != null);
  const list = data?.data ?? [];

  const maxEvents = list.length > 0 ? list[0].last_month_events : 1;

  return (
    <ScrollspySectionWrapper anchor="contributors" className="pt-8 pb-8">
      <div className="flex items-center justify-between gap-4 pb-3">
        <SectionHeading className="pb-0">Contributor Rankings - {lastMonth}</SectionHeading>
        {data?.sql && <ShowSQLInline sql={data.sql} queryName={descriptor.key} />}
      </div>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Check the activity of contributors in the repository last month, including push and commit
        events, issue open/close/comment events, code review comments/PRs/submits.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <HLSelect<string>
          value={descriptor}
          onChange={setDescriptor}
          options={descriptors}
        />

        <div className="flex-1" />

        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeBots}
            onChange={(e) => setExcludeBots(e.target.checked)}
            className="rounded"
          />
          Exclude Bots
        </label>

        <div className="flex rounded overflow-hidden border border-gray-600">
          <button
            className={`px-3 py-1 text-sm ${!showPercentage ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setShowPercentage(false)}
          >
            # Total Events
          </button>
          <button
            className={`px-3 py-1 text-sm ${showPercentage ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setShowPercentage(true)}
          >
            % Percentage
          </button>
        </div>
      </div>

      {/* List */}
      <div className="relative min-h-[40vh] max-h-[80vh] overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-1">
          {list.map((item) => (
            <div key={item.actor_login} className="flex items-center gap-2 py-1">
              {/* Avatar */}
              <a
                href={`https://github.com/${item.actor_login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <img
                  src={`https://github.com/${item.actor_login}.png`}
                  alt={item.actor_login}
                  className="w-8 h-8 rounded-full"
                />
              </a>

              {/* Name */}
              <div className="w-16 text-xs truncate shrink-0">
                {item.actor_login}
                {item.is_new_contributor === 1 && (
                  <span className="ml-1 text-[10px] bg-blue-600 rounded px-1 text-white">new</span>
                )}
              </div>

              {/* Bar */}
              <div className="flex-1 h-7">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${(item.last_month_events / maxEvents) * 100}%`,
                    minWidth: 1,
                    background: 'linear-gradient(136deg, rgba(255,177,98,1) 0%, rgba(247,124,0,1) 100%)',
                  }}
                />
              </div>

              {/* Value */}
              <div className="w-28 text-sm text-right shrink-0">
                {showPercentage
                  ? `${item.proportion === 1 ? '100' : (item.proportion * 100).toPrecision(2)}%`
                  : (
                    <>
                      {item.last_month_events}
                      <span className={`ml-1 text-xs ${item.changes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ({item.changes >= 0 ? `+${item.changes}` : item.changes})
                      </span>
                    </>
                  )}
              </div>
            </div>
          ))}

          {!loading && list.length === 0 && (
            <div className="text-center text-gray-500 py-16">No data available</div>
          )}
        </div>
      </div>
    </ScrollspySectionWrapper>
  );
}
