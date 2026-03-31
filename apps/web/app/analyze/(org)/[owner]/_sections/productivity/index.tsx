import CodeReviewEfficiency from '@/app/analyze/(org)/[owner]/_sections/productivity/code-review-efficiency';
import CodeSubmissionEfficiency from '@/app/analyze/(org)/[owner]/_sections/productivity/code-submission';
import PRRequestEfficiency from '@/app/analyze/(org)/[owner]/_sections/productivity/pull-request-efficiency';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import * as React from 'react';

export default function ProductivitySection () {
  return (
    <ScrollspySectionWrapper anchor="productivity" className="pt-8 pb-8">
      <SectionHeading>Productivity</SectionHeading>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">Analyze the development productivity of your organization in handling Pull Requests, Code Reviews, and Code Submissions. Identify bottlenecks in the development process, measure the efficiency of code review and issue resolution, and optimize the workflow for increased productivity.</p>
      <PRRequestEfficiency />
      <CodeReviewEfficiency />
      <CodeSubmissionEfficiency />
    </ScrollspySectionWrapper>
  )
}
