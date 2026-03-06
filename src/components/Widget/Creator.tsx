'use client';

import { useWidgetShareInfo } from '@/components/Widget/hooks';
import { MockMarkdown } from '@/components/Widget/MockMarkdown';
import { QuickCode } from '@/components/Widget/QuickCode';
import { QuickSelector } from '@/components/Widget/QuickSelector';
import { filteredWidgetsNames } from '@/utils/widgets';
import { AnalyzeSelector, AnalyzeTuple } from '@/lib/ui/components/AnalyzeSelector';

import CheckCircleFillIcon from 'bootstrap-icons/icons/check-circle-fill.svg';
import { useEffect, useMemo, useRef, useState } from 'react';

const defaultTuple: AnalyzeTuple = {
  type: 'repo',
  value: { id: 41986369, fullName: 'pingcap/tidb', defaultBranch: 'master' },
};

export function WidgetCreator ({ className }: { className?: string }) {
  const [tuple, setTuple] = useState<AnalyzeTuple>(defaultTuple);
  const [widget, setWidget] = useState<string | undefined>('@ossinsight/widget-compose-recent-active-contributors');
  const lastType = useRef(tuple.type);

  const { shareInfo, params, loading, editReadmeUrl } = useWidgetShareInfo(widget, tuple);

  const widgets = useMemo(() => {
    let tag: string | undefined;
    switch (tuple.type) {
      case 'repo':
        tag = 'Repository';
        break;
      case 'user':
        tag = 'Developer';
        break;
      case 'org':
        tag = 'Organization';
        break;
    }
    return filteredWidgetsNames({ search: '', tag: tag });
  }, [tuple.type]);

  useEffect(() => {
    if (lastType.current !== tuple.type) {
      setWidget(undefined);
    }
    lastType.current = tuple.type;
  }, [tuple.type]);

  return (
    <div className={className}>
      <div className="max-w-screen-md mx-auto flex flex-col sm:items-end sm:flex-row gap-4">
        <div className="flex flex-col flex-1 gap-1">
          <label className="text-xs flex gap-1" htmlFor="analyze-selector">
            <CheckCircleFillIcon width={10} heigit={10} className="text-[#4A65C6]" />
            Input your repository/user name
          </label>
          <AnalyzeSelector id="analyze-selector" tuple={tuple} onTupleChange={setTuple} />
        </div>
        <div className="flex flex-col flex-1 gap-1 p-1 -m-1 overflow-hidden">
          <label className="text-xs flex gap-1" htmlFor="widget-selector">
            <CheckCircleFillIcon width={10} heigit={10} className="text-[#4A65C6]" />
            Select a widget type
          </label>
          <QuickSelector key={tuple.type} widgets={widgets} widget={widget} setWidget={setWidget} />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 rounded border p-4 bg-toolbar border-dimmed">
          <MockMarkdown type={tuple.type} className="skeleton-paused" shareInfo={shareInfo} loading={loading} />
        </div>
        <div className="flex-1 overflow-auto">
          {/* TODO - fix tuple.type */}
          <QuickCode type={tuple.type as any} loading={loading} shareInfo={shareInfo} editReadmeUrl={editReadmeUrl} />
        </div>
      </div>
    </div>
  );
}

