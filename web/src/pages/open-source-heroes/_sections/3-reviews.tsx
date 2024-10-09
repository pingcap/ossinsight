import { Masonry } from '@mui/lab';
import { Box, styled } from '@mui/material';
import { Section, SectionContent, SectionTitle } from '@site/src/pages/open-source-heroes/_components/Section';
import React from 'react';

import * as r0 from './3-reviews/0';
import * as r1 from './3-reviews/1';
import * as r2 from './3-reviews/2';
import * as r3 from './3-reviews/3';
import * as r4 from './3-reviews/4';
import * as r5 from './3-reviews/5';
import * as r6 from './3-reviews/6';
import * as r7 from './3-reviews/7';
import * as r8 from './3-reviews/8';

export function ReviewsSection () {
  return (
    <Section>
      <SectionContent>
        <SectionTitle>
          We Build with <a href="https://www.pingcap.com/tidb-cloud-serverless/?utm_source=ossinsight&utm_medium=referral&utm_campaign=plg_OSScontribution_credit_05" target="_blank" rel="noreferrer">TiDB</a>
        </SectionTitle>
        <Masonry sequential sx={{ mt: 7, listStyle: 'none' }} component="ul" columns={[1, 1, 2, 3]} spacing={3}>
          {reviews.map((review, index) => (
            <ReviewCard key={index} style={{ '--color1': review.color, '--color2': review.backgroundColor }}>
              <ReviewHeading>
                {review.avatar}
                <ReviewHeadingInfo>
                  <ReviewHeadingUsername>
                    {review.name}
                  </ReviewHeadingUsername>
                  <ReviewHeadingBio>
                    {review.bio}
                  </ReviewHeadingBio>
                  <ReviewHeadingTag>
                    {review.label}
                  </ReviewHeadingTag>
                </ReviewHeadingInfo>
              </ReviewHeading>
              <Box sx={{ display: 'flex', pt: 2 }}>
                <svg style={{ flexShrink: 0, marginRight: 8 }} width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 22V14.496C2 12.5547 2.61407 10.912 3.8081 9.75467C4.6951 8.82133 5.47974 8.41067 7.11727 8L8.61834 10.8373C7.28785 11.0613 6.60554 11.36 5.92324 11.9947C5.30917 12.5547 5.07036 13.152 4.96802 14.496H8.89126V22H2ZM11.1429 22V14.496C11.1429 12.5547 11.7569 10.912 12.9168 9.75467C13.838 8.82133 14.6226 8.41067 16.226 8L17.7271 10.8373C16.3966 11.0613 15.7143 11.36 15.0661 11.9947C14.4179 12.5547 14.2132 13.152 14.1109 14.496H18V22H11.1429Z" fill="white" />
                </svg>
                <ReviewContent>
                  <review.content />
                </ReviewContent>
              </Box>
            </ReviewCard>
          ))}
        </Masonry>
      </SectionContent>
    </Section>
  );
}

const reviews = [
  r0, r1, r2, r3, r4, r5, r6, r7, r8,
];

const ReviewCard = styled('li')`
  background-color: #141414;
  border-radius: 20px;
  padding: 24px;
`;

const ReviewHeading = styled('div')`
  display: flex;
  gap: 24px;
`;

const ReviewHeadingInfo = styled('div')`
  font-size: 12px;
  font-weight: 700;
  line-height: 24px;
`;

const ReviewHeadingUsername = styled('div')`
  color: white;
`;

const ReviewHeadingBio = styled('div')`
  color: #C6C6C6;

`;

const ReviewHeadingTag = styled('div')`
  margin-top: 4px;
  width: max-content;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: var(--color2);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  color: var(--color1);
`;

const ReviewContent = styled('blockquote')`
  padding: 0;
  border: none;
  margin-bottom: 0;
  font-size: 14px;
  font-style: italic;
  line-height: 32px;
  font-weight: 400;

  strong {
    color: var(--color1);
  }

  > *:last-of-type::after {
    content: url("data:image/svg+xml,%3Csvg width='23' height='20' viewBox='0 0 23 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.5361 2V9.504C18.5361 11.4453 17.9221 13.088 16.7621 14.2453C15.841 15.1787 15.0564 15.5893 13.453 16L11.9519 13.1627C13.2824 12.9387 13.9647 12.64 14.647 12.0053C15.2611 11.4453 15.4658 10.848 15.5681 9.504H11.679V2H18.5361ZM9.4274 2V9.504C9.4274 11.4453 8.81333 13.088 7.6193 14.2453C6.7323 15.1787 5.94765 15.5893 4.31012 16L2.80906 13.1627C4.13955 12.9387 4.82184 12.64 5.50415 12.0053C6.11822 11.4453 6.35702 10.848 6.45937 9.504H2.53613V2H9.4274Z' fill='white'/%3E%3C/svg%3E%0A");
    position: absolute;
    margin-top: 9px;
  }
`;
