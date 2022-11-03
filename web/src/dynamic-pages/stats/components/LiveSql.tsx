import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { CoolList, CoolListInstance } from '../../../components/CoolList';
import { useRemoteData } from '../../../components/RemoteCharts/hook';
import { InternalQueryRecord } from '@ossinsight/api';
import { useEventCallback, styled, Dialog, DialogContent, Snackbar, Box } from '@mui/material';
import CodeBlock from '@theme/CodeBlock';
import { format as formatSql } from 'sql-formatter';
import { useInterval } from './useInterval';
import './theme.css';
import { notNullish } from '@site/src/utils/value';

const getKey = (item: InternalQueryRecord) => item.id;

export default function LiveSql () {
  const ref = useRef<CoolListInstance<InternalQueryRecord>>(null);
  const intervalHandler = useRef<ReturnType<typeof setInterval>>();

  const dataRef = useRef<[InternalQueryRecord[], number]>([[], 0]);
  const offset = useRef<number>();
  const initData = useRemoteData<undefined, InternalQueryRecord>(
    'stats-query-records',
    undefined,
    false,
    true,
    'unique',
  );

  useEffect(() => {
    if (notNullish(initData.data)) {
      dataRef.current = [initData.data.data, 0];
      offset.current = initData.data.data.reduce((max, record) => Math.max(max, record.ts + 1), 0);
    }
  }, [initData.data]);

  const data = useRemoteData<{ offset: number }, InternalQueryRecord>(
    'stats-query-records-latest',
    {
      offset: offset.current as number,
    },
    false,
    notNullish(offset.current),
    'unique',
  );
  useInterval(data.reload, 5000);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (notNullish(data.data)) {
      const [origin, i] = dataRef.current ?? [[], 0];
      dataRef.current = [origin.slice(i).concat(data.data.data), 0];
      offset.current = data.data.data.reduce((max, record) => Math.max(max, record.ts + 1), offset.current ?? 0);
    }
  }, [data.data]);

  const start = useCallback(() => {
    clearInterval(intervalHandler.current);
    intervalHandler.current = setInterval(() => {
      const [events, i] = dataRef.current;
      if (i < events.length) {
        events[i].id = `${events[i].id}-${Date.now()}` as any; // prevent duplicated id
        ref.current?.add(events[i]);
        dataRef.current[1]++;
      }
    }, 500);
    setPaused(false);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalHandler.current);
    setPaused(true);
  }, []);

  useEffect(() => {
    start();
    return stop;
  }, []);

  const [record, setRecord] = useState<InternalQueryRecord>();
  const [showDialog, setShowDialog] = useState(false);

  const handleClickRecord = useEventCallback((record: InternalQueryRecord) => {
    setRecord(record);
    setShowDialog(true);
  });

  const handleCloseRecordDialog = useEventCallback(() => {
    setShowDialog(false);
  });

  return (
    <>
      <CoolList
        ref={ref}
        maxLength={20}
        itemHeight={32}
        getKey={getKey}
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {item => renderSql(item, handleClickRecord)}
      </CoolList>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={paused && !showDialog}
        message="Move mouse out to resume"
      />
      <Dialog open={showDialog} onClose={handleCloseRecordDialog} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box>
            Query: {record?.query_name}
          </Box>
          <Box sx={{ my: 2 }}>
            Executed at: {record?.executed_at}
          </Box>
          <CodeBlock className="language-sql">
            {formatSql(record?.digest_text ?? '', { language: 'mysql' })}
          </CodeBlock>
        </DialogContent>
      </Dialog>
    </>
  );
}

const SqlText = styled('span')({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'rgb(248, 248, 242)',
  cursor: 'pointer',
});

export function renderSql (record: InternalQueryRecord, onClick: (record: InternalQueryRecord) => void) {
  return (
    <Sql sql={record.digest_text} onClick={() => onClick(record)} />
  );
}

export function Sql ({ sql, onClick }: { sql: string, onClick: MouseEventHandler<HTMLSpanElement> | undefined }) {
  const [html, setHtml] = useState(sql);

  useEffect(() => {
    try {
      const { highlight } = require('sql-highlight');
      setHtml(highlight(sql, {
        html: true,
      }));
    } catch (e) {
    }
  }, [sql]);

  return <SqlText dangerouslySetInnerHTML={{ __html: html }} onClick={onClick} />;
}
