import React, { useTransition } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabBarProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  onPrefetch?: (key: string) => void;
  className?: string;
}

export function TabBar({ items, value, onChange, onPrefetch, className = '' }: TabBarProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex gap-1 border-b border-[#3a3a3a] ${isPending ? 'opacity-70' : ''} ${className}`}>
      {items.map((item) => (
        <button
          key={item.key}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
            value === item.key
              ? 'border-b-2 border-[var(--color-primary)] text-white'
              : 'text-[#8c8c8c] hover:text-[#d8d8d8]'
          }`}
          onMouseEnter={() => onPrefetch?.(item.key)}
          onClick={() => startTransition(() => onChange(item.key))}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
