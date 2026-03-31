import Engagement from '@/app/analyze/(org)/[owner]/_sections/participant/engagement';
import Origins from '@/app/analyze/(org)/[owner]/_sections/participant/origins';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import * as React from 'react';

export default function ParticipantSection () {
  return (
    <ScrollspySectionWrapper anchor="participant" className="pt-8 pb-8">
      <SectionHeading>Participant</SectionHeading>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Examine participation dynamics within your organization, analyzing participant activity, engagement depth, roles, affiliations, and geographic distribution. Uncover valuable insights into participate involvement, preferences, and demographics, enabling targeted strategies for enhanced engagement and tailored experiences.
      </p>
      <Engagement />
      <Origins />
    </ScrollspySectionWrapper>
  );
}
