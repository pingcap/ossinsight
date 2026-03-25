export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is OSSInsight?',
    answer:
      'OSSInsight is a free, open-source analytics platform that tracks over 10 billion GitHub events in real time. It provides deep insights into repositories, developers, and organizations — including stars, commits, pull requests, issues, and community health metrics. Powered by TiDB and built by PingCAP.',
  },
  {
    question: 'How does OSSInsight analyze repositories?',
    answer:
      'OSSInsight ingests public GitHub event data from GH Archive and stores it in TiDB, a distributed SQL database built to handle billions of rows. When you look up a repository, OSSInsight queries this data in real time to generate a full analytics dashboard.',
  },
  {
    question: 'Is OSSInsight free to use?',
    answer:
      'Yes. OSSInsight is completely free and open source. The source code is available on GitHub at github.com/pingcap/ossinsight under an Apache 2.0 license.',
  },
  {
    question: 'What data does OSSInsight use?',
    answer:
      'OSSInsight analyzes public GitHub event data archived by GH Archive, including stars, forks, issues, pull requests, commits, pushes, and comments — more than 10 billion events in total.',
  },
  {
    question: 'How often is the data updated?',
    answer:
      'Data is updated in near real-time, typically within a few seconds of the event occurring on GitHub.',
  },
  {
    question: 'Can I analyze my own GitHub profile?',
    answer:
      'Yes. Enter your GitHub username in the search box and OSSInsight will generate a full developer profile showing your contribution history, starred repositories, programming languages used, and activity trends over time.',
  },
];
