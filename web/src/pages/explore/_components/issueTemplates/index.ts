import { Question, QuestionErrorType } from '@site/src/api/explorer';
import { createIssueLink } from '@site/src/utils/gh';
import { getErrorMessage } from '@site/src/utils/error';
import { format } from 'sql-formatter';

export function makeIssueTemplate (question: Question, errorType?: QuestionErrorType): () => string {
  return () => {
    return createIssueLink('pingcap/ossinsight', {
      title: titleForQuestion(question, errorType),
      body: bodyForQuestion(question, errorType),
      labels: 'area/data-explorer,type/bug',
    });
  };
}

type IssueStringBuild = (question: Question) => string;

const generalErrorTitle: IssueStringBuild = ({ id, title }) => `[Explorer] Some problem for question ${id}: ${title}`;
const generateSqlErrorTitle: IssueStringBuild = ({ id, title }) => `[Explorer] Generate SQL failed for question ${id}: ${title}`;

const executeErrorTitle: IssueStringBuild = ({ id, title }) => `[Explorer] Execution failed for question ${id}: ${title}`;
const emptyResultErrorTitle: IssueStringBuild = ({ id, title }) => `[Explorer] Empty result for question ${id}: ${title}`;
const visualizationErrorTitle: IssueStringBuild = ({ id, title }) => `[Explorer] Visualization failed for question ${id}: ${title}`;

function titleForQuestion (question: Question, errorType?: QuestionErrorType) {
  switch (errorType ?? question.errorType) {
    case QuestionErrorType.ANSWER_GENERATE:
    case QuestionErrorType.ANSWER_PARSE:
    case QuestionErrorType.SQL_CAN_NOT_ANSWER:
    case QuestionErrorType.VALIDATE_SQL:
      return generateSqlErrorTitle(question);
    case QuestionErrorType.QUERY_EXECUTE:
    case QuestionErrorType.QUERY_TIMEOUT:
      return executeErrorTitle(question);
    case QuestionErrorType.EMPTY_RESULT:
      return emptyResultErrorTitle(question);
    case QuestionErrorType.VALIDATE_CHART:
      return visualizationErrorTitle(question);
    default:
      return generalErrorTitle(question);
  }
}

function questionLink (id: string, title: string) {
  return `[${id} ${title}](https://ossinsight.io/explore/?id=${id})`;
}

function sqlInfo (sql: string | undefined | null) {
  function formatSql (sql: string) {
    try {
      return format(sql, { language: 'mysql' });
    } catch (e) {
      return sql;
    }
  }

  return `
## Generated SQL
\`\`\`mysql
${formatSql(sql ?? '')}
\`\`\`
`;
}

function chartInfo (chart: Question['chart']) {
  return `
## Chart:
\`\`\`json
${JSON.stringify(chart, undefined, 2)}
\`\`\`
`;
}

function resultInfo (result: Question['result']) {
  return `
## Result:
\`\`\`json
// Fields
  ${JSON.stringify(result?.fields, undefined, 2)}

// First result (Totally ${result?.rows.length ?? 0} rows)
  ${JSON.stringify(result?.rows?.[0], undefined, 2)}
\`\`\`
`;
}

function errorInfo (error: Question['error']) {
  return `
## Error message
\`\`\`
${getErrorMessage(error)}
\`\`\`
`;
}

const generalErrorBody: IssueStringBuild = ({ id, title, chart, result, querySQL, errorType }) => `
Hi, I have some problems with the question ${questionLink(id, title)} (errorType = ${errorType ?? 'none'}):
<!-- Describe your question -->

${sqlInfo(querySQL)}

${chartInfo(chart)}

${resultInfo(result)}
`;

const generateSqlErrorBody: IssueStringBuild = ({ id, title, errorType, error }) => `
Hi, I have some problems with the question ${questionLink(id, title)} (errorType = ${errorType ?? 'none'}):
<!-- Extra info Here -->

${errorInfo(error)}
`;

const executeSqlErrorBody: IssueStringBuild = ({ id, title, errorType, error, querySQL, executedAt, requestedAt }) => `
Hi, It's failed to execute the question ${questionLink(id, title)} (errorType = ${errorType ?? 'none'}):
<!-- Extra info Here -->

- executedAt: ${executedAt ?? 'unknown'}
- requestedAt: ${executedAt ?? 'unknown'}

${errorInfo(error)}

${sqlInfo(querySQL)}
`;

const emptyResultErrorBody: IssueStringBuild = ({ id, title, errorType, error, querySQL, executedAt, requestedAt }) => `
Hi, The result is empty for question ${questionLink(id, title)} (errorType = ${errorType ?? 'none'}):
<!-- Extra info Here -->

- executedAt: ${executedAt ?? 'unknown'}
- requestedAt: ${executedAt ?? 'unknown'}

${errorInfo(error)}

${sqlInfo(querySQL)}
`;

const visualizationErrorBody: IssueStringBuild = ({ id, title, chart, result, querySQL, errorType }) => `
Hi, Visualization failed for question ${questionLink(id, title)} (errorType = ${errorType ?? 'none'}):
<!-- Extra info Here -->

${sqlInfo(querySQL)}

${chartInfo(chart)}

${resultInfo(result)}
`;

function bodyForQuestion (question: Question, errorType?: QuestionErrorType) {
  switch (errorType ?? question.errorType) {
    case QuestionErrorType.ANSWER_GENERATE:
    case QuestionErrorType.ANSWER_PARSE:
    case QuestionErrorType.SQL_CAN_NOT_ANSWER:
    case QuestionErrorType.VALIDATE_SQL:
      return generateSqlErrorBody(question);
    case QuestionErrorType.QUERY_EXECUTE:
    case QuestionErrorType.QUERY_TIMEOUT:
      return executeSqlErrorBody(question);
    case QuestionErrorType.EMPTY_RESULT:
      return emptyResultErrorBody(question);
    case QuestionErrorType.VALIDATE_CHART:
      return visualizationErrorBody(question);
    default:
      return generalErrorBody(question);
  }
}
