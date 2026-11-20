/**
 * GitHub accounts whose owners asked us to stop showing their data.
 *
 * A suppressed account gets no profile, organization or repository pages, is left out of
 * search results, and cannot be looked up through this app's data routes.
 *
 * The list is deliberately not in this repository: naming someone here would publish the fact
 * that they asked to be removed. It comes from the SUPPRESSED_GITHUB_ACCOUNTS environment
 * variable, a comma-separated list of `login:id` pairs, for example `some-login:12345,other:678`.
 * Both parts are needed because pages address accounts by login and queries address them by id.
 */
export interface SuppressedAccount {
  login: string;
  id: number;
}

export function parseSuppressedAccounts(value: string | undefined): SuppressedAccount[] {
  const accounts: SuppressedAccount[] = [];
  for (const entry of (value ?? '').split(',')) {
    const [login, id] = entry.trim().split(':');
    if (!login || !/^[A-Za-z0-9-]+$/.test(login) || !/^[0-9]+$/.test(id ?? '')) {
      continue;
    }
    accounts.push({ login: login.toLowerCase(), id: Number(id) });
  }
  return accounts;
}

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
  const logins = new Set(accounts.map((account) => account.login.toLowerCase()));
  const ids = new Set(accounts.map((account) => String(account.id)));

  function isSuppressedLogin(login: string | null | undefined): boolean {
    return !!login && logins.has(login.toLowerCase());
  }

  function isSuppressedAccountId(id: number | string | null | undefined): boolean {
    return id !== null && id !== undefined && ids.has(String(id).trim());
  }

  /** `owner/name`: true when the owner is a suppressed account. */
  function isSuppressedRepoName(fullName: string | null | undefined): boolean {
    return !!fullName && isSuppressedLogin(fullName.split('/')[0]);
  }

  /**
   * Classifies a request that would show a suppressed account.
   * `page` is a document a person opens; `data` is a JSON or image route. Returns null for everything else.
   */
  function suppressedRequestKind(pathname: string, searchParams: URLSearchParams): 'page' | 'data' | null {
    if (logins.size === 0) {
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
