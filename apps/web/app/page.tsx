import type { Metadata } from 'next';
import { HomeContent } from './home-content';
import { WebSiteJsonLd, FAQPageJsonLd, OrganizationJsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'OSSInsight - Open Source Software Insight',
  description: 'OSSInsight analyzes billions of GitHub events and provides insights for open source software.',
};

const FAQ_ITEMS = [
  { question: 'What data does OSSInsight analyze?', answer: 'OSSInsight analyzes public GitHub event data archived by GH Archive, including stars, forks, issues, pull requests, commits, and comments — over 10 billion events total.' },
  { question: 'How often is the data updated?', answer: 'Data is updated in near real-time, typically within a few seconds of the event occurring on GitHub.' },
  { question: 'Can I analyze any GitHub repository?', answer: 'Yes. Enter any public GitHub repository name in the search box and OSSInsight will generate a full analytics dashboard with stars, commits, contributors, and more.' },
  { question: 'Is OSSInsight free?', answer: 'Yes, OSSInsight is completely free and open source.' },
  { question: 'How can I compare two repositories?', answer: 'Go to any repository analysis page and click "VS" or add ?vs=owner/repo to the URL to compare two repositories side by side.' },
  { question: 'Does OSSInsight have an API?', answer: 'Yes. OSSInsight provides a free public REST API for collection rankings, repository statistics, and more.' },
];

export default function HomePage() {
  return (
    <>
      <WebSiteJsonLd />
      <OrganizationJsonLd />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <div className="sr-only">
        <h1>OSSInsight — Open Source Software Insight</h1>
        <p>
          OSSInsight is a free analytics platform that tracks over 10 billion GitHub events in real time.
          It provides deep insights into open source repositories, developers, and organizations — including
          stars, commits, pull requests, issues, contributors, and community health metrics.
          Powered by TiDB and built by PingCAP.
        </p>
        <p>
          Use the Data Explorer to query GitHub data with natural language. Browse 100+ curated Collections
          ranking repositories in domains like databases, AI frameworks, and web frameworks. Analyze any
          GitHub repository or compare two projects side by side.
        </p>
      </div>
      <HomeContent />
    </>
  );
}
