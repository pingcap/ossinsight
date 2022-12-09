import { Gap, PlaygroundBody, PlaygroundContainer, PlaygroundDescription, PlaygroundHeadline, PlaygroundMain, PlaygroundSide, QuestionFieldTitle } from './styled';
import { Experimental } from '@site/src/components/Experimental';
import { Button, Tooltip, useEventCallback } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { LoginRequired } from '@site/src/components/LoginRequired';
import QuestionField from './QuestionField';
import PredefinedGroups from './PredefinedGroups';
import SQLEditor from './SQLEditor';
import { isNonemptyString, isNullish } from '@site/src/utils/value';
import LoadingButton from '@mui/lab/LoadingButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ResultBlock from './ResultBlock';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAnalyzeContext } from '@site/src/dynamic-pages/analyze/charts/context';
import { PredefinedQuestion } from './predefined';
import { useAsyncOperation } from '@site/src/hooks/operation';
import { aiQuestion } from '@site/src/api/core';
import { format } from 'sql-formatter';
import { core } from '@site/src/api';

const DEFAULT_QUESTION = 'Who closed the last issue in this repo?';
const QUESTION_MAX_LENGTH = 200;

export default function PlaygroundContent () {
  const { repoName, repoId } = useAnalyzeContext();

  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<PredefinedQuestion>();
  const [customQuestion, setCustomQuestion] = useState('');

  const setCustomQuestionWithMaxLength = useEventCallback((value: string) => {
    setCustomQuestion(oldValue => value.length <= QUESTION_MAX_LENGTH ? value : oldValue);
  });

  const { data, loading, error, run } = useAsyncOperation({ sql: inputValue, type: 'repo', id: `${repoId ?? 'undefined'}` }, core.postPlaygroundSQL);
  const { data: questionSql, loading: questionLoading, error: questionError, run: runQuestion } = useAsyncOperation({ question: customQuestion || DEFAULT_QUESTION, context: { repo_id: repoId, repo_name: repoName } }, aiQuestion);

  const onChange = (newValue: string) => {
    setInputValue(newValue);
    setCurrentQuestion(undefined);
  };

  const handleFormatSQLClick = () => {
    const formattedSQL = format(inputValue, {
      language: 'mysql',
      uppercase: true,
      linesBetweenQueries: 2,
    });
    setInputValue(formattedSQL);
  };

  const handleSelectQuestion = useEventCallback((question: PredefinedQuestion) => {
    const trueSql = [
      { match: 'repoId', value: `${repoId ?? 'undefined'}` },
      { match: 'repoName', value: repoName ?? 'undefined' },
    ].reduce((sql, { match, value }) => sql.replaceAll(`{{${match}}}`, value), question.sql);
    setInputValue(trueSql);
    setCurrentQuestion(question);
  });

  useEffect(() => {
    if (isNonemptyString(questionSql)) {
      setInputValue(format(questionSql, {
        language: 'mysql',
        uppercase: true,
        linesBetweenQueries: 2,
      }));
    }
  }, [questionSql]);

  const defaultInput = useMemo(() => {
    return `
/* ⚠️ 
Playground uses LIMITED resource(cpu/mem), so SQL should add:

WHERE repo_id = ${repoId ?? 'undefined'}

to use index as much as possible, or it will be terminated.


Example:

SELECT
*
FROM
github_events
WHERE
repo_id = ${repoId ?? '{{repoId}}'}
LIMIT
1;
*/
`;
  }, [repoId]);

  return (
    <PlaygroundContainer id="sql-playground-container">
      <PlaygroundBody>
        <PlaygroundSide>
          <PlaygroundHeadline>
            Playground: Customize your queries with SQL
            <Experimental feature="ai-playground">
              <> or AI<span className="opaque">🤖</span>️</>
            </Experimental>
            !
          </PlaygroundHeadline>
          <PlaygroundDescription>
            <li>Choose a question<Experimental feature="ai-playground"><> or create a new one</>
            </Experimental> below
            </li>
            <li>Check or edit the generated SQL（Optional）</li>
            <li>Run your SQL and enjoy your results</li>
          </PlaygroundDescription>
          <Experimental feature="ai-playground">
            <>
              <QuestionFieldTitle>
                Your Question
                <Tooltip title="The result SQL will be generated by AI.">
                  <HelpOutline sx={{ ml: 1 }} fontSize="inherit" />
                </Tooltip>
              </QuestionFieldTitle>
              <LoginRequired promote="Log in to write question" sx={{ mt: 1 }}>
                <QuestionField
                  loading={questionLoading}
                  error={questionError}
                  value={customQuestion}
                  onChange={setCustomQuestionWithMaxLength}
                  onAction={runQuestion}
                  defaultQuestion={DEFAULT_QUESTION}
                  maxLength={QUESTION_MAX_LENGTH}
                />
              </LoginRequired>
            </>
          </Experimental>
          <PredefinedGroups onSelectQuestion={handleSelectQuestion} question={currentQuestion} />
        </PlaygroundSide>
        <PlaygroundMain>
          <SQLEditor
            loading={questionLoading || loading}
            mode="sql"
            theme="twilight"
            onChange={onChange}
            name="SQL_PLAYGROUND"
            showPrintMargin={false}
            value={inputValue || defaultInput}
            fontSize={16}
            setOptions={{
              enableLiveAutocompletion: true,
            }}
            extra={
              <>
                <Button
                  variant="contained"
                  size="small"
                  disabled={!inputValue || isNullish(repoId)}
                  onClick={handleFormatSQLClick}
                >
                  Format
                </Button>
                <LoadingButton
                  variant="contained"
                  size="small"
                  disabled={!inputValue || isNullish(repoId)}
                  onClick={run}
                  endIcon={<PlayArrowIcon fontSize="inherit" />}
                  loading={loading}
                >
                  Run
                </LoadingButton>
              </>
            }
          />
          <Gap />
          <ResultBlock data={data} loading={loading} error={error} />
        </PlaygroundMain>
      </PlaygroundBody>
    </PlaygroundContainer>
  );
}
