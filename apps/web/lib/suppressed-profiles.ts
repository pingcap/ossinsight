import {accountSuppression, parseSuppressedAccounts, type SuppressedAccount} from '@ossinsight/types';
export {parseSuppressedAccounts, type SuppressedAccount};

function segment(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Query parameters that name an account, by id or by login, anywhere in this app's data routes. */
const ACCOUNT_ID_PARAMS = new Set(['userid', 'user_id', 'ownerid', 'owner_id']);
const ACCOUNT_LOGIN_PARAMS = new Set(['login', 'username', 'owner', 'user']);

export function createSuppression(accounts: ReadonlyArray<SuppressedAccount>) {
  const {isSuppressedLogin, isSuppressedAccountId, isSuppressedRepoName} = accountSuppression(accounts);

  /**
   * Classifies a request that would show a suppressed account.
   * `page` is a document a person opens; `data` is a JSON or image route. Returns null for everything else.
   */
  function suppressedRequestKind(pathname: string, searchParams: URLSearchParams): 'page' | 'data' | null {
    if (accounts.length === 0) {
      return null;
    }
    const parts = pathname.split('/').filter(Boolean).map(segment);
    const [first, second, third, fourth] = parts;

    if (first === 'analyze-user' && isSuppressedLogin(second)) {
      return 'page';
    }
    // /analyze/<owner> and /analyze/<owner>/<repo>, including sub-pages and generated images.
    if (first === 'analyze' && isSuppressedLogin(second)) {
      return 'page';
    }
    // /compare/<owner1>/<repo1>/<owner2>/<repo2>
    if (first === 'compare' && (isSuppressedLogin(second) || isSuppressedLogin(fourth))) {
      return 'page';
    }

    if (first === 'gh') {
      if (second === 'users' && isSuppressedLogin(third)) return 'data';
      if (second === 'user' && isSuppressedAccountId(third)) return 'data';
      if (second === 'repo' && isSuppressedLogin(third)) return 'data';
    }
    if (first === 'api' && second === 'avatar' && isSuppressedLogin(third)) {
      return 'data';
    }

    if (first === 'q' || first === 'gh' || first === 'api') {
      for (const [key, value] of searchParams.entries()) {
        const name = key.toLowerCase();
        if (ACCOUNT_ID_PARAMS.has(name) && isSuppressedAccountId(value)) return 'data';
        if (ACCOUNT_LOGIN_PARAMS.has(name) && isSuppressedLogin(value)) return 'data';
      }
    }

    return null;
  }

  return { isSuppressedLogin, isSuppressedAccountId, isSuppressedRepoName, suppressedRequestKind };
}

export const { isSuppressedLogin, isSuppressedAccountId, isSuppressedRepoName, suppressedRequestKind } =
  createSuppression(parseSuppressedAccounts(process.env.SUPPRESSED_GITHUB_ACCOUNTS));
