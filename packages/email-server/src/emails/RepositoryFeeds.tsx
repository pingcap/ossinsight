import {
  Mjml,
  MjmlBody,
  MjmlColumn,
  MjmlDivider,
  MjmlGroup,
  MjmlSection,
  MjmlSpacer,
  MjmlText,
} from 'mjml-react';
import {
  leadingRelaxed,
  leadingTight,
  textBase,
  textLg,
} from './components/theme';

import Footer from './components/Footer';
import Head from './components/Head';
import Header from './components/Header';
import React from 'react';

export type RepoMilestoneFeedsProps = {
  name: string;
  repoMilestones: RepoMilestoneToSent[];
};

export interface RepoMilestoneToSent {
  repoId: number;
  repoName: string;
  milestoneId: number;
  milestoneTypeId: number;
  milestoneTypeName: string;
  milestoneNumber: number;
  milestonePayload?: object;
  watchedUserId: number;
}

const RepoMilestoneFeeds: React.FC<RepoMilestoneFeedsProps> = ({
  name,
  repoMilestones,
}) => {
  return (
    <Mjml>
      <Head />
      <MjmlBody width={600}>
        <Header />
        <MjmlSection padding="0 24px" cssClass="smooth">
          <MjmlColumn>
            <MjmlDivider
              borderColor="#666"
              borderStyle="dotted"
              borderWidth="1px"
              padding="8px 0"
            ></MjmlDivider>
            <MjmlText
              padding="24px 0 8px"
              fontSize={textLg}
              lineHeight={leadingTight}
              cssClass="paragraph"
            >
              Repository Feeds
            </MjmlText>
            <MjmlText
              padding="16px 0"
              fontSize={textBase}
              lineHeight={leadingRelaxed}
              cssClass="paragraph"
            >
              Hello {name},
            </MjmlText>
            <MjmlSpacer height="16px" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection padding="0 24px" cssClass="smooth">
          {repoMilestones.map((milestone) => {
            switch (milestone.milestoneTypeName) {
              case 'star-earned':
                return <StarEarnedMilestone milestone={milestone} />;
              default:
                break;
            }
            return null;
          })}
        </MjmlSection>
        <MjmlSection padding="0 24px" cssClass="smooth">
          <MjmlColumn>
            <MjmlText
              padding="16px 0"
              fontSize={textBase}
              lineHeight={leadingRelaxed}
              cssClass="paragraph"
            >
              ♥, The OSSInsight Team
            </MjmlText>
            <MjmlDivider
              borderColor="#666"
              borderStyle="dotted"
              borderWidth="1px"
              padding="20px 0 8px"
            />
          </MjmlColumn>
        </MjmlSection>
        <Footer />
      </MjmlBody>
    </Mjml>
  );
};

const StarEarnedMilestone = ({
  milestone,
}: {
  milestone: RepoMilestoneToSent;
}) => {
  return (
    <MjmlGroup>
      <MjmlColumn>
        <MjmlText
          padding="16px 0"
          fontSize={textBase}
          lineHeight={leadingRelaxed}
          cssClass="paragraph"
        >
          <strong>{milestone.repoName}</strong> has earned{' '}
          {milestone.milestoneNumber}th stars!
        </MjmlText>
      </MjmlColumn>
    </MjmlGroup>
  );
};

export default RepoMilestoneFeeds;
