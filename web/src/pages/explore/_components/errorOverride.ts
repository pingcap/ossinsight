import { QuestionErrorType } from '@site/src/api/explorer';
import { isNullish } from '@site/src/utils/value';

export function getErrorDetails (errorType: QuestionErrorType, error: string | undefined | null) {
  if (isNullish(error)) {
    return undefined;
  }
  switch (errorType) {
    case QuestionErrorType.VALIDATE_SQL:
      if (error.toLowerCase().includes('with repo_name of specified repo')) {
        return 'Maybe you need specify a repo name in your question.';
      }
  }
  return undefined;
}
