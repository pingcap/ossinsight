'use client';

import { useEffect, useState } from 'react';

interface StickyRepoHeaderProps {
  repoName: string;
}

export function StickyRepoHeader({ repoName }: StickyRepoHeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const titleEl = document.getElementById('overview-main');
      if (!titleEl) return;
      const rect = titleEl.getBoundingClientRect();
      setVisible(rect.bottom < 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`sticky top-[var(--site-header-height)] z-20 bg-[#1a1a1a]/95 backdrop-blur border-b border-[#2f3032] transition-all duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-2.5 px-6 py-2 md:px-8">
        <img
          width={24}
          height={24}
          src={`https://github.com/${repoName.split('/')[0]}.png`}
          alt={repoName}
          className="rounded-[3px]"
        />
        <a
          href={`https://github.com/${repoName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-medium text-[#e9eaee] hover:text-[#fbe593] transition-colors"
        >
          {repoName}
        </a>
      </div>
    </div>
  );
}
