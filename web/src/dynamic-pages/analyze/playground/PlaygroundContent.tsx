import { Beta, Gap, Logo, PlaygroundBody, PlaygroundContainer, PlaygroundDescription, PlaygroundHeadline, PlaygroundHeadlineExtra, PlaygroundMain, PlaygroundSide, PlaygroundTips, PlaygroundTipsText, PlaygroundTitle, StyledArrowIcon } from './styled';
import { Experimental } from '@site/src/components/Experimental';
import { Box, Button, Stack, useEventCallback } from '@mui/material';
import QuestionField from './QuestionField';
import PredefinedGroups from './PredefinedGroups';
import SQLEditor from './SQLEditor';
import { isNonemptyString, isNullish, notNullish } from '@site/src/utils/value';
import LoadingButton from '@mui/lab/LoadingButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ResultBlock from './ResultBlock';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAnalyzeContext } from '@site/src/dynamic-pages/analyze/charts/context';
import { getTableSchemaQuestion, PredefinedQuestion } from './predefined';
import { useAsyncOperation } from '@site/src/hooks/operation';
import { format } from 'sql-formatter';
import { core } from '@site/src/api';
import { Favorite, HelpOutline, Twitter } from '@mui/icons-material';
import { twitterLink } from '@site/src/utils/share';
import { useAiQuestion } from './hooks';
import { useAuth0 } from '@auth0/auth0-react';

const DEFAULT_QUESTION = 'Who closed the last issue in this repo?';
const QUESTION_MAX_LENGTH = 200;

export default function PlaygroundContent () {
  const { repoName, repoId } = useAnalyzeContext();

  const [inputValue, setInputValue] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<PredefinedQuestion>();

  const setCustomQuestionWithMaxLength = useEventCallback((value: string) => {
    setCustomQuestion(oldValue => value.length <= QUESTION_MAX_LENGTH ? value : oldValue);
    setCurrentQuestion(undefined);
  });

  const { getAccessTokenSilently } = useAuth0();

  const { data, loading, error, run } = useAsyncOperation({ sql: inputValue, type: 'repo', id: `${repoId ?? 'undefined'}` }, core.postPlaygroundSQL);
  const {
    sql: questionSql,
    resource,
    loading: questionLoading,
    error: questionError,
    run: runQuestion,
  } = useAiQuestion(customQuestion || DEFAULT_QUESTION, repoId, repoName, {
    getAccessToken: getAccessTokenSilently,
  });

  const onChange = (newValue: string) => {
    setInputValue(newValue);
    setCurrentQuestion(undefined);
  };

  const handleFormatSQLClick = () => {
    const formattedSQL = format(inputValue, {
      language: 'mysql',
      linesBetweenQueries: 2,
    });
    setInputValue(formattedSQL);
  };

  const selectSelectTableSchemaQuestion = useEventCallback(() => {
    const question = getTableSchemaQuestion();
    if (notNullish(question)) {
      handleSelectQuestion(question);
    }
  });

  const handleSelectQuestion = useEventCallback((question: PredefinedQuestion) => {
    const trueSql = [
      { match: 'repoId', value: `${repoId ?? 'undefined'}` },
      { match: 'repoName', value: repoName ?? 'undefined' },
    ].reduce((sql, { match, value }) => sql.replaceAll(`{{${match}}}`, value), question.sql);
    setInputValue(trueSql);
    setCustomQuestion(question.title);
    setCurrentQuestion(question);
  });

  useEffect(() => {
    if (isNonemptyString(questionSql)) {
      setInputValue(format(questionSql, {
        language: 'mysql',
        linesBetweenQueries: 2,
      }));
    }
  }, [questionSql]);

  const defaultInput = useMemo(() => {
    return `
/*👋 Hi, there. You can write an SQL statement here.

Not familiar with writing complex SQL statements? Don’t worry. Just type a question in the box on the left, and our AI model will generate the SQL statement for you!
-- 💡 Start with ‘DESC github_events’ to check out the table schema and then have a happy SQL journey!
-- A useful example:

SELECT
*
FROM
github_events
WHERE
repo_id = 41986369 -- (Required)
LIMIT
1;
*/
`;
  }, [repoId]);

  return (
    <PlaygroundContainer id="sql-playground-container">
      <PlaygroundHeadline>
        <PlaygroundTitle>
          <Experimental
            feature="ai-playground"
            fallback={<>Playground: Customize your queries with SQL!</>}
          >
            <>
              Playground: Ask question about {repoName}
              <Beta>Beta</Beta>
            </>
          </Experimental>
        </PlaygroundTitle>
        <PlaygroundHeadlineExtra>
          Repo ID: {repoId}
        </PlaygroundHeadlineExtra>
      </PlaygroundHeadline>
      <PlaygroundBody>
        <Experimental feature="ai-playground" fallback={<PredefinedGroups question={currentQuestion} onSelectQuestion={handleSelectQuestion} />}>
          <PlaygroundSide>
            <PlaygroundTips>
              <PlaygroundTipsText>
                1. Input a Question
              </PlaygroundTipsText>
            </PlaygroundTips>
            <QuestionField
              loading={questionLoading}
              error={questionError}
              value={customQuestion}
              onChange={setCustomQuestionWithMaxLength}
              onAction={runQuestion}
              defaultQuestion={DEFAULT_QUESTION}
              maxLength={QUESTION_MAX_LENGTH}
              question={currentQuestion}
              onSelectQuestion={handleSelectQuestion}
              resource={resource}
            />
            <PlaygroundDescription>
              <p>
                <HelpOutline fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} /> Disclaimer: All outputs are generated by AI. The output may be inaccurate due to imperfections in the model. You can edit the generated SQL statement as you like.
              </p>
              <p>
                <a href="https://github.com/pingcap/ossinsight/discussions" target="_blank" rel="noreferrer">
                  &gt; Join our GitHub discussion 💬
                </a>
                <br />
                <a href={twitterLink(location.href, { title: `Ask question about ${repoName} with OSSInsight!` })} target="_blank" rel="noreferrer">
                  &gt; Share on Twitter <Twitter fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} />
                </a>
              </p>
              <Box flex={1} />
              <p>
                Made with <Favorite fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} /> by <Logo height={20} src="/img/logo.png" alt="OSSInsight Logo" /> and <Logo height={16} src="/img/openai-logo.svg" alt="OpenAI Logo" />
              </p>
            </PlaygroundDescription>
            <StyledArrowIcon />
          </PlaygroundSide>
        </Experimental>
        <PlaygroundMain>
          <PlaygroundTips>
            <Experimental feature="ai-playground">
              <Stack direction="row" justifyContent="space-between" width="100%">
                <PlaygroundTipsText>
                  2. Check/Edit SQL
                </PlaygroundTipsText>
                <Button variant="text" size="small" onClick={selectSelectTableSchemaQuestion}>
                  Show table schema
                </Button>
              </Stack>
            </Experimental>
          </PlaygroundTips>
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
