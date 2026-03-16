'use client';

import OverviewSection from './_sections/overview';
import BehaviourSection from './_sections/behaviour';
import StarSection from './_sections/star';
import CodeSection from './_sections/code';
import CodeReviewSection from './_sections/code-review';
import IssueSection from './_sections/issue';
import ActivitiesSection from './_sections/activities';

export default function UserAnalyzeContent () {
  return (
    <>
      <OverviewSection />
      <BehaviourSection />
      <StarSection />
      <CodeSection />
      <CodeReviewSection />
      <IssueSection />
      <ActivitiesSection />
    </>
  );
}
