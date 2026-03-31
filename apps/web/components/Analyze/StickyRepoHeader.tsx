'use client';

import { useEffect, useState } from 'react';
import { GHAvatar } from '@/components/ui/components/GHAvatar';

interface StickyRepoHeaderProps {
  repoName: string;
}

export function StickyRepoHeader({ repoName }: StickyRepoHeaderProps) {
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
      className={`fixed left-0 right-0 top-[var(--site-header-height)] z-20 bg-[#1a1a1a]/95 backdrop-blur border-b border-[#2f3032] transition-[opacity,transform] duration-200 will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-2.5 px-6 py-2 md:px-8">
        <GHAvatar name={repoName} size={24} rounded={false} />
        <a
          href={`https://github.com/${repoName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-medium text-[#e9eaee] hover:text-white transition-colors"
        >
          {repoName}
        </a>
      </div>
    </div>
  );
}
