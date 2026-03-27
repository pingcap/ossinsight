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
