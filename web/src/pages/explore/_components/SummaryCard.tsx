import React, { ReactNode } from 'react';
import { Card, CardContent, Skeleton, styled, Typography } from '@mui/material';

interface SummaryCardProps {
  loading?: boolean;
  children: ReactNode;
}

export default function SummaryCard ({ loading = false, children }: SummaryCardProps) {
  return (
    <SummaryCardRoot elevation={0}>
      <CardContent>
        <Typography variant="h4" display="flex" alignItems="center" fontSize={16} fontFamily="monospace">
          <BotIcon />
          <TitleContent>
            Instant insights
          </TitleContent>
        </Typography>
        <Typography variant="body1" fontSize={14} fontFamily="monospace" mt={2}>
          {loading
            ? (
            <>
              <Skeleton variant="text" width="61%" />
              <Skeleton variant="text" width="31%" />
            </>
              )
            : children}
        </Typography>
      </CardContent>
    </SummaryCardRoot>
  );
}

const SummaryCardRoot = styled(Card)`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.25) 0%, rgba(200, 182, 252, 0.05) 96.73%);
  border: 0;
  margin-bottom: 16px;
`;

const BotIcon = styled('span')`
  display: inline-block;
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;
  width: 24px;
  height: 24px;
`;

const TitleContent = styled('span')`
  margin-left: 12px;
`;
