'use client';

import { useState, useCallback } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export function getCollectionFaqItems(collectionName: string): FAQItem[] {
  return [
    {
      question: `What are the top ${collectionName} repos on GitHub?`,
      answer: `OSSInsight tracks the most popular ${collectionName} repositories on GitHub, ranked by stars, pull requests, issues, and contributors. Visit the ranking table above to see the current top projects.`,
    },
    {
      question: `How is the ${collectionName} ranking calculated?`,
      answer: `Repositories are ranked using multiple metrics including stars, pull requests, issues, and pull request creators over the last 28 days, with month-to-month comparisons to surface trending projects.`,
    },
    {
      question: `How often is ${collectionName} data updated?`,
      answer: 'Rankings are updated in near real-time based on GitHub events processed by OSSInsight, so you always see the latest activity.',
    },
    {
      question: `Can I suggest a repository for the ${collectionName} collection?`,
      answer: 'Yes! Collection definitions are maintained in our open-source repository on GitHub. You can open a pull request to add or update repositories in any collection.',
    },
    {
      question: `How can I compare ${collectionName} repositories?`,
      answer: 'Each repository in the ranking links to a detailed analytics page where you can explore stars, commits, contributors, and more. You can also use the historical ranking chart to compare how projects have trended over time.',
    },
  ];
}

export function CollectionFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  return (
    <section className="mt-12 border-t border-[#2a2a2a] pt-8" aria-labelledby="collection-faq-heading">
      <h2 id="collection-faq-heading" className="text-lg font-semibold mb-4 text-[#e3e3e3]">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl border border-white/[0.07] overflow-hidden"
              style={{ backgroundColor: isOpen ? '#242526' : '#1a1a1b' }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe895]/50"
              >
                <span className="text-[15px] font-medium text-[#e3e3e3]">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[#ffe895] transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <div className="h-px bg-white/[0.06] mb-4" />
                  <p className="text-[14px] leading-relaxed text-slate-300">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
