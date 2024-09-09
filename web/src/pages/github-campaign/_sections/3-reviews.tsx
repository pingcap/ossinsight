import { Masonry } from '@mui/lab';
import { styled } from '@mui/material';
import { Section, SectionContent, SectionTitle } from '@site/src/pages/github-campaign/_components/Section';
import React, { type ReactNode } from 'react';

export function ReviewsSection () {
  return (
    <Section>
      <SectionContent>
        <SectionTitle>
          Build with TiDB
        </SectionTitle>
        <Masonry sx={{ mt: 7, listStyle: 'none' }} component="ul" columns={[1, 1, 2, 3]} spacing={3}>
          {reviews.map((review, index) => (
            <ReviewCard key={index} style={{ '--color1': review.color, '--color2': review.color + '40' }}>
              <ReviewHeading>
                {review.avatar}
                <ReviewHeadingInfo>
                  <ReviewHeadingUsername>
                    {review.username}
                  </ReviewHeadingUsername>
                  <ReviewHeadingBio>
                    {review.bio}
                  </ReviewHeadingBio>
                  <ReviewHeadingTag>
                    {review.tag}
                  </ReviewHeadingTag>
                </ReviewHeadingInfo>
              </ReviewHeading>
              <ReviewContent>
                {review.content}
              </ReviewContent>
            </ReviewCard>
          ))}
        </Masonry>
      </SectionContent>
    </Section>
  );
}

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

const ReviewContent = styled('p')`
  margin-top: 16px;
  margin-bottom: 0;
  font-size: 14px;
  font-style: italic;
  line-height: 32px;
  font-weight: 400;
  strong {
    color: var(--color1);
  }
`;

type Review = {
  avatar: ReactNode;
  username: string;
  bio: string;
  tag: string;
  color: string;
  content: ReactNode;
};

const reviews: Review[] = [
  {
    avatar: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35.5" stroke="#707070" />
      <path d="M22.1947 12.9844C18.3239 20.7492 11.3819 36.6637 14.5807 38.203C17.7796 39.7422 27.1957 40.1995 31.5039 40.2357C33.936 47.3554 38.8002 61.5947 38.8002 61.5947" stroke="#11A6ED" strokeWidth="6" strokeLinecap="round" />
      <circle cx="47.1448" cy="23.7563" r="5.96479" stroke="#0EA6F1" strokeWidth="6" />
    </svg>,
    username: '@ Kentaro Kitagawa',
    bio: 'Senior DBA, LINE Corporation',
    tag: 'Internet',
    color: '#3BBDFB',
    content: <>
      Scale-in and scale-out in a cluster configuration is also <strong>easy</strong>, and the ecosystem is very rich, with operation monitoring tools such as Grafana being able to be installed immediately with the installation command (TiUP).
    </>,
  },
  {
    avatar: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35.5" stroke="#707070" />
      <path d="M23.4191 22.196L10.2882 32.8647M48.0388 25.4788L59.1177 35.7371" stroke="#A711ED" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34.703 35.7375L27.0515 43.3897L34.703 48.9554" stroke="#A711ED" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    username: '@ Thomas Yu ',
    bio: 'Founding Engineer, Chaintool',
    tag: 'Web 3',
    color: '#AA95FF',
    content: <>TiDB Serverless is especially beneficial for experimental or early-stage features. It&#39;s <strong>cost-effective</strong> for startups, scalable, and development-friendly. </>,
  },
  {
    avatar: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35.5" stroke="#707070" />
      <ellipse cx="47.1453" cy="23.8925" rx="5.96479" ry="6.10095" stroke="#F2AA18" strokeWidth="6" />
      <path d="M30.3556 20.884C25.5692 32.667 18.5591 56.498 28.81 57.5586" stroke="#F2AA18" strokeWidth="6" strokeLinecap="round" />
    </svg>,
    username: '@ Sky Dong',
    bio: 'Founding Engineer, Chaintool',
    tag: 'Web 3',
    color: '#FFE790',
    content: <>The ease and comfort of getting started are paramount for us, and from this perspective, TiDB Serverless <strong>perfectly addresses our needs</strong>. Also, the design concept of TiDB has a technical flair that developers find very appealing. </>,
  },
  {
    avatar: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35.5" stroke="#707070" />
      <path d="M34.7616 23.8372C35.5823 27.9405 36.321 36.5575 32.71 38.1988C28.1962 40.2504 22.0413 43.1231 23.2723 45.9954C24.2571 48.2932 29.9744 50.509 32.71 51.3297" stroke="#E65C5C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.4247 27.5308L22.4523 23.0173L24.5037 27.5308" stroke="#E65C5C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56.977 29.7872L48.2848 25.2737L46.3096 29.7872" stroke="#E65C5C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    username: '@ Boris Savelev',
    bio: 'SRE Manager, Bolt',
    tag: 'Logistics',
    color: '#FF8888',
    content: <>In the following years, we will definitely migrate more clusters from MySQL to TiDB, use TiCDC to set up multi-region clusters on AWS for failover, and try TiFlash for instant <strong>analytical queries</strong>. </>,
  },
  {
    avatar: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35.5" stroke="#707070" />
      <path d="M26.5031 15.809L13.9319 47.3409L26.5031 49.7643V62.5739C32.4001 62.3431 45.6839 59.9428 51.6433 52.1877" stroke="#52CC7A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46.9818" cy="24.0155" r="5.97791" fill="#52CC7A" />
    </svg>,
    username: '@ Henry Qin',
    bio: 'Software Engineer',
    tag: 'Fintech',
    color: '#52CC7A',
    content: <>TiDB&#39;s architecture, sort of a SQL layer on top of a key value store, was <strong>more scalable</strong> and more likely to cause fewer problems down the line. With TiDB, we don&#39;t need to worry about cross-charge transactions. That&#39;s huge. </>,
  },
  {
    avatar: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35.5" stroke="#707070" />
      <path d="M32.3814 29.7871V57.7181" stroke="#2E6BE5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.3456" cy="28.266" r="3.06995" stroke="#2E6BE5" strokeWidth="6" />
      <path d="M43.3389 28.322H58.6959" stroke="#2E6BE5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    username: '@ Kaustav Chakravorty',
    bio: 'Senior Architect, Flipkart',
    tag: 'E-Commerce',
    color: '#6296FF',
    content: <>The NO.1 benefit is <strong>simplicity</strong>.<br />With TiDB, our applications can retain their SQL data model and the ACID guarantees. We don’t have to implement any kind of shareding logic, and the database management becomes simpler too.</>,
  },
  {
    avatar: <svg width="72" height="73" viewBox="0 0 72 73" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36.9141" r="35.5" stroke="#707070" />
      <path d="M33.6494 19.3936C40.1424 27.0686 51.1805 44.0127 43.3889 50.3887C35.5973 56.7648 31.3308 53.0454 30.1716 50.3887" stroke="#129B93" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.1457 33.3175C11.4264 29.883 10.9528 22.8213 14.8119 22.051C18.671 21.2806 22.5151 26.4658 23.9547 29.1546" stroke="#129B93" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    username: '@ Godwin',
    bio: 'Project Owner of AI-Mon',
    tag: 'AI App',
    color: '#1CCFBC',
    content: <>With TiDB Serverless, setting up a database is as easy as clicking a button. It handles analytics <strong>seamlessly</strong>, without the need for manual scaling. </>,
  },
  {
    avatar: <svg width="72" height="73" viewBox="0 0 72 73" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36.9141" r="35.5" stroke="#707070" />
      <path d="M48.6863 26.1738L54.3276 47.4095L45.3686 49.732V62.0086C41.166 61.7874 31.6991 59.4869 27.452 52.0546" stroke="#AE621B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.1193 22.5239H17.4978" stroke="#AE621B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    username: '@ Eliotte',
    bio: 'a high-school student, the lead developer',
    tag: 'AI App',
    color: '#DD7514',
    content: <>We heavily utilized TiDB&#39;s serverless feature to power our backend.<br />This allowed us to scale our backend to handle thousands of requests per second effortlessly while keeping <strong>costs low</strong>, as we only pay for what we use. </>,
  },
  {
    avatar: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35.5" stroke="#707070" />
      <path d="M35.4805 21.6723L18.9297 39.4198C18.0909 40.3882 16.7792 42.5791 18.2429 43.5944C19.7067 44.6098 26.8324 46.6211 30.2124 47.4999L28.3292 58.9467" stroke="#A9C941" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    username: '@ Thomas Yu ',
    bio: 'Founding Engineer, Chaintool',
    tag: 'Web 3',
    color: '#A9C941',
    content: <>TiDB Serverless&#39;s <strong>automatic scaling capabilities</strong> allow us to swiftly scale up to meet performance demands and scale down during quieter periods for optimizing costs. </>,
  },
];
