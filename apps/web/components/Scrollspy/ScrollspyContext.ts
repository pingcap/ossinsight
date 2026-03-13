'use client';

import { createContext, createElement, ReactNode, RefObject, useContext, useEffect, useState } from 'react';

export interface ScrollspySection {
  id: string;
  el: HTMLElement;
  runtime?: { offsetTop: number };
}

export type ScrollspySubscribeFn = (section: ScrollspySection | null, activeSections: ScrollspySection[]) => void

class ScrollspyContextClass {
  scrollTarget: HTMLElement | null = null;
  private sections: ScrollspySection[] = [];
  private sectionsMap: Map<Element, ScrollspySection> = new Map();
  private activeSections: Set<ScrollspySection> = new Set();
  private sortedActiveSections: ScrollspySection[] = [];
  private enabled = false;
  private io!: IntersectionObserver;
  private ro!: ResizeObserver;
  currentSection: ScrollspySection | null = null;
  private currentSectionSubscribers: (ScrollspySubscribeFn)[] = [];

  private onScroll = () => {
    if (this.sortedActiveSections.length === 0) {
      this.setCurrentSection(null);
      return;
    }
    const scrollTop = (this.scrollTarget ?? document.documentElement).scrollTop;
    const windowHeight = window.innerHeight;
    if (this.sortedActiveSections.length === 1) {
      this.setCurrentSection(this.sortedActiveSections[0]);
      return;
    }

    let nearestTopSection: ScrollspySection | undefined = undefined;

    for (const section of this.sortedActiveSections) {
      const top = (section.runtime?.offsetTop ?? 9999999) - scrollTop;
      // Record nearest section with top boundary outside viewport
      if (top < 0) {
        nearestTopSection = section;
      }
      // Pick the first section with top boundary inside viewport and positioned in top half part
      if (top > 0 && top < windowHeight / 2) {
        this.setCurrentSection(section);
        return;
      }
    }

    // If none, take the first active section
    this.setCurrentSection(nearestTopSection ?? this.sortedActiveSections[0]);
  };

  constructor () {}

  private setCurrentSection (currentSection: ScrollspySection | null) {
    if (this.currentSection !== currentSection) {
      this.currentSection = currentSection;
      this.currentSectionSubscribers.forEach(fn => fn(currentSection, this.sortedActiveSections));
    }
  }

  private sortActiveSections () {
    this.sortedActiveSections = Array.from(this.activeSections).sort((a, b) => (a.runtime?.offsetTop ?? 999999) - (b.runtime?.offsetTop ?? 999999));
  }

  register (id: string, el: HTMLElement) {
    const section: ScrollspySection = { id, el };
    this.sections.push(section);
    this.sectionsMap.set(el, section);
    if (this.enabled) {
      this.io.observe(el);
      this.ro.observe(el);
      this.onScroll();
    }
  }

  unregister (id: string) {
    const sid = this.sections.findIndex(s => s.id === id);
    if (sid !== -1) {
      const [s] = this.sections.splice(sid, 1);
      this.sectionsMap.delete(s.el);
      if (this.enabled) {
        this.io.unobserve(s.el);
        this.activeSections.delete(s);
        this.sortActiveSections();
        this.ro.unobserve(s.el);
      }
    }
  }

  subscribe (fn: ScrollspySubscribeFn) {
    this.currentSectionSubscribers.push(fn);
  }

  unsubscribe (fn: ScrollspySubscribeFn) {
    const i = this.currentSectionSubscribers.indexOf(fn);
    if (i !== -1) {
      this.currentSectionSubscribers.splice(i, 1);
    }
  }

  private handleIntersectionObserverEntries (entries: IntersectionObserverEntry[]) {
    if (!this.enabled) {
      return;
    }
    entries.forEach(entry => {
      const section = this.sectionsMap.get(entry.target);
      if (!section) {
        return;
      }
      if (entry.isIntersecting) {
        section.runtime = {
          offsetTop: getOffsetTopToScrollTarget(this.scrollTarget, section.el),
        };
        this.activeSections.add(section);
        this.sortActiveSections();
      } else {
        delete section.runtime;
        this.activeSections.delete(section);
        this.sortActiveSections();
      }
    });
  }

  enable () {
    if (this.enabled) {
      return;
    }
    this.enabled = true;

    (this.scrollTarget ?? document).addEventListener('scroll', this.onScroll, { passive: true });

    // to track which section was scrolled into view (for optimizing performance: only calculate in-view sections)
    this.io = new IntersectionObserver(entries => {
      this.handleIntersectionObserverEntries(entries);

      // get initial currentSection
      if (!this.currentSection) {
        this.onScroll();
      }
    });

    // to track section or container resize and recompute section.top value (only active sections).
    this.ro = new ResizeObserver(() => {
      this.activeSections.forEach(section => {
        section.runtime = {
          offsetTop: getOffsetTopToScrollTarget(this.scrollTarget, section.el),
        };
      });
    });
    this.ro.observe(document.documentElement);

    this.sections.forEach(s => {
      this.io.observe(s.el);
      this.ro.observe(s.el);
    });
  }

  disable () {
    if (!this.enabled) {
      return;
    }
    this.enabled = false;

    (this.scrollTarget ?? document).removeEventListener('scroll', this.onScroll);
    this.io.disconnect();
    this.io = undefined as any;
    this.ro.disconnect();
    this.ro = undefined as any;
  }
}

function getOffsetTopToScrollTarget (scrollTarget: Element | null, element: HTMLElement): number {
  if (!element.offsetParent || element.offsetParent === scrollTarget) {
    return element.offsetTop;
  }
  return element.offsetTop + getOffsetTopToScrollTarget(scrollTarget, element.offsetParent as HTMLElement);
}

const ScrollspyContext = createContext<ScrollspyContextClass>(new ScrollspyContextClass());

export function ScrollspyContextProvider ({ children, scrollTarget }: { children: ReactNode, scrollTarget?: RefObject<HTMLElement> }) {
  const [cls] = useState(() => new ScrollspyContextClass());

  useEffect(() => {
    if (scrollTarget?.current) {
      cls.scrollTarget = scrollTarget.current;
    }
    cls.enable();

    return () => {
      cls.disable();
    };
  }, [cls]);

  return (
    createElement(
      ScrollspyContext.Provider,
      {
        value: cls,
      },
      children,
    )
  );
}

export function useScrollspyContext () {
  return useContext(ScrollspyContext);
}
