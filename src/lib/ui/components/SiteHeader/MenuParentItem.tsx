import { TriangleDownIcon } from '@primer/octicons-react';
import * as RuiMenubar from '@radix-ui/react-menubar';
import ChevronDownIcon from 'bootstrap-icons/icons/chevron-down.svg';
import { useCallback, useEffect, useRef } from 'react';
import { MenuParentItemConfig } from '../../types/ui-config';
import { preventDefault } from '../../utils/event';
import { MenuLinkItem, renderBaseItem } from './MenuLinkItem';

export function MenuParentItem ({ item, onValueChange }: { item: MenuParentItemConfig, onValueChange: (value: string | undefined) => void }) {
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = useCallback(() => {
    clearTimeout(timeout.current);
    onValueChange(item.label);
  }, [onValueChange, item.label]);

  const handleMouseLeave = useCallback(() => {
    timeout.current = setTimeout(() => {
      onValueChange(undefined);
    }, 200);
  }, [onValueChange, item.label]);

  return (
    <RuiMenubar.Menu value={item.label}>
      <li>
        <RuiMenubar.Trigger className="SiteHeader-menu-trigger" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseDown={preventDefault}>
          {renderBaseItem(item)}
          <TriangleDownIcon className="SiteHeader-menu-trigger-indicator" size={22} />
        </RuiMenubar.Trigger>
        <RuiMenubar.Portal>
          <RuiMenubar.Content className="SiteHeader-menu-content z-10" sideOffset={22} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onCloseAutoFocus={preventDefault}>
            <RuiMenubar.Arrow className="SiteHeader-menu-content-arrow" />
            <ul>
              {item.items.map((subItem, index) => (
                <MenuLinkItem item={subItem} key={index} />
              ))}
            </ul>
          </RuiMenubar.Content>
        </RuiMenubar.Portal>
      </li>
    </RuiMenubar.Menu>
  );
}