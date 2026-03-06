import Engagement from '@/app/analyze/[owner]/_sections/participant/engagement';
import Origins from '@/app/analyze/[owner]/_sections/participant/origins';
import SectionTemplate from '@/components/Analyze/Section';
import * as React from 'react';

export default function ParticipantSection () {
  return (
    <SectionTemplate
      title="Participant"
      description="Examine participation dynamics within your organization, analyzing participant activity, engagement depth, roles, affiliations, and geographic distribution. Uncover valuable insights into participate involvement, preferences, and demographics, enabling targeted strategies for enhanced engagement and tailored experiences."
      level={2}
      className="pt-8"
    >
      <Engagement />
      <Origins />
    </SectionTemplate>
  );
}