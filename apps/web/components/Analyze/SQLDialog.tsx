'use client';

import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { INTERNAL_QUERY_API_SERVER } from '@/utils/api';

// --- Lightweight MySQL syntax highlighter ---

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'ON', 'AS', 'IS', 'NULL',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'FULL', 'NATURAL',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP',
  'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'IF', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'DEFAULT', 'AUTO_INCREMENT', 'UNIQUE', 'CHECK', 'CONSTRAINT',
  'BETWEEN', 'LIKE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'WINDOW', 'ROWS', 'RANGE',
  'TRUE', 'FALSE', 'EXPLAIN', 'ANALYZE', 'USING', 'FORCE', 'IGNORE',
  'EXCEPT', 'INTERSECT', 'ROLLUP', 'CUBE', 'GROUPING', 'SETS',
  'ANY', 'SOME', 'EACH', 'ROW', 'LATERAL', 'CROSS', 'APPLY',
]);

const SQL_FUNCTIONS = new Set([
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'IFNULL', 'NULLIF',
  'CONCAT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER', 'LENGTH', 'REPLACE',
  'DATE', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'NOW',
  'DATE_FORMAT', 'DATE_ADD', 'DATE_SUB', 'DATEDIFF', 'TIMESTAMPDIFF',
  'CAST', 'CONVERT', 'IF', 'GREATEST', 'LEAST', 'ROUND', 'FLOOR', 'CEIL',
  'ABS', 'MOD', 'POWER', 'SQRT', 'LOG', 'EXP', 'RAND',
  'GROUP_CONCAT', 'JSON_EXTRACT', 'JSON_UNQUOTE', 'ROW_NUMBER', 'RANK',
  'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE',
  'PERCENT_RANK', 'CUME_DIST', 'NTILE',
]);

type TokenType = 'keyword' | 'function' | 'string' | 'number' | 'comment' | 'operator' | 'param' | 'text';

interface Token {
  type: TokenType;
  value: string;
}

function tokenizeSQL(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < sql.length) {
    // Single-line comment
    if (sql[i] === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i);
      const value = end === -1 ? sql.slice(i) : sql.slice(i, end);
      tokens.push({ type: 'comment', value });
      i += value.length;
      continue;
    }

    // Multi-line comment
    if (sql[i] === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      const value = end === -1 ? sql.slice(i) : sql.slice(i, end + 2);
      tokens.push({ type: 'comment', value });
      i += value.length;
      continue;
    }

    // String (single or double quote)
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      let j = i + 1;
      while (j < sql.length && sql[j] !== quote) {
        if (sql[j] === '\\') j++;
        j++;
      }
      const value = sql.slice(i, j + 1);
      tokens.push({ type: 'string', value });
      i = j + 1;
      continue;
    }

    // Backtick identifier - treat as text
    if (sql[i] === '`') {
      let j = i + 1;
      while (j < sql.length && sql[j] !== '`') j++;
      tokens.push({ type: 'text', value: sql.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Numbers
    if (/\d/.test(sql[i]) && (i === 0 || /[\s,(=<>!+\-*/]/.test(sql[i - 1]))) {
      let j = i;
      while (j < sql.length && /[\d.]/.test(sql[j])) j++;
      tokens.push({ type: 'number', value: sql.slice(i, j) });
      i = j;
      continue;
    }

    // Parameter placeholder (e.g. ?)
    if (sql[i] === '?') {
      tokens.push({ type: 'param', value: '?' });
      i++;
      continue;
    }

    // Operators
    if (/[=<>!+\-*/%&|^~]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[=<>!]/.test(sql[j])) j++;
      if (j === i) j++;
      tokens.push({ type: 'operator', value: sql.slice(i, j) });
      i = j;
      continue;
    }

    // Words (keywords, functions, identifiers)
    if (/[a-zA-Z_@]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[a-zA-Z0-9_@.]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();
      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (SQL_FUNCTIONS.has(upper)) {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      i = j;
      continue;
    }

    // Whitespace and other chars
    let j = i;
    while (j < sql.length && !/[a-zA-Z0-9_@`'"=<>!+\-*/%&|^~?]/.test(sql[j]) && !(sql[j] === '/' && sql[j + 1] === '*') && !(sql[j] === '-' && sql[j + 1] === '-')) {
      j++;
    }
    if (j === i) j++;
    tokens.push({ type: 'text', value: sql.slice(i, j) });
    i = j;
  }

  return tokens;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: '#c678dd',   // purple
  function: '#61afef',  // blue
  string: '#98c379',    // green
  number: '#d19a66',    // orange
  comment: '#5c6370',   // gray
  operator: '#56b6c2',  // cyan
  param: '#e5c07b',     // yellow
  text: '#abb2bf',      // light gray
};

function HighlightedSQL({ sql }: { sql: string }) {
  const tokens = useMemo(() => tokenizeSQL(sql), [sql]);

  return (
    <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap m-0 p-0">
      {tokens.map((token, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
          {token.value}
        </span>
      ))}
    </pre>
  );
}

// --- Keyword replacements ---

const KEYWORD_REPLACEMENTS: [RegExp, string][] = [
  [/\bcop\b/gi, 'distributed'], [/\bbatchCop\b/gi, 'distributed'],
  [/\btikv\b/gi, 'row'], [/\btiflash\b/gi, 'column'],
];

function replaceKeywords(text: string): string {
  let result = text;
  for (const [re, replacement] of KEYWORD_REPLACEMENTS) result = result.replace(re, replacement);
  return result;
}

// --- SQL Dialog ---

export default function SQLDialog({ sql, queryName, queryParams, explainUrl, open, onClose }: {
  sql: string; queryName?: string; queryParams?: Record<string, any>; explainUrl?: string;
  open: boolean; onClose: () => void;
}) {
  const [tab, setTab] = useState<'sql' | 'explain'>('sql');
  const fallbackExplainUrl = useMemo(() => {
    if (!queryName) {
      return null;
    }

    const usp = new URLSearchParams();
    if (queryParams) {
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v != null) {
          if (Array.isArray(v)) {
            v.forEach(x => usp.append(k, String(x)));
          } else {
            usp.set(k, String(v));
          }
        }
      });
    }

    return `${INTERNAL_QUERY_API_SERVER}/explain/${queryName}?${usp}`;
  }, [queryName, queryParams]);

  const resolvedExplainUrl = explainUrl ?? fallbackExplainUrl;
  const explainQuery = useQuery({
    queryKey: ['show-sql', 'explain', resolvedExplainUrl ?? null],
    queryFn: async ({ signal }) => {
      const response = await fetch(resolvedExplainUrl!, { signal });
      const data = await response.json();
      return {
        fields: (data.fields ?? []).map((field: any) => field.name),
        rows: data.data ?? [],
      } as { fields: string[]; rows: Record<string, any>[] };
    },
    enabled: open && tab === 'explain' && Boolean(resolvedExplainUrl),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => { if (!open) { setTab('sql'); } }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,12,18,0.56)]" onClick={onClose}>
      <div
        className="bg-[#212122] rounded-sm max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col border border-[#3a3a3a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2c]">
          <div className="flex gap-1">
            <button
              onClick={() => setTab('sql')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'sql'
                  ? 'text-white bg-white/10'
                  : 'text-[#7c7c7c] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              SQL
            </button>
            {(queryName || explainUrl) && (
              <button
                onClick={() => setTab('explain')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tab === 'explain'
                    ? 'text-white bg-white/10'
                    : 'text-[#7c7c7c] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                EXPLAIN
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#7c7c7c] hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-auto flex-1">
          {tab === 'sql' && (
            <div className="bg-[#1a1a1b] rounded-sm p-4 border border-[#2a2a2c]">
              <HighlightedSQL sql={sql} />
            </div>
          )}
          {tab === 'explain' && (
            <>
              {explainQuery.isPending && !explainQuery.data && <div className="text-[#7c7c7c] text-sm py-8 text-center">Loading execution plan...</div>}
              {explainQuery.error && <div className="text-red-400 text-sm py-8 text-center">{(explainQuery.error as Error).message || 'Failed to load explain data'}</div>}
              {explainQuery.data && (
                <div className="overflow-auto rounded-lg border border-[#2a2a2c]">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="bg-[#1a1a1b]">
                        {explainQuery.data.fields.map(f => (
                          <th key={f} className="px-3 py-2.5 text-left text-[#7c7c7c] font-semibold whitespace-nowrap border-b border-[#2a2a2c]">{f}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {explainQuery.data.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.04] transition-colors">
                          {explainQuery.data.fields.map(f => (
                            <td key={f} className="px-3 py-2 text-[#d8d8d8] whitespace-pre-wrap border-b border-[#2a2a2c] max-w-[400px] break-all">
                              {replaceKeywords(String(row[f] ?? ''))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
