import { useEventCallback, Alert, Box, Container, Dialog, Skeleton, Tab, Tabs } from '@mui/material';
import CodeBlock from '@theme/CodeBlock';
import React, { useState } from 'react';
import { useRemoteData } from '../RemoteCharts/hook';
import { getErrorMessage } from '@site/src/utils/error';
import { isNullish, notNullish } from '@site/src/utils/value';

export interface DebugDialogProps {
  sql?: string;
  query: string;
  params?: any;
  open: boolean;
  onClose: () => any;
}

const explainKeywordDict = {
  cop: 'distributed',
  batchCop: 'distributed',
  tikv: 'row',
  tiflash: 'column',
};

const replaceAllKeyword = (str: string | undefined) => {
  if (!str) {
    return str;
  }
  for (const [key, value] of Object.entries(explainKeywordDict)) {
    str = str.replace(new RegExp(key, 'g'), value);
  }
  return str;
};

export const DebugDialog = ({ sql, query, params, open, onClose }: DebugDialogProps) => {
  const [type, setType] = useState<'explain' | 'trace' | null>(null);
  const { data, error } = useRemoteData(`${type ?? 'undefined'}/${query}`, params, false, open && !!type && notNullish(params));

  const handleTabChange = useEventCallback((e: any, type: 'explain' | 'trace') => {
    setType(type);
  });

  const renderChild = () => {
    if (type) {
      if (notNullish(error)) {
        return <Alert severity='error'>Request failed ${getErrorMessage(error)}</Alert>;
      }
      if (isNullish(data)) {
        return (
          <Box sx={{ pt: 0.5 }}>
            <Skeleton width="80%" />
            <Skeleton width="50%" />
            <Skeleton width="70%" />
          </Box>
        );
      }
      return (
        <Box sx={{ overflowX: 'scroll', color: 'rgb(248, 248, 242)', backgroundColor: 'rgb(40, 42, 54)', borderRadius: 2, py: 2 }} mb={2}>
          <Box display='table' fontFamily='monospace' fontSize={16} lineHeight={1} sx={{ borderSpacing: '16px 0' }}>
            <Box display='table-header-group'>
              <Box display='table-row'>
                {data.fields.map(field => (
                  <Box key={field.name} display='table-cell'>{field.name}</Box>
                ))}
              </Box>
            </Box>
            <Box display='table-footer-group'>
            {data.data.map((item, i) => (
              <Box key={i} display='table-row'>
                {data.fields.map(field => (
                  <Box key={replaceAllKeyword(field.name)} display='table-cell' whiteSpace='pre'>{replaceAllKeyword(item[field.name])}</Box>
                ))}
              </Box>
            ))}
            </Box>
          </Box>
        </Box>
      );
    } else {
      return (
        <CodeBlock className="language-sql">
          {sql}
        </CodeBlock>
      );
    }
  };

  return (
    <>
      <Dialog
        open={open}
        maxWidth="xl"
        fullWidth={true}
        onClose={onClose}
      >
        <Container>
          <Tabs value={type} onChange={handleTabChange}>
            <Tab value={null} label="SQL" />
            {/* <Tab value="trace" label="TRACE" /> */}
            <Tab value="explain" label="EXPLAIN" />
          </Tabs>
          <br />
          {renderChild()}
        </Container>
      </Dialog>
    </>
  );
};

export default DebugDialog;
