import React, { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Dialog, DialogContent, DialogTitle, FormControlLabel, Stack, styled, Switch, TextField } from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { LoadingButton, TreeItem, TreeView } from '@mui/lab';
import { isNullish, notNullish } from '@site/src/utils/value';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import useSWR from 'swr';
import { getQuestionTags, getTags, Question } from '@site/src/api/explorer';
import { useAsyncOperation } from '@site/src/hooks/operation';

export default function QuestionSettings () {
  const [open, setOpen] = useState(false);
  const { question, recommend, updateTags } = useQuestionManagement();

  const { data: tags = [], isValidating: tagsLoading } = useSWR('explore-tags', {
    fetcher: getTags,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const { data: questionTags, isValidating: questionTagsLoading, mutate } = useSWR(notNullish(question) ? [question.id, 'question:tags'] : undefined, {
    fetcher: async (id: string) => await getQuestionTags(id),
  });

  const [localTags, setLocalTags] = useState(questionTags ?? []);
  const { run: handleUpdateTags, loading: updatingTags } = useAsyncOperation({ ids: localTags.map(tag => tag.id) }, updateTags, 'admin-settings');
  useEffect(() => {
    setLocalTags((questionTags ?? []).map(tag => tags.find(t => t.id === tag.id) ?? tag));
  }, [questionTags]);

  const handleClose = useMemoizedFn(() => {
    setOpen(false);
  });

  useEffect(() => {
    if (notNullish(question)) {
      const handleKeypress = (event: KeyboardEvent) => {
        if (event.key === '1' && event.ctrlKey) {
          setOpen(true);
        }
      };
      window.addEventListener('keypress', handleKeypress, { passive: true });

      return () => {
        window.removeEventListener('keypress', handleKeypress);
      };
    }
  }, [question]);

  const handleRecommend = useMemoizedFn((ev: unknown, checked: boolean) => {
    void recommend(checked).then(async () => await mutate());
  });

  if (!question) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Question Settings
      </DialogTitle>
      <DialogContent>
        <Control>
          <FormControlLabel
            disabled={isNullish(question.recommended)}
            control={
              <Switch size="small" checked={question.recommended} onChange={handleRecommend} name="Recommend" />
            }
            label="Recommend"
          />
        </Control>
        <Control>
          <Stack spacing={2} direction="row">
            <Autocomplete
              sx={{ flex: 1 }}
              multiple
              size="small"
              disabled={tagsLoading || questionTagsLoading || updatingTags}
              value={localTags}
              onChange={(e, value) => setLocalTags(value)}
              options={tags}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField {...params} label="Tags" variant="standard" />
              )}
              loading={tagsLoading || questionTagsLoading}
            />
            <LoadingButton loading={updatingTags || tagsLoading || questionTagsLoading} onClick={handleUpdateTags}>
              UPDATE TAGS
            </LoadingButton>
          </Stack>
        </Control>
        <Control>
          <Accordion>
            <AccordionSummary>
              DEBUG INFO
            </AccordionSummary>
            <AccordionDetails>
              <Details question={question} />
            </AccordionDetails>
          </Accordion>
        </Control>
      </DialogContent>
    </Dialog>
  );
}

function Details ({ question }: { question: Question }) {
  return (
    <TreeView
      disableSelection
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
    >
      {Object.entries(question).map(([key, value]) => (
        <Json key={key} label={key} value={value} path={[key]} />
      ))}
    </TreeView>
  );
}

function Json ({ label, value, path }: { label: string, value: any, path: Array<number | string> }) {
  const nodeId = path.join('.');
  if (isNullish(value)) {
    return (
      <TreeItem
        nodeId={nodeId}
        label={(
          <>
            <JsonKey>{label}: </JsonKey>
            <JsonBoolean>null</JsonBoolean>
          </>
        )}
      />
    );
  } else if (typeof value === 'object') {
    if (value instanceof Array) {
      return (
        <TreeItem nodeId={nodeId} label={<JsonKey>{label}: </JsonKey>}>
          {value.map((value, index) => (
            <Json key={index} label={`${index}`} value={value} path={path.concat(index)} />
          ))}
        </TreeItem>
      );
    } else {
      return (
        <TreeItem nodeId={nodeId} label={<JsonKey>{label}: </JsonKey>}>
          {Object.entries(value).map(([key, value]) => (
            <Json key={key} label={key} value={value} path={path.concat(key)} />
          ))}
        </TreeItem>
      );
    }
  } else {
    if (typeof value === 'number') {
      return (
        <TreeItem
          nodeId={nodeId}
          label={(
            <>
              <JsonKey>{label}: </JsonKey>
              <JsonNumber>{value}</JsonNumber>
            </>
          )}
        />
      );
    } else if (typeof value === 'boolean') {
      return (
        <TreeItem
          nodeId={nodeId}
          label={(
            <>
              <JsonKey>{label}: </JsonKey>
              <JsonBoolean>{String(value)}</JsonBoolean>
            </>
          )}
        />
      );
    } else {
      return (
        <TreeItem
          nodeId={nodeId}
          label={(
            <>
              <JsonKey>{label}: </JsonKey>
              <JsonString>{value}</JsonString>
            </>
          )}
        />
      );
    }
  }
}

const Control = styled('div')`
  margin-top: 24px;
`;

const JsonKey = styled('span')`
  font-weight: bold;
  color: #9876AA;
`;

const JsonString = styled('span')`
  color: #6A8759;
`;

const JsonNumber = styled('span')`
  color: #6897BB;
`;

const JsonBoolean = styled('span')`
  color: #CC7832;
`;
