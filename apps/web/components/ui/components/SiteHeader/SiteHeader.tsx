'use client';

import * as RuiMenubar from '@radix-ui/react-menubar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SiteHeaderConfig } from '../../types/ui-config';
import { SiteConfigIcon } from '../SiteConfigIcon';
import { MenuItem } from './MenuItem';

import { HeaderAnalyzeSelector } from '../AnalyzeSelector/HeaderAnalyzeSelector';

export interface SiteHeaderProps extends SiteHeaderConfig {
  children?: React.ReactNode;
}

const logoHeight = 44;

export function SiteHeader ({ logo, items, children }: SiteHeaderProps) {
  const [value, setValue] = useState<string>();

  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <RuiMenubar.Root asChild value={value} onValueChange={setValue}>
      <header className="SiteHeader">
        <RuiMenubar.Label asChild>
          <Link href="/">
            <SiteConfigIcon icon={logo} alt="Logo" height={logoHeight} />
          </Link>
        </RuiMenubar.Label>
        <nav className="SiteHeader-menu">
          <ul>
            {items.map((item, index) => (
              <MenuItem item={item} key={index} onValueChange={setValue} />
            ))}
          </ul>
        </nav>
        <HeaderAnalyzeSelector navigateTo={navigateTo} />
        <div className="flex-1" />
        {children}
        <a
          href="https://twitter.com/OSSInsight"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3 text-gray-400 transition-colors hover:text-white"
          aria-label="Twitter"
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </header>
    </RuiMenubar.Root>
  );
}
