'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAnalyzeContext } from '@/components/Analyze/context';

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

function drawCircularImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

export default function SimilarReposRadial() {
  const { repoId, repoName } = useAnalyzeContext();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef<LayoutNode | null>(null);
  const avatarCacheRef = useRef<Record<string, HTMLImageElement | null>>({});

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

  const loadAvatar = useCallback((owner: string) => {
    const cache = avatarCacheRef.current;
    if (cache[owner] !== undefined) return;
    cache[owner] = null;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://avatars.githubusercontent.com/${owner}?s=64`;
    img.onload = () => {
      cache[owner] = img;
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = 500;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2;

    // Load avatars
    const centerOwner = repoName.split('/')[0];
    loadAvatar(centerOwner);
    data.forEach((r) => loadAvatar(r.repo_name.split('/')[0]));

    // Layout
    const sorted = [...data].sort((a, b) => b.shared_topics - a.shared_topics);
    const maxShared = sorted[0]?.shared_topics || 1;
    const minShared = sorted[sorted.length - 1]?.shared_topics || 1;
    const minR = 110;
    const maxR = Math.min(cx, cy) - 70;

    const nodes: LayoutNode[] = sorted.map((r, i) => {
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

    let animId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      const hovered = hoveredRef.current;
      const cache = avatarCacheRef.current;

      // Center glow
      const grd = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 55);
      grd.addColorStop(0, '#00ADD825');
      grd.addColorStop(0.6, '#00ADD810');
      grd.addColorStop(1, 'transparent');
      ctx!.fillStyle = grd;
      ctx!.beginPath();
      ctx!.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx!.fill();

      // Connections
      nodes.forEach((n) => {
        const isHov = hovered?.repo_name === n.repo_name;
        const color = LANG_COLORS[n.language || ''] || '#888';
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        const mx = (cx + n.x) / 2 + (n.y - cy) * 0.08;
        const my = (cy + n.y) / 2 - (n.x - cx) * 0.08;
        ctx!.quadraticCurveTo(mx, my, n.x, n.y);
        ctx!.strokeStyle = isHov ? color + '50' : 'rgba(255,255,255,0.04)';
        ctx!.lineWidth = isHov ? 2 : Math.max(0.5, n.shared_topics * 0.3);
        ctx!.stroke();

        if (isHov) {
          const lx = (cx + n.x) / 2;
          const ly = (cy + n.y) / 2;
          ctx!.fillStyle = 'rgba(255,255,255,0.5)';
          ctx!.font = '9px system-ui, sans-serif';
          ctx!.textAlign = 'center';
          ctx!.fillText(`${n.shared_topics} topics`, lx, ly - 5);
        }
      });

      // Center node
      const centerAvatar = cache[centerOwner];
      if (centerAvatar) {
        drawCircularImage(ctx!, centerAvatar, cx, cy, 30);
      } else {
        ctx!.beginPath();
        ctx!.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx!.fillStyle = '#00ADD8';
        ctx!.fill();
      }
      ctx!.fillStyle = '#fff';
      ctx!.font = 'bold 13px system-ui, sans-serif';
      ctx!.textAlign = 'center';
      ctx!.fillText(repoName.split('/')[1] || repoName, cx, cy + 46);
      ctx!.fillStyle = '#FAC858';
      ctx!.font = '10px system-ui, sans-serif';

      // Nodes
      nodes.forEach((n) => {
        const color = LANG_COLORS[n.language || ''] || '#888';
        const isHov = hovered?.repo_name === n.repo_name;
        const owner = n.repo_name.split('/')[0];
        const avatar = cache[owner];

        if (isHov) {
          const g2 = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size + 12);
          g2.addColorStop(0, color + '40');
          g2.addColorStop(1, 'transparent');
          ctx!.fillStyle = g2;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.size + 12, 0, Math.PI * 2);
          ctx!.fill();
        }

        if (avatar) {
          drawCircularImage(ctx!, avatar, n.x, n.y, n.size);
        } else {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.fill();
        }

        const shortName = n.repo_name.split('/')[1] || n.repo_name;
        ctx!.fillStyle = isHov ? '#fff' : '#888';
        ctx!.font = `${isHov ? 'bold 11px' : '10px'} system-ui, sans-serif`;
        ctx!.textAlign = 'center';
        ctx!.fillText(shortName, n.x, n.y + n.size + 14);
        ctx!.fillStyle = '#555';
        ctx!.font = '9px system-ui, sans-serif';
        ctx!.fillText(`★ ${n.stars.toLocaleString()}`, n.x, n.y + n.size + 25);
      });

      // Tooltip
      if (hovered) {
        const tw = 185, th = 70;
        const tx = Math.min(Math.max(hovered.x + 20, 5), W - tw - 5);
        const ty = Math.max(hovered.y - th - 10, 5);
        ctx!.fillStyle = 'rgba(15,15,15,0.95)';
        ctx!.strokeStyle = '#333';
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.roundRect(tx, ty, tw, th, 8);
        ctx!.fill();
        ctx!.stroke();
        ctx!.fillStyle = '#eee';
        ctx!.font = 'bold 12px system-ui, sans-serif';
        ctx!.textAlign = 'left';
        ctx!.fillText(hovered.repo_name, tx + 10, ty + 20);
        ctx!.fillStyle = '#FAC858';
        ctx!.font = '11px system-ui, sans-serif';
        ctx!.fillText(`★ ${hovered.stars.toLocaleString()}`, tx + 10, ty + 38);
        const lc = LANG_COLORS[hovered.language || ''] || '#888';
        ctx!.fillStyle = lc;
        ctx!.fillText(`● ${hovered.language || 'Unknown'}`, tx + 95, ty + 38);
        ctx!.fillStyle = '#7c7c7c';
        ctx!.fillText(`${hovered.shared_topics} shared topics`, tx + 10, ty + 56);
      }

      // Legend
      ctx!.fillStyle = 'rgba(255,255,255,0.2)';
      ctx!.font = '11px system-ui, sans-serif';
      ctx!.textAlign = 'left';
      ctx!.fillText('Closer = more similar  ·  Node size = stars  ·  Click to analyze', 10, H - 15);

      animId = requestAnimationFrame(draw);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top) * (H / rect.height);
      hoveredRef.current = null;
      for (const n of nodes) {
        if (Math.hypot(mx - n.x, my - n.y) < n.size + 5) {
          hoveredRef.current = n;
          canvas.style.cursor = 'pointer';
          return;
        }
      }
      canvas.style.cursor = 'default';
    };

    const handleClick = () => {
      const h = hoveredRef.current;
      if (h) {
        router.push(`/analyze/${h.repo_name}`);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [data, repoName, loadAvatar, router]);

  if (isLoading || !data || data.length === 0) return null;

  return (
    <div className="mt-8">
      <h3
        id="similar-repos"
        className="pb-2 text-[24px] font-semibold text-[#e9eaee]"
        style={{ scrollMarginTop: '140px' }}
      >
        Similar Repositories
      </h3>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Repositories sharing the most topics in common. Click a node to analyze it.
      </p>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 500, borderRadius: 8 }}
      />
    </div>
  );
}
