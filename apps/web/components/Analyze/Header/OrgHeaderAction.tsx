'use client';
import * as React from 'react';
import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  RemoteRepoInfo,
  HLGHOrgRepoSelector,
} from '@/components/ui/components/GHRepoSelector';
import { CalendarIcon } from '@primer/octicons-react';
import { twMerge } from 'tailwind-merge';

import {
  AnalyzeOwnerContext,
} from '@/components/Context/Analyze/AnalyzeOwner';
import {
  HLSelect,
  SelectParamOption,
} from '@/components/ui/components/Selector/Select';
import { OrgTitleIconEle } from '@/components/Analyze/Header/OrgHeader';

const options = [
  { key: 'past_7_days', title: 'Past 7 days' },
  { key: 'past_28_days', title: 'Past 28 days' },
  { key: 'past_90_days', title: 'Past 90 days' },
  { key: 'past_12_months', title: 'Past 12 months' },
];

export default function OrgAnalyzePageHeaderAction() {
  const searchParams = useSearchParams();

  const [loadingRepoFromUrl, setLoadingRepoFromUrl] =
    React.useState<boolean>(true);
  const [currentRepoIds, setCurrentRepoIds] = React.useState<number[]>(stringArray2NumberArray(searchParams.getAll('repoIds')) || []);
  const [currentPeriod, setCurrentPeriod] = React.useState<string>(searchParams.get('period') || options[1].key);

  const { name: orgName, id: orgId, login } =
    React.useContext(AnalyzeOwnerContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    setCurrentRepoIds(
      stringArray2NumberArray(searchParams.getAll('repoIds')) || []
    );
    setCurrentPeriod(searchParams.get('period') || options[1].key);
  }, [searchParams]);

  const handlePeriodChange = (v: SelectParamOption<string>) => {
    setCurrentPeriod(v.key);
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    const urlPeriod = currentParams.get('period') || options[1].key;
    if (urlPeriod !== v.key) {
      currentParams.set('period', v.key);
      const hash = (typeof window !== 'undefined' && window.location.hash) || '';
      startTransition(() => {
        router.push(pathname + '?' + currentParams.toString() + hash);
      });
    }
  };

  // load repo from url
  React.useEffect(() => {
    const handler = async () => {
      if (!currentRepoIds) {
        setLoadingRepoFromUrl(false);
        return;
      }
      setLoadingRepoFromUrl(false);
    };
    handler();
  }, [currentRepoIds, orgId, orgName]);

  const handleApplyRepoIdsChanges = (input: RemoteRepoInfo[]) => {
    // get param from url
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    // update repoId
    const selectedRepoIds = input.map((r) => r.id);
    if (!isArrayItemsEqual(currentRepoIds, selectedRepoIds)) {
      currentParams.delete('repoIds');
      selectedRepoIds.forEach((id) => currentParams.append('repoIds', `${id}`));

      const hash = (typeof window !== 'undefined' && window.location.hash) || '';
      startTransition(() => {
        router.push(pathname + '?' + currentParams.toString() + hash);
      });
    }
  };

  React.useEffect(() => {
    const HEADER_HEIGHT = 60;
    let rafId: number | null = null;

    const scroll = function () {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const title = document.getElementById('action-bar-title');
        const divider = document.getElementById('title-divider');

        if (divider && isElementScrolltoInvisible(divider, HEADER_HEIGHT)) {
          title?.classList.remove('h-8', 'visible', 'opacity-100');
          title?.classList.add('h-0', 'invisible', 'opacity-0');
        } else {
          title?.classList.remove('h-0', 'invisible', 'opacity-0');
          title?.classList.add('h-8', 'visible', 'opacity-100');
        }
      });
    };

    scroll();
    window.addEventListener('scroll', scroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', scroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* -- action bar -- */}
      <div className='sticky top-[var(--site-header-height)] flex flex-col gap-2 py-4 bg-[var(--background-color-body)] z-10 will-change-transform'>
        {/* -- small title -- */}
        <div
          className={twMerge(
            'transition-[opacity,height,visibility] ease-in-out duration-300',
            'invisible h-0 opacity-0'
          )}
          id='action-bar-title'
        >
          <OrgTitleIconEle
            id={orgId}
            name={orgName}
            wrapperClassName='text-xl'
            iconSize={20}
            login={login}
          />
        </div>
        {/* -- seletors -- */}
        <div className='flex gap-x-6 gap-y-2 flex-wrap flex-col md:flex-row md:items-end'>
          {currentPeriod && (
            <div className='relative z-10'>
            <HLSelect
              options={options}
              value={options.find((i) => i.key === currentPeriod) || options[1]}
              onChange={handlePeriodChange}
              startIcon={<CalendarIcon />}
            /></div>
          )}
          <div className='relative z-9'>
            {orgId && (
              <HLGHOrgRepoSelector
                disabled={loadingRepoFromUrl}
                ownerId={orgId}
                defaultSelectedIds={currentRepoIds}
                onComplete={(input) => {
                  const inputRepos = input.map((r) => ({
                    id: r.id,
                    fullName: r.fullName,
                    defaultBranch: '',
                  }));
                  handleApplyRepoIdsChanges(inputRepos);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function renderInput(props: any) {
  return <input className='TextInput' {...props} type={undefined} />;
}

function isArrayItemsEqual(a: any[], b: any[]) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((item) => b.includes(item));
}

function stringArray2NumberArray(arr: (string | number)[]) {
  return arr.reduce((acc: number[], cur: string | number) => {
    try {
      const num = Number(cur);
      if (isNaN(num)) {
        throw new Error('NaN');
      }
      acc.push(num);
    } catch (e) {
      // NaN parse error – skip value
    }
    return acc;
  }, []);
}

function isElementScrolltoInvisible(element: HTMLElement, topOffset?: number) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const isElementInViewport = rect.top >= 0 + (topOffset ?? 0);

  return isElementInViewport;
}
