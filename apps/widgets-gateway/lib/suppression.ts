/**
 * GitHub accounts whose owners asked us to stop showing their data.
 *
 * The list comes from the SUPPRESSED_GITHUB_ACCOUNTS environment variable, a comma-separated
 * list of `login:id` pairs, the same format the web app uses. It is deliberately not in the
 * repository: naming someone here would publish the fact that they asked to be removed.
 */
export interface SuppressedAccount {
  login: string;
  id: string;
}

export function parseSuppressedAccounts(value: string | undefined): SuppressedAccount[] {
  const accounts: SuppressedAccount[] = [];
  for (const entry of (value ?? '').split(',')) {
    const [login, id] = entry.trim().split(':');
    if (!login || !/^[A-Za-z0-9-]+$/.test(login) || !/^[0-9]+$/.test(id ?? '')) {
      continue;
    }
    accounts.push({ login: login.toLowerCase(), id });
  }
  return accounts;
}

/** Widget parameters that name an account by its numeric id. */
const ACCOUNT_ID_PARAMS = ['user_id', 'owner_id'];

/** True when the request would show a widget or page about a suppressed account. */
export function isSuppressedRequest(url: URL, accounts: ReadonlyArray<SuppressedAccount>): boolean {
  if (accounts.length === 0) {
    return false;
  }
  for (const param of ACCOUNT_ID_PARAMS) {
    for (const value of url.searchParams.getAll(param)) {
      if (accounts.some((account) => account.id === value.trim())) {
        return true;
      }
    }
  }
  // /analyze/<login> pages and images of the widget service.
  const [first, second] = url.pathname.split('/').filter(Boolean);
  if (first === 'analyze' && second) {
    let login = second;
    try {
      login = decodeURIComponent(second);
    } catch {
      // keep the raw segment
    }
    return accounts.some((account) => account.login === login.toLowerCase());
  }
  return false;
}
