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
    const value = Number(id);
    if (Number.isSafeInteger(value) && value > 0) accounts.push({login: login.toLowerCase(), id: value});
  }
  return accounts;
}

export function accountSuppression(accounts: ReadonlyArray<SuppressedAccount>) {
  const logins = new Set(accounts.map((account) => account.login.toLowerCase()));
  const ids = new Set(accounts.map((account) => account.id));

  function isSuppressedLogin(login: string | null | undefined): boolean {
    return typeof login === 'string' && logins.has(login.toLowerCase());
  }

  function isSuppressedAccountId(id: number | string | null | undefined): boolean {
    const value = Number(id);
    return Number.isSafeInteger(value) && value > 0 && ids.has(value);
  }

  /** `owner/name`: true when the owner is a suppressed account. */
  function isSuppressedRepoName(fullName: string | null | undefined): boolean {
    return typeof fullName === 'string' && isSuppressedLogin(fullName.split('/')[0]);
  }

  return {isSuppressedLogin, isSuppressedAccountId, isSuppressedRepoName};
}
