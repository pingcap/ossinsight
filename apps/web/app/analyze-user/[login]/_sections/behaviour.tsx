'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import * as React from 'react';
import { useMemo, useState } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import TimeDistribution from '../_charts/TimeDistribution';
import { chartColors } from '../_charts/colors';
import { usePersonalData } from '../_hooks/usePersonal';

const eventTypesWithoutAll = ['pushes', 'issues', 'issue_comments', 'pull_requests', 'reviews', 'review_comments'];
const eventTypes = ['all', ...eventTypesWithoutAll];
const periods = ['past_1_year', 'past_3_years', 'all_times'];
const timezones: number[] = [];
for (let i = -11; i <= 14; i++) timezones.push(i);

const formatZone = (z: number) => `UTC ${z < 0 ? z : `+${z}`}`;
const toCamel = (s: string) => s.replace(/(^|_)(\w)/g, (_, __, c) => ` ${c.toUpperCase()}`).trim();

export default function BehaviourSection () {
  const { id: userId } = React.useContext(AnalyzeOwnerContext);

  return (
    <ScrollspySectionWrapper anchor="behaviour" className="pt-8 pb-8">
      <SectionHeading>Behaviour</SectionHeading>
      <p className="text-sm text-[#8c8c8c] mb-4">You can see the total contributions in different repositories since 2011, as well as check the status of different contribution categories type by type.</p>
      <AllContributions userId={userId} />
      <ContributionTime userId={userId} />
    </ScrollspySectionWrapper>
  );
}

function AllContributions ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-contributions-for-repos', userId);

  const { repos, seriesList } = useMemo(() => {
    if (!data || data.length === 0) return { repos: [], seriesList: [] };

    // Get sorted repo list by total contributions
    const repoTotals = new Map<string, number>();
    for (const row of data) {
      repoTotals.set(row.repo_name, (repoTotals.get(row.repo_name) ?? 0) + row.cnt);
    }
    const repos = Array.from(repoTotals.entries()).sort((a, b) => b[1] - a[1]).map(e => e[0]);

    // Build series: one per event type, with data array matching repos order
    const grouped = new Map<string, Map<string, number>>();
    for (const row of data) {
      if (!grouped.has(row.type)) grouped.set(row.type, new Map());
      grouped.get(row.type)!.set(row.repo_name, row.cnt);
    }

    const seriesList = eventTypesWithoutAll
      .filter(et => grouped.has(et))
      .map((et, i) => ({
        type: 'bar' as const,
        name: et,
        data: repos.map(repo => grouped.get(et)?.get(repo) ?? 0),
        emphasis: { focus: 'series' as const },
        stack: '0',
        barMaxWidth: 10,
        color: chartColors[i % chartColors.length],
      }));

    return { repos, seriesList };
  }, [data]);

  if (!loading && repos.length === 0) return null;

  const option = {
    xAxis: { type: 'value' as const, minInterval: 1 },
    yAxis: { type: 'category' as const, data: repos, inverse: true, triggerEvent: true },
    grid: { top: 64, left: 8, right: 16, bottom: 8, containLabel: true },
    dataZoom: [
      { type: 'slider' as const, showDataShadow: false },
      { type: 'slider' as const, yAxisIndex: 0, showDataShadow: false, showDetail: false, maxValueSpan: 10, minValueSpan: 10, zoomLock: true, handleStyle: { opacity: 0 }, width: 8 },
    ],
    series: seriesList,
  };

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Type of total contributions" option={option} loading={loading} noData={repos.length === 0} sql={sql} queryName={queryName} queryParams={queryParams} />;
}

function ContributionTime ({ userId }: { userId: number }) {
  const [period, setPeriod] = useState('past_1_year');
  const [type, setType] = useState('all');
  const [zone, setZone] = useState(() => Math.round(-new Date().getTimezoneOffset() / 60));

  const { data } = usePersonalData('personal-contribution-time-distribution', userId, { period });
  const filteredData = useMemo(() => (data ?? []).filter(item => item.type === type), [data, type]);
  const title = `Contribution time distribution for ${type} (${formatZone(zone)})`;

  return (
    <div className="mb-4">
      <h3 className="text-[18px] font-semibold text-[#e9eaee] mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3 mb-4">
        <Select label="Period" value={period} onChange={setPeriod} options={periods.map(p => ({ value: p, label: toCamel(p) }))} />
        <Select label="Contribution Type" value={type} onChange={setType} options={eventTypes.map(e => ({ value: e, label: toCamel(e) }))} />
        <Select label="Time Zone" value={String(zone)} onChange={v => setZone(Number(v))} options={timezones.map(z => ({ value: String(z), label: formatZone(z) }))} />
      </div>
      <div className="w-fit">
        <TimeDistribution size={18} gap={4} offset={zone} data={filteredData} title={title} />
      </div>
    </div>
  );
}

function Select ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[#8c8c8c]">
      {label}
      <select value={value} onChange={e => onChange(e.target.value)} className="rounded border border-[#363638] bg-[#2e2e2f] px-2 py-1 text-sm text-[#e0e0e0] outline-none focus:border-white">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
