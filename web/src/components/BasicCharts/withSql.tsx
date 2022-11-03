import React, { PropsWithChildren } from 'react';
import CodeBlock from '@theme/CodeBlock';
import Details from '@theme/Details';

import { Box, Skeleton } from '@mui/material';

export const renderCodes = (sql: string | undefined) => {
  let content;
  if (!sql) {
    content = (
      <Box sx={{ pt: 0.5 }}>
        <Skeleton width="80%" />
        <Skeleton width="50%" />
        <Skeleton width="70%" />
      </Box>
    );
  } else {
    content = (
      <CodeBlock className='language-sql'>
        {sql}
      </CodeBlock>
    );
  }
  return content;
};

export default function ChartWithSql ({ sql, children }: PropsWithChildren<{ sql?: string }>) {
  return (
    <>
      <Details summary={<summary>Click here to expand SQL</summary>}>
        {renderCodes(sql)}
      </Details>
      {children}
    </>
  );
}
