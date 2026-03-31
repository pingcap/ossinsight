'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAnalyzeContext } from '@/components/Analyze/context';
import { SectionHeading } from '@/components/ui/SectionHeading';

type SimilarRepo = {
  repo_name: string;
  description: string | null;
  stars: number;
  language: string | null;
  shared_topics: number;
};

const LANG_COLORS: Record<string, string> = {
  Go: '#00ADD8',
  Rust: '#DEA584',
  'C++': '#F34B7D',
  Java: '#B07219',
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#C22D40',
  Shell: '#89E051',
  SQL: '#E38C00',
};

function nodeSize(stars: number) {
  return Math.max(14, Math.min(28, Math.sqrt(stars / 300)));
}

interface LayoutNode extends SimilarRepo {
  x: number;
  y: number;
  size: number;
}

const W = 800;
const H = 500;

export default function SimilarReposRadial() {
  const { repoId, repoName } = useAnalyzeContext();
  const [hovered, setHovered] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['analyze-repo-similar', repoId],
    queryFn: async () => {
      const res = await fetch(`/api/q/analyze-repo-similar?repoId=${repoId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as SimilarRepo[];
    },
    enabled: repoId != null,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { nodes, centerOwner } = useMemo(() => {
    if (!data || data.length === 0) return { nodes: [], centerOwner: '' };

    const cx = W / 2;
    const cy = H / 2;
    const sorted = [...data].sort((a, b) => b.shared_topics - a.shared_topics);
    const maxShared = sorted[0]?.shared_topics || 1;
    const minShared = sorted[sorted.length - 1]?.shared_topics || 1;
    const minR = 110;
    const maxR = Math.min(cx, cy) - 70;

    const layoutNodes: LayoutNode[] = sorted.map((r, i) => {
      const similarity = maxShared === minShared ? 0.5 : (r.shared_topics - minShared) / (maxShared - minShared);
      const dist = maxR - similarity * (maxR - minR);
      const angle = (2 * Math.PI * i) / sorted.length - Math.PI / 2;
      return {
        ...r,
        x: cx + dist * Math.cos(angle),
        y: cy + dist * Math.sin(angle),
        size: nodeSize(r.stars),
      };
    });

    return { nodes: layoutNodes, centerOwner: repoName.split('/')[0] };
  }, [data, repoName]);

  if (isLoading || !data || data.length === 0) return null;

  const cx = W / 2;
  const cy = H / 2;

  return (
    <div className="mt-8">
      <SectionHeading level="h3" id="similar-repos" className="pb-2">Similar Repositories</SectionHeading>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Repositories sharing the most topics in common. Click a node to analyze it.
      </p>
      <div style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Center avatar clip */}
            <clipPath id="clip-center">
              <circle cx={cx} cy={cy} r={30} />
            </clipPath>
            {/* Node avatar clips */}
            {nodes.map((n) => (
              <clipPath key={`clip-${n.repo_name}`} id={`clip-${n.repo_name.replace(/[^a-zA-Z0-9]/g, '-')}`}>
                <circle cx={n.x} cy={n.y} r={n.size} />
              </clipPath>
            ))}
            {/* Center glow gradient */}
            <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ADD8" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#00ADD8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#00ADD8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Center glow */}
          <circle cx={cx} cy={cy} r={55} fill="url(#center-glow)" />

          {/* Connection lines */}
          {nodes.map((n) => {
            const isHov = hovered === n.repo_name;
            const color = LANG_COLORS[n.language || ''] || '#888';
            const mx = (cx + n.x) / 2 + (n.y - cy) * 0.08;
            const my = (cy + n.y) / 2 - (n.x - cx) * 0.08;
            return (
              <g key={`conn-${n.repo_name}`}>
                <path
                  d={`M ${cx} ${cy} Q ${mx} ${my} ${n.x} ${n.y}`}
                  fill="none"
                  stroke={isHov ? color + '50' : 'rgba(255,255,255,0.04)'}
                  strokeWidth={isHov ? 2 : Math.max(0.5, n.shared_topics * 0.3)}
                />
                {isHov && (
                  <text
                    x={(cx + n.x) / 2}
                    y={(cy + n.y) / 2 - 5}
                    fill="rgba(255,255,255,0.5)"
                    fontSize="9"
                    fontFamily="system-ui, sans-serif"
                    textAnchor="middle"
                  >
                    {n.shared_topics} topics
                  </text>
                )}
              </g>
            );
          })}

          {/* Center node avatar */}
          <image
            href={`https://github.com/${centerOwner}.png?s=64`}
            x={cx - 30}
            y={cy - 30}
            width={60}
            height={60}
            clipPath="url(#clip-center)"
          />
          {/* Center node fallback circle (behind image, visible if image fails) */}

          {/* Center label */}
          <text
            x={cx}
            y={cy + 46}
            fill="#fff"
            fontSize="13"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
          >
            {repoName.split('/')[1] || repoName}
          </text>

          {/* Repo nodes */}
          {nodes.map((n) => {
            const color = LANG_COLORS[n.language || ''] || '#888';
            const isHov = hovered === n.repo_name;
            const owner = n.repo_name.split('/')[0];
            const shortName = n.repo_name.split('/')[1] || n.repo_name;
            const clipId = `clip-${n.repo_name.replace(/[^a-zA-Z0-9]/g, '-')}`;

            return (
              <g key={`node-${n.repo_name}`}>
                {/* Hover glow */}
                {isHov && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.size + 12}
                    fill={color + '40'}
                    style={{ filter: 'blur(4px)' }}
                  />
                )}

                {/* Clickable avatar area */}
                <Link href={`/analyze/${n.repo_name}`}>
                  {/* Fallback circle */}
                  <circle cx={n.x} cy={n.y} r={n.size} fill={color} />
                  {/* Avatar image */}
                  <image
                    href={`https://github.com/${owner}.png?s=64`}
                    x={n.x - n.size}
                    y={n.y - n.size}
                    width={n.size * 2}
                    height={n.size * 2}
                    clipPath={`url(#${clipId})`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHovered(n.repo_name)}
                    onMouseLeave={() => setHovered(null)}
                  />
                </Link>

                {/* Repo name */}
                <text
                  x={n.x}
                  y={n.y + n.size + 14}
                  fill={isHov ? '#fff' : '#888'}
                  fontSize={isHov ? '11' : '10'}
                  fontWeight={isHov ? 'bold' : 'normal'}
                  fontFamily="system-ui, sans-serif"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {shortName}
                </text>

                {/* Star count */}
                <text
                  x={n.x}
                  y={n.y + n.size + 25}
                  fill="#555"
                  fontSize="9"
                  fontFamily="system-ui, sans-serif"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  ★ {n.stars.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {hovered && (() => {
            const h = nodes.find((n) => n.repo_name === hovered);
            if (!h) return null;
            const tw = 185, th = 70;
            const tx = Math.min(Math.max(h.x + 20, 5), W - tw - 5);
            const ty = Math.max(h.y - th - 10, 5);
            const lc = LANG_COLORS[h.language || ''] || '#888';
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={tx} y={ty} width={tw} height={th} rx={8} fill="rgba(15,15,15,0.95)" stroke="#333" strokeWidth={1} />
                <text x={tx + 10} y={ty + 20} fill="#eee" fontSize="12" fontWeight="bold" fontFamily="system-ui, sans-serif">
                  {h.repo_name}
                </text>
                <text x={tx + 10} y={ty + 38} fill="#FAC858" fontSize="11" fontFamily="system-ui, sans-serif">
                  ★ {h.stars.toLocaleString()}
                </text>
                <text x={tx + 95} y={ty + 38} fill={lc} fontSize="11" fontFamily="system-ui, sans-serif">
                  ● {h.language || 'Unknown'}
                </text>
                <text x={tx + 10} y={ty + 56} fill="#7c7c7c" fontSize="11" fontFamily="system-ui, sans-serif">
                  {h.shared_topics} shared topics
                </text>
              </g>
            );
          })()}

          {/* Legend */}
          <text x={10} y={H - 15} fill="rgba(255,255,255,0.2)" fontSize="11" fontFamily="system-ui, sans-serif">
            Closer = more similar · Node size = stars · Click to analyze
          </text>
        </svg>
      </div>
    </div>
  );
}
