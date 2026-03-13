import { Divider, MenuItemConfig, MenuParentItemConfig, Spacer } from '../../types/ui-config';
import { MenuLinkItem } from './MenuLinkItem';
import { MenuParentItem } from './MenuParentItem';

export function MenuItem ({ item, onValueChange }: { item: MenuItemConfig | MenuParentItemConfig | Spacer | Divider, onValueChange: (value: string | undefined) => void; }) {
  if (item === 'divider') {
    return <li className="SiteHeader-menu-divider" />;
  } else if (item === 'spacer') {
    return <li className="SiteHeader-menu-divider" />;
  }

  if ('items' in item) {
    return (
      <MenuParentItem item={item} onValueChange={onValueChange} />
    );
  } else {
    return (
      <MenuLinkItem item={item} />
    );
  }
}
