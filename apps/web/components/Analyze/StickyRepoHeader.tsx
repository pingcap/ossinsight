'use client';

import { useEffect, useState } from 'react';
import { RepoSwitcher } from '@/components/Analyze/RepoSwitcher';

interface StickyRepoHeaderProps {
  repoName: string;
  repoId: number;
}

export function StickyRepoHeader({ repoName, repoId }: StickyRepoHeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const titleEl = document.getElementById('overview-main');
        if (!titleEl) return;
        const rect = titleEl.getBoundingClientRect();
        setVisible(rect.bottom < 60);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className={`sticky top-[var(--site-header-height)] z-20 -mx-8 bg-[#1a1a1a]/95 backdrop-blur border-b border-[#2f3032] transition-[opacity,transform] duration-200 will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full h-0 overflow-hidden pointer-events-none'
      }`}
    >
      <div className="flex items-center px-6 py-1 md:px-8">
        <RepoSwitcher repoName={repoName} repoId={repoId} variant="sticky" />
      </div>
    </div>
  );
}
