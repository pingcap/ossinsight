'use client';
import Issue from '@/app/analyze/(org)/[owner]/_sections/issue';
import Overview from '@/app/analyze/(org)/[owner]/_sections/overview';
import ParticipantSection from '@/app/analyze/(org)/[owner]/_sections/participant';
import ProductivitySection from '@/app/analyze/(org)/[owner]/_sections/productivity';
import StarGrowth from '@/app/analyze/(org)/[owner]/_sections/star-growth';
import * as React from 'react';

export default function OrgAnalyzePageContent () {

  return (
    <>
      <Overview />
      <StarGrowth />
      <ParticipantSection />
      <ProductivitySection />
      <Issue />
    </>
  );
}
