import CodeReviewEfficiency from '@/app/analyze/[owner]/_sections/productivity/code-review-efficiency';
import CodeSubmissionEfficiency from '@/app/analyze/[owner]/_sections/productivity/code-submission';
import PRRequestEfficiency from '@/app/analyze/[owner]/_sections/productivity/pull-request-efficiency';
import SectionTemplate from '@/components/Analyze/Section';
import * as React from 'react';

export default function ProductivitySection () {
  return (
    <SectionTemplate
      title='Productivity'
      description='Analyze the development productivity of your organization in handling Pull Requests, Code Reviews, and Code Submissions. Identify bottlenecks in the development process, measure the efficiency of code review and issue resolution, and optimize the workflow for increased productivity.'
      level={2}
      className='pt-8'
    >
      <PRRequestEfficiency />
      <CodeReviewEfficiency />
      <CodeSubmissionEfficiency />
    </SectionTemplate>
  )
}