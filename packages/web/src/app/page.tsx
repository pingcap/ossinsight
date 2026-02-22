import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">OSSInsight</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/explore"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Explore
              </Link>
              <Link
                href="/collections"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Collections
              </Link>
              <Link
                href="/blog"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Blog
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href="https://github.com/pingcap/ossinsight" target="_blank">
                GitHub
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container flex flex-col items-center justify-center gap-6 py-24 md:py-32">
        <div className="flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Open Source{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Software Insight
            </span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Explore 6+ billion GitHub events. Discover trends, compare
            repositories, and gain deep insights into the open-source ecosystem
            — powered by TiDB.
          </p>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/explore">Start Exploring</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/collections">View Collections</Link>
          </Button>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="6+ Billion Events"
            description="Analyse every public GitHub event since 2011 — stars, forks, pull requests, issues, and more."
          />
          <FeatureCard
            title="Real-time Insights"
            description="Data updated hourly. Track momentum as it happens in the open-source world."
          />
          <FeatureCard
            title="AI-powered Exploration"
            description="Ask questions in plain English. Our AI translates them into SQL and returns instant answers."
          />
          <FeatureCard
            title="Curated Collections"
            description="Browse hand-picked groups of repositories by topic — databases, frontend frameworks, and more."
          />
          <FeatureCard
            title="Developer API"
            description="A fully documented public REST API. Build your own integrations or visualisations on top of OSSInsight data."
          />
          <FeatureCard
            title="Open Source"
            description="OSSInsight itself is open source. Inspect the code, contribute, and deploy your own instance."
          />
        </div>
      </section>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="https://pingcap.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              PingCAP
            </a>
            . The source code is available on{" "}
            <a
              href="https://github.com/pingcap/ossinsight"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
