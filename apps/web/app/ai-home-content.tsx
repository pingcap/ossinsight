'use client';

import React, { useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { CategoryWithRankings } from './ai-home-data';
import { triggerDownload } from '@/components/ui/export-button';
import { Download } from 'lucide-react';

const LazyECharts = dynamic(() => import('@/components/Analyze/EChartsWrapper'), { ssr: false });

interface AIHomeProps {
  categories: CategoryWithRankings[];
  trendingRepos: any[];
}

function formatK(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

// Group tint colors — deeper tones for dark background
const GROUP_TINTS = ['#2a9d8f', '#4a6cf7', '#c96a45', '#8b5dcf', '#3d8b3d', '#b84c55', '#2e8aa8', '#c49a20', '#1a9bab', '#a85daa', '#5a8a22', '#c98520', '#3d7cc4', '#a25090', '#1f9a7a', '#b87830', '#4a8da5', '#a87a30', '#5a6aab', '#b85050'];

// Light tints need dark text when alpha is high enough
const LIGHT_TINTS = new Set(['#c49a20', '#c98520', '#b87830', '#a87a30']);
const textColorFor = (hex: string, alpha: number) => {
  if (LIGHT_TINTS.has(hex) && alpha > 0.4) return 'rgba(0,0,0,0.8)';
  return '#fff';
};

// Pick the most representative topic for a repo (prefer AI-related)
const AI_TOPICS = new Set([
  'ai', 'artificial-intelligence', 'machine-learning', 'deep-learning',
  'llm', 'large-language-model', 'chatgpt', 'gpt', 'openai',
  'agent', 'ai-agent', 'autonomous-agent',
  'rag', 'retrieval-augmented-generation', 'vector-database',
  'mcp', 'model-context-protocol',
  'coding-assistant', 'code-generation', 'copilot',
  'nlp', 'natural-language-processing', 'transformers',
  'computer-vision', 'image-generation', 'stable-diffusion',
  'mlops', 'model-serving', 'inference',
  'langchain', 'llamaindex', 'huggingface',
]);

function pickTopic(topics: string[]): string {
  if (!topics || topics.length === 0) return 'other';
  // Prefer AI-related topics
  const aiTopic = topics.find(t => AI_TOPICS.has(t));
  if (aiTopic) return aiTopic;
  // Partial match on AI keywords
  const partial = topics.find(t => ['ai', 'ml', 'llm', 'agent', 'model', 'neural', 'gpt', 'chat', 'bot', 'rag', 'vector', 'embed', 'inference', 'train', 'prompt', 'code', 'automat'].some(k => t.includes(k)));
  if (partial) return partial;
  // Exclude generic/language topics
  const skip = new Set(['python', 'javascript', 'typescript', 'go', 'rust', 'java', 'cpp', 'c', 'swift', 'kotlin', 'ruby', 'php', 'hacktoberfest', 'awesome', 'open-source', 'linux', 'macos', 'windows', 'docker', 'github']);
  const good = topics.find(t => !skip.has(t) && t.length > 2);
  return good || 'other';
}


// Convert a remote image URL to base64 data URL
async function toDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

// Build a 4K export — uses canvas directly for reliability
async function export4KTreemap(treemapData: any[], title: string) {
  // Use the already-registered global echarts
  const echartsModule = await import('echarts/core');

  const W = 3840, H = 2160;
  const container = document.createElement('div');
  container.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${W}px;height:${H}px;visibility:hidden;`;
  document.body.appendChild(container);

  const instance = echartsModule.init(container, undefined, { renderer: 'canvas', width: W, height: H });

  // Rebuild data with solid colors and large labels
  const exportData = treemapData.map((group: any, gi: number) => {
    const tint = GROUP_TINTS[gi % GROUP_TINTS.length];
    const groupAlpha = 0.5;
    const groupTextColor = textColorFor(tint, groupAlpha);
    return {
      name: group.name,
      itemStyle: { color: tint, colorAlpha: groupAlpha },
      label: { show: true, color: groupTextColor, fontSize: 28, fontWeight: 600 },
      children: (group.children || []).map((child: any) => {
        const childAlpha = 0.5 + Math.min((child.stars ?? 0) / ((group.children?.[0]?.stars) || 1) * 0.4, 0.4);
        const childTextColor = textColorFor(tint, childAlpha);
        const fs = Math.max(Math.sqrt(child.stars || 1) * 0.75, 16);
        const owner = (child.repoName || child.name || '').split('/')[0] || '';
        const avatarSize = Math.max(Math.round(fs * 1.4), 16);
        const displayName = child.shortName || child.name;
        return {
          name: displayName,
          value: child.value,
          stars: child.stars,
          repoName: child.repoName,
          shortName: child.shortName,
          itemStyle: { color: tint, colorAlpha: childAlpha },
          label: {
            show: true,
            fontSize: fs,
            fontWeight: 500,
            overflow: 'truncate',
            ellipsis: '..',
            formatter: `{avatar|} {name|${displayName}}`,
            rich: {
              avatar: {
                backgroundColor: { image: `/api/avatar/${owner}` },
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              },
              name: {
                fontSize: fs,
                color: childTextColor,
                verticalAlign: 'middle',
              },
            },
          },
        };
      }),
    };
  });

  // Convert all avatar URLs to base64 to avoid canvas taint
  const avatarMap = new Map<string, string>();
  const avatarUrls = new Set<string>();
  for (const group of exportData) {
    for (const child of group.children || []) {
      const img = child.label?.rich?.avatar?.backgroundColor?.image;
      if (img) avatarUrls.add(img);
    }
  }
  await Promise.all([...avatarUrls].map(async (u) => {
    const dataUrl = await toDataUrl(u);
    if (dataUrl) avatarMap.set(u, dataUrl);
  }));
  for (const group of exportData) {
    for (const child of group.children || []) {
      const img = child.label?.rich?.avatar?.backgroundColor?.image;
      if (img && avatarMap.has(img)) {
        child.label.rich.avatar.backgroundColor.image = avatarMap.get(img);
      }
    }
  }

  instance.setOption({
    backgroundColor: '#0d1117',
    graphic: [
      {
        type: 'text',
        left: 60,
        top: 40,
        style: { text: title, fontSize: 42, fontWeight: 700, fontFamily: "'Inter', -apple-system, sans-serif", fill: '#fff' },
      },
      {
        type: 'text',
        right: 60,
        bottom: 40,
        style: { text: 'ossinsight.io', fontSize: 28, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", fill: 'rgba(255,255,255,0.4)' },
      },
    ],
    series: [{
      type: 'treemap',
      roam: false,
      nodeClick: false,
      left: 60, right: 60, top: 110, bottom: 80,
      breadcrumb: { show: false },
      itemStyle: { borderColor: 'rgba(255,255,255,0.1)', borderWidth: 2, gapWidth: 4 },
      label: {
        show: true,
        fontWeight: 500,
        overflow: 'truncate',
        ellipsis: '..',
        formatter: '{b}',
      },
      upperLabel: {
        show: true,
        height: 52,
        color: '#fff',
        fontSize: 32,
        fontWeight: 600,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: [10, 18],
        formatter: '{b}',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowBlur: 3,
      },
      levels: [
        { itemStyle: { borderColor: 'rgba(255,255,255,0.15)', borderWidth: 4, gapWidth: 6 }, upperLabel: { show: true } },
        { itemStyle: { borderColor: 'rgba(255,255,255,0.08)', borderWidth: 2, gapWidth: 3 }, label: { show: true } },
      ],
      data: exportData,
    }],
  });

  // Wait for ECharts to render
  await new Promise(r => setTimeout(r, 500));

  const canvas = container.querySelector('canvas');
  const url = canvas ? canvas.toDataURL('image/png') : instance.getDataURL({ type: 'png', pixelRatio: 1, backgroundColor: '#0d1117' });

  instance.dispose();
  document.body.removeChild(container);
  return url;
}


export default function AIHomeContent({ categories, trendingRepos }: AIHomeProps) {
  const router = useRouter();
  const totalRepos = categories.reduce((s, c) => s + c.repoCount, 0);
  const totalStars = categories.reduce((s, c) => s + c.totalStarsEarned, 0);
  const treemapDataRef = useRef<any[]>([]);

  const onTreemapClick = useCallback((params: any) => {
    const repoName = params.data?.repoName;
    if (repoName) router.push(`/analyze/${repoName}`);
  }, [router]);

  const handleExport4K = useCallback(async () => {
    const url = await export4KTreemap(treemapDataRef.current, 'Open Source Trending — Topic Landscape');
    triggerDownload(url, 'ossinsight-trending-4k.png');
  }, []);


  const treemapOption = useMemo(() => {
    // Group by topic
    const groups = new Map<string, any[]>();
    for (const repo of trendingRepos) {
      const topic = pickTopic(repo.topics || []);
      if (!groups.has(topic)) groups.set(topic, []);
      groups.get(topic)!.push(repo);
    }

    const sorted = [...groups.entries()]
      .map(([name, repos]) => ({
        name,
        repos: repos.sort((a: any, b: any) => (b.stars ?? 0) - (a.stars ?? 0)),
        total: repos.reduce((s: number, r: any) => s + (r.stars ?? 0), 0),
      }))
      .filter(g => g.name !== 'other')
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (p: any) => {
          if (!p.data?.repoName) {
            return `<div style="max-width:320px;white-space:normal;word-break:break-word;overflow-wrap:anywhere"><b>${p.name}</b></div>`;
          }
          return `<div style="max-width:320px;font-size:12px;line-height:1.45;white-space:normal;word-break:break-word;overflow-wrap:anywhere">
            <div style="color:#fff;font-weight:700">${p.data.repoName}</div>
            <div style="margin-top:2px">★ ${Number(p.data.stars || 0).toLocaleString()}</div>
            ${p.data.desc ? `<div style="color:#aaa;margin-top:6px">${String(p.data.desc).slice(0, 100)}</div>` : ''}
          </div>`;
        },
        confine: true,
        extraCssText: 'max-width:min(320px, calc(100vw - 32px));white-space:normal;word-break:break-word;overflow-wrap:anywhere;line-height:1.45;',
        backgroundColor: '#222',
        borderColor: '#444',
        textStyle: { color: '#eee' },
      },
      series: [{
        type: 'treemap',
        roam: false,
        nodeClick: false,
        width: '100%',
        height: '100%',
        breadcrumb: { show: false },
        itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 1 },
        emphasis: {
          itemStyle: { borderColor: 'transparent', borderWidth: 0 },
          label: { color: '#fff' },
          upperLabel: { color: '#fff' },
        },
        label: {
          show: true,
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          textShadowColor: 'rgba(0,0,0,0.5)',
          textShadowBlur: 3,
        },
        upperLabel: {
          show: true,
          height: 24,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          backgroundColor: 'transparent',
          textShadowColor: 'rgba(0,0,0,0.5)',
          textShadowBlur: 3,
        },
        levels: [
          {
            itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 2 },
            upperLabel: { show: true },
          },
          {
            itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 1 },
            label: { show: true },
          },
        ],
        data: (treemapDataRef.current = sorted.map((group, gi) => {
          const tint = GROUP_TINTS[gi % GROUP_TINTS.length];
          return {
            name: group.name,
            itemStyle: { color: 'transparent' },
            emphasis: { itemStyle: { color: tint, colorAlpha: 0.12 } },
            children: group.repos.map((repo: any) => {
              const alpha = 0.15 + Math.min((repo.stars ?? 0) / (group.repos[0]?.stars || 1) * 0.2, 0.2);
              const fs = Math.max(Math.sqrt(repo.stars || 1) * 0.25, 9);
              const owner = repo.repo_name.split('/')[0] || '';
              const avatarSize = Math.max(Math.round(fs * 1.4), 12);
              return {
                name: repo.repo_name,
                shortName: repo.repo_name.split('/')[1] || repo.repo_name,
                repoName: repo.repo_name,
                value: Math.max(repo.stars || 100, 100),
                stars: repo.stars,
                desc: repo.description,
                itemStyle: { color: tint, colorAlpha: alpha },
                emphasis: { itemStyle: { color: tint, colorAlpha: 0.45 } },
                label: {
                  fontSize: fs,
                  color: textColorFor(tint, alpha),
                  formatter: `{avatar|} {name|${repo.repo_name.split('/')[1] || repo.repo_name}}`,
                  rich: {
                    avatar: {
                      backgroundColor: {
                        image: `https://github.com/${owner}.png?size=40`,
                      },
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: avatarSize / 2,
                    },
                    name: {
                      fontSize: fs,
                      color: textColorFor(tint, alpha),
                      verticalAlign: 'middle',
                    },
                  },
                },
              };
            }),
          };
        })),
      }],
    };
  }, [trendingRepos]);

  // No data (upstream query failed or returned nothing): render nothing rather
  // than a 500px-tall blank ECharts canvas with a stray Download button.
  // Also covers the degraded-data incident, where page.tsx stops fetching:
  // the Trending Repos section carries the single user-facing notice.
  if (trendingRepos.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="flex justify-end gap-3 pb-3">
          <button
            type="button"
            onClick={handleExport4K}
            className="flex h-9 items-center gap-2 rounded-md border border-[#444] bg-[#1a1a1a] px-4 text-[14px] font-medium text-white transition hover:border-[#666] hover:bg-[#2a2a2a]"
          >
            <Download className="h-4 w-4" />
            Download 4K
          </button>
        </div>
        <LazyECharts option={treemapOption} style={{ height: 500, width: '100%' }} onEvents={{ click: onTreemapClick }} />
      </div>
    </section>
  );
}
