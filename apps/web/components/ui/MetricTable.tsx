'use client';

import React from 'react';

export interface MetricItem {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  vsValue?: React.ReactNode;
  isStatic?: boolean;
}

export interface MetricTableProps {
  items: MetricItem[];
  loading?: boolean;
  header?: string;
  vsHeader?: string;
}

function formatValue(value: unknown): string {
  if (value == null) {
    return '-';
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

export default function MetricTable({ items, loading, header, vsHeader }: MetricTableProps) {
  const hasVs = vsHeader != null;

  return (
    <div className="h-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#323234]">
            <th className="pb-2 text-left text-[13px] font-normal text-[#8c8c8c]" />
            <th className="pb-2 text-right text-[13px] font-medium text-[#d8d8d8]">{header}</th>
            {hasVs ? (
              <th className="pb-2 pl-4 text-right text-[13px] font-medium text-[#d8d8d8]">{vsHeader}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.label} className="border-b border-[#2a2a2c] last:border-0">
              <td className="py-3 pr-4 text-[14px] text-[#d8d8d8]">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              </td>
              <td className="py-3 text-right text-[15px] font-medium leading-none text-[#e9eaee] tabular-nums">
                {loading && !item.isStatic ? (
                  <span className="inline-block h-6 w-16 animate-pulse rounded bg-[#343436]" />
                ) : React.isValidElement(item.value) ? (
                  item.value
                ) : (
                  formatValue(item.value)
                )}
              </td>
              {hasVs ? (
                <td className="py-3 pl-4 text-right text-[15px] font-medium leading-none text-[#e9eaee] tabular-nums">
                  {loading && !item.isStatic ? (
                    <span className="inline-block h-6 w-16 animate-pulse rounded bg-[#343436]" />
                  ) : React.isValidElement(item.vsValue) ? (
                    item.vsValue
                  ) : (
                    formatValue(item.vsValue)
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
