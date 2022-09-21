import React, { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CoolList, CoolListInstance } from "../../../components/CoolList";
import { styled } from "@mui/material/styles";
import { useRemoteData } from "../../../components/RemoteCharts/hook";
import { InternalQueryRecord } from "@ossinsight/api";
import { highlight } from 'sql-highlight';
import { useEventCallback } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Snackbar from "@mui/material/Snackbar";
import CodeBlock from "@theme/CodeBlock";
import { format as formatSql } from 'sql-formatter';
import Box from "@mui/material/Box";
import { useInterval } from "./useInterval";
import './theme.css';

const getKey = (item: InternalQueryRecord) => item.id;

export default function LiveSql() {
  const ref = useRef<CoolListInstance<InternalQueryRecord>>();
  const intervalHandler = useRef<ReturnType<typeof setInterval>>();

  const dataRef = useRef<[InternalQueryRecord[], number]>([[], 0]);
  const offset = useRef<number>();
  const initData = useRemoteData<{}, InternalQueryRecord>(
    "stats-query-records",
    undefined,
    false,
    true,
    'unique',
  );

  useEffect(() => {
    if (initData.data) {
      dataRef.current = [initData.data.data, 0];
      offset.current = initData.data.data.reduce((max, record) => Math.max(max, record.ts + 1), 0);
    }
  }, [initData.data]);

  const data = useRemoteData<{ offset: number }, InternalQueryRecord>(
    "stats-query-records-latest",
    {
      offset: offset.current,
    },
    false,
    !!offset.current,
    'unique',
  );
  useInterval(data.reload, 5000);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (data.data) {
      const [origin, i] = dataRef.current ?? [[], 0];
      dataRef.current = [origin.slice(i).concat(data.data.data), 0];
      offset.current = data.data.data.reduce((max, record) => Math.max(max, record.ts + 1), offset.current);
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

export function renderSql(record: InternalQueryRecord, onClick: (record: InternalQueryRecord) => void) {
  return (
    <Sql sql={record.digest_text} onClick={() => onClick(record)} />
  );
}

export function Sql({ sql, onClick }: { sql: string, onClick: MouseEventHandler<HTMLSpanElement> | undefined }) {
  const html = useMemo(() => {
    return highlight(sql, {
      html: true,
    });
  }, [sql]);

  return <SqlText dangerouslySetInnerHTML={{ __html: html }} onClick={onClick} />;
}
