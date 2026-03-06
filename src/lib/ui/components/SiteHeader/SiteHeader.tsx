'use client';

import * as RuiMenubar from '@radix-ui/react-menubar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SiteHeaderConfig } from '../../types/ui-config';
import { SiteConfigIcon } from '../SiteConfigIcon';
import { MenuItem } from './MenuItem';
import './style.scss';

import { HeaderAnalyzeSelector } from '../AnalyzeSelector/HeaderAnalyzeSelector';

export interface SiteHeaderProps extends SiteHeaderConfig {

}

const logoHeight = 44;

export function SiteHeader ({ logo, items }: SiteHeaderConfig) {
  const [value, setValue] = useState<string>();

  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <RuiMenubar.Root asChild value={value} onValueChange={setValue}>
      <header className="SiteHeader">
        <RuiMenubar.Label asChild>
          <Link href="https://ossinsight.io/">
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
      </header>
    </RuiMenubar.Root>
  );
}
