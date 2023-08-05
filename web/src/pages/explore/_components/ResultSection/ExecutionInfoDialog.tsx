import { Box, Dialog, Tab, Tabs, useEventCallback } from '@mui/material';
import { Question } from '@site/src/api/explorer';
import CodeBlock from '@theme/CodeBlock';
import React, { useMemo, useState } from 'react';
import { format } from 'sql-formatter';

export interface ExecutionInfoDialogProps {
  question?: Question;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ExecutionInfoDialog ({ question, open, onOpenChange }: ExecutionInfoDialogProps) {
  const [type, setType] = useState<'sql' | 'plan'>('plan');

  const handleClose = useEventCallback(() => {
    onOpenChange?.(false);
  });

  const handleTypeChange = useEventCallback((ev: any, type: string) => {
    setType(type === 'plan' ? 'plan' : 'sql');
  });

  const formattedSql = useMemo(() => {
    try {
      return format(question?.querySQL ?? '', { language: 'mysql' });
    } catch {
      return question?.querySQL ?? '';
    }
  }, [question?.querySQL]);

  const renderChild = () => {
    if (type === 'plan') {
      const executionPlanKeys = ['id', 'estRows', 'task', 'access object', 'operator info'] as const;

      return (
        <Box sx={{ overflowX: 'scroll', color: 'rgb(248, 248, 242)', backgroundColor: 'rgb(40, 42, 54)', borderRadius: 2, py: 2 }} mb={2}>
          <Box display="table" fontFamily="monospace" fontSize={16} lineHeight={1} sx={{ borderSpacing: '16px 0' }}>
            <Box display="table-header-group">
              <Box display="table-row">
                {executionPlanKeys.map(field => (
                  <Box key={field} display="table-cell">{field}</Box>
                ))}
              </Box>
            </Box>
            <Box display="table-footer-group">
              {question?.plan?.map((item, i) => (
                <Box key={i} display="table-row">
                  {executionPlanKeys.map(field => (
                    <Box key={field} display="table-cell" whiteSpace="pre">{item[field]}</Box>
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
          {formattedSql}
        </CodeBlock>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth={true}
    >
      <Tabs onChange={handleTypeChange} value={type} sx={{ mb: 2 }}>
        <Tab label="Execution Plan" value="plan" />
        <Tab label="SQL" value="sql" />
      </Tabs>
      <Box px={2}>
        {renderChild()}
      </Box>
    </Dialog>
  );
}
