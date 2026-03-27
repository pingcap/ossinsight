import { listCollections } from '@/lib/server/internal-api';
import { toCollectionSlug } from '@/lib/collections';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export async function GET() {
  const sections: string[] = [];

  sections.push(`# OSSInsight — Full Documentation

> OSSInsight is a free, open analytics platform that tracks over 10 billion GitHub events in real time, providing deep insights into repositories, developers, organizations, and open-source trends.

Source: GitHub Archive (gharchive.org), updated every hour.
Built by PingCAP, powered by TiDB.

---

## Home (${SITE_URL}/)

The homepage shows:
- A real-time counter of total GitHub events analyzed (over 10 billion)
- Trending repositories ranked by stars, pull requests, or issues in configurable time windows
- Hot collections (curated technology categories)
- A search box to jump into any repository or developer analysis

---

## Data Explorer (${SITE_URL}/explore/)

A natural-language query interface for GitHub event data. Users type a question in plain English (e.g., "Which repos gained the most stars last month?") and OSSInsight generates SQL, runs it against the full GitHub event dataset, and returns interactive visualizations. Powered by AI (Text-to-SQL).

---

## Repository Analysis (${SITE_URL}/analyze/{owner}/{repo})

Enter any public GitHub repository to see:
- Stars, forks, commits, issues, pull requests over time
- Contributor geography and organization distribution
- Commit time distribution heatmaps
- Lines of code changed per month
- Issue and PR response time percentiles
- Comparison mode: add \`?vs=owner/repo\` to compare two repositories side by side

---

## Organization Analysis (${SITE_URL}/analyze/{org})

Enter any GitHub organization to see:
- Total repositories, stars, forks, contributors
- Activity trends across all repositories
- Top contributors and active repositories
- Comparison with other organizations

---

## Collections (${SITE_URL}/collections/)

Curated lists of GitHub repositories grouped by technology domain. Each collection provides:
- A ranking table (sortable by stars, pull requests, issues, PR creators)
- A trends page showing popularity growth over time
`);

  // Dynamic collections list
  try {
    const collections = await listCollections();
    const collectionLines = collections.map(
      (c: { name: string }) => `- [${c.name}](${SITE_URL}/collections/${toCollectionSlug(c.name)})`,
    );
    sections.push(`### Available Collections (${collections.length} total)\n\n${collectionLines.join('\n')}`);
  } catch (error) {
    console.warn('[llms-full.txt] Failed to fetch collections:', error);
  }

  sections.push(`---

## Blog (${SITE_URL}/blog)

Technical articles about open-source trends, GitHub data analysis, and OSSInsight product updates.

---

## API Documentation (${SITE_URL}/docs/api)

OSSInsight provides a free public REST API. Endpoints include:
- List collections and collection repositories
- Repository ranking by stars, pull requests, issues
- Stargazer/contributor/issue-creator history and geography
- Trending repositories

See the full API reference at ${SITE_URL}/docs/api

---

## Frequently Asked Questions

**Q: What data does OSSInsight analyze?**
A: OSSInsight analyzes public GitHub event data archived by GH Archive (gharchive.org). This includes stars, forks, issues, pull requests, commits, comments, and more — over 10 billion events total.

**Q: How often is the data updated?**
A: Data is updated in near real-time, typically within a few seconds of the event occurring on GitHub.

**Q: Can I analyze any GitHub repository?**
A: Yes. Enter any public GitHub repository name (e.g., \`facebook/react\`) in the search box and OSSInsight will generate a full analytics dashboard.

**Q: Is OSSInsight free?**
A: Yes, OSSInsight is completely free and open source.

**Q: Does OSSInsight have an API?**
A: Yes. See the API documentation at ${SITE_URL}/docs/api for available endpoints.

**Q: How can I compare two repositories?**
A: Go to any repository analysis page and click "VS" or add \`?vs=owner/repo\` to the URL.
`);

  return new Response(sections.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
