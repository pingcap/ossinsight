'use client';

import * as Menubar from '@radix-ui/react-menubar';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { MouseEventHandler } from 'react';
import type {
  ConfigIconType,
  Divider,
  MenuItemConfig,
  MenuParentItemConfig,
  SiteHeaderConfig,
  Spacer,
} from './types';
import { isAbsoluteUrl, isActiveMenuItem } from './nav-link';

function renderIcon(icon: ConfigIconType | undefined, className?: string) {
  if (!icon) {
    return null;
  }

  if (typeof icon === 'function') {
    const Icon = icon;
    return <Icon className={className} />;
  }

  if (typeof icon === 'string') {
    return <img src={icon} alt="" className={className} />;
  }

  return (
    <img
      src={icon.src}
      alt={icon.alt ?? ''}
      width={icon.width}
      height={icon.height}
      className={className}
    />
  );
}

function NavLink({
  href,
  newTab,
  forceReload,
  className,
  active,
  onClick,
  children,
}: {
  href: string;
  newTab?: boolean;
  forceReload?: boolean;
  className?: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
}) {
  if (isAbsoluteUrl(href) || forceReload) {
    return (
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noreferrer noopener' : undefined}
        className={className}
        data-active={active ? 'true' : undefined}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} data-active={active ? 'true' : undefined} onClick={onClick}>
      {children}
    </Link>
  );
}

function HeaderMenuLink({ item, pathname }: { item: MenuItemConfig; pathname: string | null }) {
  const active = isActiveMenuItem(item, pathname);

  return (
    <li>
      <NavLink
        href={item.href}
        newTab={item.newTab}
        forceReload={item.forceReload}
        active={active}
        className={clsx(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-slate-300 transition-colors outline-none',
          'hover:text-[#ffe895] focus-visible:text-[#ffe895] focus-visible:ring-2 focus-visible:ring-[#ffe895]/20',
          active && 'bg-white/[0.04] text-[#ffe895]',
        )}
      >
        {renderIcon(item.icon, 'h-4 w-4 shrink-0')}
        <span className="whitespace-nowrap">{item.label}</span>
      </NavLink>
    </li>
  );
}

function HeaderMenuParent({ item }: { item: MenuParentItemConfig }) {
  return (
    <Menubar.Menu value={item.label}>
      <li>
        <Menubar.Trigger
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-slate-300 transition-colors outline-none',
            'hover:text-[#ffe895] focus-visible:text-[#ffe895] focus-visible:ring-2 focus-visible:ring-[#ffe895]/20',
          )}
        >
          {renderIcon(item.icon, 'h-4 w-4 shrink-0')}
          <span className="whitespace-nowrap">{item.label}</span>
          <ChevronDown className="h-4 w-4 opacity-70 transition-transform data-[state=open]:rotate-180" />
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            sideOffset={14}
            align="start"
            className={clsx(
              'z-50 min-w-56 rounded-md border border-white/8 bg-[var(--background-color-popover)] p-2 text-sm text-slate-200 shadow-2xl',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            )}
          >
            <ul className="space-y-1">
              {item.items.map((subItem) => (
                <li key={subItem.label}>
                  <NavLink
                    href={subItem.href}
                    newTab={subItem.newTab}
                    forceReload={subItem.forceReload}
                    className="block rounded px-3 py-2 text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    {subItem.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Menubar.Content>
        </Menubar.Portal>
      </li>
    </Menubar.Menu>
  );
}

function HeaderMenuItem({
  item,
  pathname,
}: {
  item: MenuItemConfig | MenuParentItemConfig | Spacer | Divider;
  pathname: string | null;
}) {
  if (item === 'spacer') {
    return <li className="hidden h-6 w-px bg-white/8 xl:block" />;
  }

  if (item === 'divider') {
    return <li className="hidden h-6 w-px bg-white/8 lg:block" />;
  }

  if ('items' in item) {
    return <HeaderMenuParent item={item} />;
  }

  return <HeaderMenuLink item={item} pathname={pathname} />;
}

function MobileHeaderMenu({
  items,
  pathname,
  onNavigate,
}: {
  items: Array<MenuItemConfig | MenuParentItemConfig | Spacer | Divider>;
  pathname: string | null;
  onNavigate: () => void;
}) {
  const visibleItems = items.filter(
    (item): item is MenuItemConfig | MenuParentItemConfig => item !== 'spacer' && item !== 'divider',
  );

  return (
    <Menubar.Menu value="mobile-navigation">
      <Menubar.Trigger
        aria-label="Open navigation menu"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffe895]/30 xl:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content
          align="end"
          sideOffset={12}
          className="z-50 max-h-[calc(100vh-5rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-white/8 bg-[var(--background-color-popover)] p-2 text-sm text-slate-200 shadow-2xl"
        >
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              if ('items' in item) {
                return (
                  <li key={item.label} className="pt-2 first:pt-0">
                    <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {item.label}
                    </div>
                    <ul className="space-y-1">
                      {item.items.map((subItem) => (
                        <li key={subItem.label}>
                          <NavLink
                            href={subItem.href}
                            newTab={subItem.newTab}
                            forceReload={subItem.forceReload}
                            active={isActiveMenuItem(subItem, pathname)}
                            onClick={onNavigate}
                            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-slate-300 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:bg-white/[0.05] focus-visible:text-white data-[active=true]:text-[#ffe895]"
                          >
                            {renderIcon(subItem.icon, 'h-4 w-4 shrink-0')}
                            <span>{subItem.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <NavLink
                    href={item.href}
                    newTab={item.newTab}
                    forceReload={item.forceReload}
                    active={isActiveMenuItem(item, pathname)}
                    onClick={onNavigate}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-slate-300 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:bg-white/[0.05] focus-visible:text-white data-[active=true]:text-[#ffe895]"
                  >
                    {renderIcon(item.icon, 'h-4 w-4 shrink-0')}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  );
}

export function SiteHeader({
  logo,
  homeHref = '/',
  items,
  className,
  style,
  searchSlot,
  children,
}: SiteHeaderConfig & {
  searchSlot?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [value, setValue] = useState<string>();
  const menuItems = useMemo(() => items, [items]);

  return (
    <Menubar.Root
      value={value}
      onValueChange={setValue}
      style={style}
      className={clsx(
        'sticky top-0 z-30 flex h-[60px] w-full items-center gap-3 overflow-x-auto border-b border-white/8',
        'bg-[var(--background-color-toolbar)] px-4 py-2 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.16)] md:px-5',
        className,
      )}
    >
      <NavLink href={homeHref} className="shrink-0 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-[#ffe895]/20">
        {renderIcon(logo, 'h-8 w-auto')}
      </NavLink>

      <nav className="hidden min-w-0 flex-1 xl:block">
        <ul className="flex min-w-max items-center gap-1">
          {menuItems.map((item, index) => (
            <HeaderMenuItem key={`${typeof item === 'string' ? item : item.label}-${index}`} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>

      {searchSlot && <div className="hidden shrink-0 lg:block">{searchSlot}</div>}
      <div className="flex-1 xl:hidden" />

      {children}
      <MobileHeaderMenu items={menuItems} pathname={pathname} onNavigate={() => setValue(undefined)} />
    </Menubar.Root>
  );
}
