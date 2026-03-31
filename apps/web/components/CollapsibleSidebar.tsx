'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface CollapsibleSidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const CollapsibleSidebarContext = createContext<CollapsibleSidebarContextValue>({
  collapsed: false,
  toggle: () => {},
});

export function useCollapsibleSidebar() {
  return useContext(CollapsibleSidebarContext);
}

interface CollapsibleSidebarProps {
  children: ReactNode;
  /** Expanded width in pixels */
  width?: number;
  /** Collapsed width in pixels */
  collapsedWidth?: number;
  className?: string;
  defaultCollapsed?: boolean;
}

export function CollapsibleSidebar({
  children,
  width = 240,
  collapsedWidth = 30,
  className,
  defaultCollapsed = false,
}: CollapsibleSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const toggle = useCallback(() => setCollapsed(prev => !prev), []);
  const contextValue = useMemo(() => ({ collapsed, toggle }), [collapsed, toggle]);

  return (
    <CollapsibleSidebarContext.Provider value={contextValue}>
      <aside
        className={cn(
          'sticky top-[var(--site-header-height)] hidden h-[calc(100vh-var(--site-header-height))] shrink-0 overflow-hidden border-r border-[#2f3032] bg-[#242526] md:block',
          className,
        )}
        style={{ width: collapsed ? collapsedWidth : width }}
      >
        {collapsed ? (
          <div className="flex h-full flex-col">
            <div className="flex-1" />
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center justify-center border-t border-[#2f3032] py-3 text-[#7c7c7c] transition hover:bg-white/5 hover:text-white"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto styled-scrollbar">
              {children}
            </div>
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center justify-center border-t border-[#2f3032] py-3 text-[#7c7c7c] transition hover:bg-white/5 hover:text-white"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </CollapsibleSidebarContext.Provider>
  );
}
