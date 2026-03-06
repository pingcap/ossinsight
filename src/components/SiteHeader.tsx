import Link from 'next/link';
import siteConfig from '@/site.config';
import { ConfigIconType } from '@/lib/ui/types/ui-config';

function getLogoAltText (logo: ConfigIconType): string {
  if (typeof logo === 'object' && logo != null && 'alt' in logo && typeof logo.alt === 'string') {
    return logo.alt;
  }
  return 'OSS Insight';
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/widgets" className="font-semibold tracking-tight text-ink">
          {getLogoAltText(siteConfig.header.logo)}
        </Link>
        <nav className="flex items-center gap-1">
          {siteConfig.header.items.map((item: any) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-slate-700 transition hover:bg-mist hover:text-teal-800"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
