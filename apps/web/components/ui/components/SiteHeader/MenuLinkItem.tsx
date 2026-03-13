import * as RuiMenubar from '@radix-ui/react-menubar';
import Link from 'next/link';
import { MenuItemBaseConfig, MenuItemConfig } from '../../types/ui-config';
import { SiteConfigIcon } from '../SiteConfigIcon';

export function MenuLinkItem ({ item }: { item: MenuItemConfig }) {
  return (
    <li>
      <RuiMenubar.Label asChild className="SiteHeader-menu-item">
        {renderItem(item)}
      </RuiMenubar.Label>
    </li>
  );
}

export function renderItem (item: MenuItemConfig) {
  return (
    <Link href={item.href} target={isOuterUrl(item.href) ? '_blank' : undefined}>
      {renderBaseItem(item)}
    </Link>
  );
}

export function renderBaseItem (item: MenuItemBaseConfig) {
  return (
    <>
      {item.icon && <SiteConfigIcon icon={item.icon} />}
      <span>{item.label}</span>
    </>
  );
}

function isOuterUrl (url: string) {
  return /^https?:\/\//.test(url) && (url.indexOf('ossinsight.io') === -1);
}
